import * as React from "react";
import { TrayItemWidgetProps, TrayItemWidget } from "./TrayItemWidget";
import { DiagramModelGenerics, DiagramModel, DagreEngine, DiagramEngine, PathFindingLinkFactory } from "@projectstorm/react-diagrams";
import { createNode, fromNode, NodeCreator } from "./DiagramHelpers";
import { Point } from "@projectstorm/geometry";

const fs = window.require("fs");

const remote = window.require("electron").remote;

interface ItemAndWidget {
    widget: React.ReactElement<TrayItemWidgetProps>;
    item: BasicItem;
}

export interface BasicItem {
    id: number;
    name: string;
    dependencies: Array<number>;
}

export interface Machines {
    machines: {
        tech: Array<BasicItem>;
    };
}

export interface Items {
    items: Array<BasicItem>;
}

export class ConfigManager {
    private _machines: Machines = { machines: { tech: [] } };
    private _items: Items = { items: [] };
    private _machinesAndItems: Array<ItemAndWidget> = [];
    private _degreEngine: DagreEngine;

    public MachinesAndItems = () => this._machinesAndItems;

    public constructor(private _diagramModel: DiagramModel<DiagramModelGenerics>, private _diagramEngine: DiagramEngine) {
        this._degreEngine = new DagreEngine({
            graph: {
                rankdir: "LR",
                ranker: "tight-tree",
                marginx: 100,
                marginy: 100,
                nodesep: 100,
                ranksep: 200,
            },
            includeLinks: true,
        });
    }

    public Filter(search: string): React.ReactElement<TrayItemWidgetProps>[] {
        return this._machinesAndItems.filter(mi => mi.item.name.toUpperCase().includes(search.toUpperCase())).map(mi => mi.widget);
    }

    private rebuildDependencies() {
        // first get all the items that need a node
        const itemsToPlace: number[] = [];

        for (const item of this._machinesAndItems) {
            if (item.item.dependencies && item.item.dependencies.length > 0) {
                itemsToPlace.push(item.item.id);
                for (const dep of item.item.dependencies) {
                    itemsToPlace.push(dep);
                }
            }
        }

        // then place the nodes
        const nodes: { [id: number]: NodeCreator } = {};
        for (const id of Array.from(new Set(itemsToPlace))) {
            for (const item of this._machinesAndItems) {
                if (item.item.id === id) {
                    nodes[id] = createNode(item.item.id, item.item.name, "rbg(200, 200, 200)").atPosition(new Point(50, 50));
                    break;
                }
            }
        }

        // add the links
        for (const item of this._machinesAndItems) {
            if (item.item.dependencies && item.item.dependencies.length > 0) {
                for (const dep of item.item.dependencies) {
                    const from = nodes[dep];
                    const to = nodes[item.item.id];

                    to.addDependency(from.Node);
                }
            }
        }

        for (const node in nodes) nodes[node].addToModel(this._diagramModel);

        this._degreEngine.redistribute(this._diagramModel);
        this._diagramEngine.getLinkFactories().getFactory<PathFindingLinkFactory>(PathFindingLinkFactory.NAME);
        this._diagramEngine.repaintCanvas();
    }

    private processItems = (items: Items) => {
        this._items = items;
        for (let item of items.items) {
            this._machinesAndItems.push({
                widget: <TrayItemWidget name={item.name} id={item.id} key={item.id} color="rgb(255, 265,0)" />,
                item: item,
            });
        }
    };

    private processMachines = (machines: Machines) => {
        this._machines = machines;
        for (let machine of machines.machines.tech) {
            this._machinesAndItems.push({
                widget: <TrayItemWidget name={machine.name} id={machine.id} key={machine.id} color="rgb(0,192,255)" />,
                item: machine,
            });
        }
    };

    private processRawData = (raw_data: string) => {
        let jsObject = JSON.parse(raw_data);
        if (jsObject.machines) this.processMachines(jsObject as Machines);
        if (Object.keys(jsObject).some(k => k == "items")) this.processItems(jsObject as Items);
    };

    public importConfigs = (finished: () => void) => {
        let config_files: Array<string> = remote.dialog.showOpenDialog({ properties: ["openFile", "multiSelections"] });
        if (config_files.length != 2) throw "Must import machines and items";

        fs.readFile(config_files[0], "utf8", (err: any, raw_data: string) => {
            if (err) return console.log(err);
            this.processRawData(raw_data);

            fs.readFile(config_files[1], "utf8", (err: any, raw_data: string) => {
                if (err) return console.log(err);
                this.processRawData(raw_data);

                this.rebuildDependencies();

                finished();
            });
        });
    };

    private getIdFromName(name: string) {
        return Number(name.split(":")[0]);
    }

    public exportConfigs = () => {
        for (const machine of this._machines.machines.tech) machine.dependencies = [];
        for (const item of this._items.items) item.dependencies = [];

        const diagram = this._diagramModel.serialize();
        const nodes = diagram.layers.find(l => l.type == "diagram-nodes");
        const links = diagram.layers.find(l => l.type == "diagram-links");

        if (nodes && links) {
            type Model = { id: string; name: string; portsInOrder: string[] };
            let models_array: Array<Model> = [];
            let links_array: Array<{ source: string; sourcePort: string; target: string; targetPort: string }> = [];
            for (const node of Object.keys(nodes.models)) models_array.push(nodes.models[node] as any); // hack because typings are wrong
            for (const link of Object.keys(links.models)) links_array.push(links.models[link] as any); // hack because typings are wrong

            for (const model of models_array) {
                const id = this.getIdFromName(model.name);

                let item = this._machines.machines.tech.find(m => m.id == id);
                if (!item) item = this._items.items.find(i => i.id == id);
                if (!item) throw `How did you place a node not in files?? (name: ${model.name}`;

                // the following is some confusing shizen. See `node data is a mess.png` to see how teh data really looks
                const in_port = model.portsInOrder[0]; // we only care about the "in" port of a node

                // the `in` port could be either the sourcePort or the targetPort
                for (const link of links_array) {
                    let dependency: Model | undefined = undefined;
                    if (link.sourcePort == in_port) dependency = models_array.find(m => m.id == link.target);
                    if (link.targetPort == in_port) dependency = models_array.find(m => m.id == link.source);

                    if (dependency) item.dependencies.push(this.getIdFromName(dependency.name));
                }
            }
        }

        const items_path = remote.dialog.showSaveDialog({ defaultPath: "items_config.json" });
        fs.writeFile(items_path, JSON.stringify(this._items, undefined, "\t"), (err: any) => (err ? console.error(err) : undefined));
        const machines_path = remote.dialog.showSaveDialog({ defaultPath: "machines_config.json" });
        fs.writeFile(machines_path, JSON.stringify(this._machines, undefined, "\t"), (err: any) => (err ? console.error(err) : undefined));
    };
}
