import * as React from "react";
import styled from "@emotion/styled";

export interface TrayItemWidgetProps {
    color?: string;
    name: string;
    id: number;
}

const S = {
    Tray: styled.div<{ color: string }>`
        color: white;
        font-family: Helvetica, Arial;
        padding: 5px;
        margin: 0px 10px;
        border: solid 1px ${p => p.color};
        border-radius: 5px;
        margin-bottom: 2px;
        cursor: pointer;
    `,
};

export const TrayItemWidget = (props: TrayItemWidgetProps) => {
    return (
        <S.Tray
            color={props.color || ""}
            draggable={true}
            onDragStart={event => {
                event.dataTransfer.setData(
                    "storm-diagram-node",
                    JSON.stringify({ name: props.name, id: props.id, color: props.color }),
                );
            }}
            className="tray-item"
        >
            {props.name}
        </S.Tray>
    );
};
