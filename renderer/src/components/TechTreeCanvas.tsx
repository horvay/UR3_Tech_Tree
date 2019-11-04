import * as React from "react";
import styled from "@emotion/styled";
import { DefaultNodeModel, DiagramEngine } from "@projectstorm/react-diagrams";
import { DemoCanvasWidget } from "./DemoCanvasWidget";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { createNode } from './DiagramHelpers';

const S = {
    Layer: styled.div`
        position: relative;
        flex-grow: 1;
    `,
};

export const TechTreeCanvas = (props: { diagramEngine: DiagramEngine }) => (
    <S.Layer
        onDrop={event => {
            const data = JSON.parse(event.dataTransfer.getData("storm-diagram-node"));
            const point = props.diagramEngine.getRelativeMousePoint(event);

            createNode(data.id, data.name, data.color)
                .atPosition(point)
                .addToModel(props.diagramEngine.getModel());

            props.diagramEngine.repaintCanvas();
        }}
        onDragOver={event => {
            event.preventDefault();
        }}
    >
        <DemoCanvasWidget>
            <CanvasWidget engine={props.diagramEngine} />
        </DemoCanvasWidget>
    </S.Layer>
);
