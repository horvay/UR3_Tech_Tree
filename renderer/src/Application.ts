import * as SRD from "@projectstorm/react-diagrams";

/**
 * @author Dylan Vorster
 */
export class Application {
    protected activeModel: SRD.DiagramModel | undefined;
	
    protected diagramEngine: SRD.DiagramEngine;

    constructor() {
        this.diagramEngine = SRD.default();
        this.newModel();
    }

    public newModel() {
        this.activeModel = new SRD.DiagramModel();
        this.diagramEngine.setModel(this.activeModel);
    }

    public getActiveDiagram(): SRD.DiagramModel {
        if (!this.activeModel) throw "NO ACTIVE MODEL";
        return this.activeModel;
    }

    public getDiagramEngine(): SRD.DiagramEngine {
        return this.diagramEngine;
    }
}
