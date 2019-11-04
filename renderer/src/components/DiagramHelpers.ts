import { DefaultNodeModel, DiagramEngine, DefaultPortModel, DiagramModelGenerics, DiagramModel, LinkModel } from "@projectstorm/react-diagrams";
import { Point } from "@projectstorm/geometry";

export class NodeCreator {
    public Node: DefaultNodeModel;
    public Dep: DefaultPortModel;
    public Lead: DefaultPortModel;
    public Links: LinkModel[] = [];

    public constructor(node: { id: number; name: string; color: string } | DefaultNodeModel) {
        if (node instanceof DefaultNodeModel) {
            this.Node = node;
            this.Dep = node.getInPorts()[0];
            this.Lead = node.getOutPorts()[0];
        } else {
            this.Node = new DefaultNodeModel(`${node.id}: ${node.name}`, node.color);
            this.Dep = this.Node.addInPort("Dep");
            this.Lead = this.Node.addOutPort("Leads");
        }
    }

    public addDependency(dep: DefaultNodeModel) {
        this.Links.push(dep.getOutPorts()[0].link(this.Dep));
        return this;
    }

    public andConnectNodes(nodeFrom: DefaultNodeModel, nodeTo: DefaultNodeModel, engine: DiagramEngine) {
        //just to get id-like structure
        const portOut = nodeFrom.addPort(new DefaultPortModel(true, `${(nodeFrom as any).name}-out-${1}`, "Out"));
        const portTo = nodeTo.addPort(new DefaultPortModel(false, `${(nodeFrom as any).name}-to-${1}`, "IN"));
        portOut.link(portTo);

        return this;
        // ################# UNCOMMENT THIS LINE FOR PATH FINDING #############################
        // return portOut.link(portTo, engine.getLinkFactories().getFactory(PathFindingLinkFactory.NAME));
        // #####################################################################################
    }

    public atPosition(point: Point) {
        this.Node.setPosition(point);
        return this;
    }

    public addToModel(model: DiagramModel<DiagramModelGenerics>) {
        model.addAll(this.Node, ...this.Links);
        return this;
    }
}

export function createNode(id: number, name: string, color: string) {
    return new NodeCreator({ id, name, color });
}

export function fromNode(node: DefaultNodeModel) {
    return new NodeCreator(node);
}
