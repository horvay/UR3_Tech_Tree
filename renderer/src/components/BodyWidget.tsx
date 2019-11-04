import * as React from "react";
import * as _ from "lodash";
import { ConfigManager } from "./ConfigManager";
import { TrayWidget } from "./TrayWidget";
import { Application } from "../Application";
import { TrayItemWidgetProps } from "./TrayItemWidget";
import styled from "@emotion/styled";
import { SearchBar } from "./SearchBar";
import { Header } from "./Header";
import { TechTreeCanvas } from "./TechTreeCanvas";

// import * as fs from "fs";

export interface BodyWidgetProps {
    app: Application;
}

export interface BodyWidgetState {
    items: Array<React.ReactElement<TrayItemWidgetProps>>;
}

const S = {
    Body: styled.div`
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        min-height: 100%;
        overflow: none;
    `,

    Content: styled.div`
        display: flex;
        flex-grow: 1;
    `,
};

let configManager: ConfigManager;

export const BodyWidget = (props: BodyWidgetProps) => {
    const [state, setState] = React.useState<BodyWidgetState>({ items: [] });

    if (!configManager) configManager = new ConfigManager(props.app.getActiveDiagram(), props.app.getDiagramEngine());

    const onSearchChange = (search: string) => setState({ items: configManager.Filter(search) });

    const importConfigs = () => configManager.importConfigs(() => setState({ items: configManager.MachinesAndItems().map(mi => mi.widget) }));
    const exportConfigs = () => configManager.exportConfigs();

    return (
        <S.Body>
            <Header importClick={importConfigs} exportClick={exportConfigs} />
            <S.Content>
                <TrayWidget>
                    <SearchBar key={"search"} onChange={onSearchChange} />
                    {state.items}
                </TrayWidget>
                <TechTreeCanvas diagramEngine={props.app.getDiagramEngine()} />
            </S.Content>
        </S.Body>
    );
};
