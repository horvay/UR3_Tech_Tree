import * as React from "react";
import * as _ from "lodash";
import { TrayWidget } from "./TrayWidget";
import { Application } from "../Application";
import { TrayItemWidget, TrayItemWidgetProps } from "./TrayItemWidget";
import { DefaultNodeModel } from "@projectstorm/react-diagrams";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { DemoCanvasWidget } from "./DemoCanvasWidget";
import styled from "@emotion/styled";

// import * as fs from "fs";
const fs = window.require("fs");

const remote = window.require("electron").remote;

export interface BodyWidgetProps {
    app: Application;
}

export interface BodyWidgetState {
    items: Array<React.ReactElement<TrayItemWidgetProps>>;
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

const S = {
    Body: styled.div`
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        min-height: 100%;
        overflow: none;
    `,

    Header: styled.div`
        display: flex;
        background: rgb(30, 30, 30);
        flex-grow: 0;
        flex-shrink: 0;
        color: white;
        font-family: Helvetica, Arial, sans-serif;
        padding: 10px;
        align-items: center;
    `,

    Content: styled.div`
        display: flex;
        flex-grow: 1;
    `,

    Layer: styled.div`
        position: relative;
        flex-grow: 1;
    `,
};

export class BodyWidget extends React.Component<BodyWidgetProps, BodyWidgetState> {
    private machines: Machines = { machines: { tech: [] } };
    private items: Items = { items: [] };

    constructor(props: BodyWidgetProps) {
        super(props);

        this.state = { items: [] };
    }

    private processItems(items: Items) {
        let new_items: Array<React.ReactElement<TrayItemWidgetProps>> = [];
        this.items = items;
        for (let item of items.items) {
            new_items.push(<TrayItemWidget name={item.name} id={item.id} key={item.id} color="rgb(192, 255,0)" />);
        }
        this.setState({ items: [...this.state.items, ...new_items] });
    }

    private processMachines(machines: Machines) {
        let new_items: Array<React.ReactElement<TrayItemWidgetProps>> = [];
        this.machines = machines;
        for (let machine of machines.machines.tech) {
            new_items.push(<TrayItemWidget name={machine.name} id={machine.id} key={machine.id} color="rgb(0,192,255)" />);
        }
        this.setState({ items: [...this.state.items, ...new_items] });
    }

    private processRawData(raw_data: string) {
        let jsObject = JSON.parse(raw_data);
        if (jsObject.machines) this.processMachines(jsObject as Machines);
        if (Object.keys(jsObject).some(k => k == "items")) this.processItems(jsObject as Items);
    }

    private importConfigs = () => {
        let config_files: Array<string> = remote.dialog.showOpenDialog({ properties: ["openFile", "multiSelections"] });
        if (config_files.length != 2) throw "Must import machines and items";

        fs.readFile(config_files[0], "utf8", (err: any, raw_data: string) => {
            if (err) return console.log(err);
            this.processRawData(raw_data);
        });

        fs.readFile(config_files[1], "utf8", (err: any, raw_data: string) => {
            if (err) return console.log(err);
            this.processRawData(raw_data);
        });
    };

    private getIdFromName(name: string) {
        return Number(name.split(":")[0]);
    }

    private exportConfigs = () => {
        for(const machine of this.machines.machines.tech) machine.dependencies = [];
        for(const item of this.items.items) item.dependencies = [];

        const diagram = this.props.app.getActiveDiagram().serialize();
        const nodes = diagram.layers.find(l => l.type == "diagram-nodes");
        const links = diagram.layers.find(l => l.type == "diagram-links");

        if (nodes && links) {
            type Model = { id: string, name: string; portsInOrder: string[] };;
            let models_array: Array<Model> = [];
            let links_array: Array<{ source: string; sourcePort: string; target: string; targetPort: string }> = [];
            for (const node of Object.keys(nodes.models)) models_array.push(nodes.models[node] as any); // hack because typings are wrong
            for (const link of Object.keys(links.models)) links_array.push(links.models[link] as any); // hack because typings are wrong

            for (const model of models_array) {
                const id = this.getIdFromName(model.name);

                let item = this.machines.machines.tech.find(m => m.id == id);
                if (!item) item = this.items.items.find(i => i.id == id);
                if (!item) throw `How did you place a node not in files?? (name: ${model.name}`;

                // the following is some confusing shizen. See `node data is a mess.png` to see how teh data really looks
                const in_port = model.portsInOrder[0]; // we only care about the "in" port of a node

                // the `in` port could be either the sourcePort or the targetPort
                for(const link of links_array)
                {
                    let dependency: Model | undefined = undefined;
                    if (link.sourcePort == in_port) dependency = models_array.find(m => m.id == link.target)
                    if (link.targetPort == in_port) dependency = models_array.find(m => m.id == link.source)

                    if (dependency) item.dependencies.push(this.getIdFromName(dependency.name));
                }
            }
        }

        const items_path = remote.dialog.showSaveDialog({defaultPath: "items_config.json"});
        fs.writeFile(items_path, JSON.stringify(this.items, undefined, "\t"), (err: any) => err ? console.error(err) : undefined);
        const machines_path = remote.dialog.showSaveDialog({defaultPath: "machines_config.json"});
        fs.writeFile(machines_path, JSON.stringify(this.machines, undefined, "\t"), (err: any) => err ? console.error(err) : undefined);
    };

    public render() {
        return (
            <S.Body>
                <S.Header>
                    <div key="1" className="title">
                        Space Force Tech Tree ----{" "}
                    </div>
                    &nbsp;
                    <button onClick={this.importConfigs}>Import Configs</button>
                    &nbsp;
                    <button onClick={this.exportConfigs}>Export Configs</button>
                </S.Header>
                <S.Content>
                    <TrayWidget>{this.state.items}</TrayWidget>
                    <S.Layer
                        onDrop={event => {
                            let data = JSON.parse(event.dataTransfer.getData("storm-diagram-node"));

                            let node = new DefaultNodeModel(`${data.id}: ${data.name}`, data.color);
                            node.addInPort("Dep");
                            node.addOutPort("Leads");

                            let point = this.props.app.getDiagramEngine().getRelativeMousePoint(event);
                            node.setPosition(point);
                            this.props.app
                                .getDiagramEngine()
                                .getModel()
                                .addNode(node);
                            this.props.app.getDiagramEngine().repaintCanvas();
                            this.forceUpdate();
                        }}
                        onDragOver={event => {
                            event.preventDefault();
                        }}
                    >
                        <DemoCanvasWidget>
                            <CanvasWidget engine={this.props.app.getDiagramEngine()} />
                        </DemoCanvasWidget>
                    </S.Layer>
                </S.Content>
            </S.Body>
        );
    }
}
