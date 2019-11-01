import React from "react";
import { IpcRenderer, IpcMessageEvent } from "electron";
import { Application } from "./Application";
import { BodyWidget } from './components/BodyWidget';

const electron = window.require("electron"); // require electron like this in all the files. Don't Use import from 'electron' syntax for importing IpcRender from electron.

let ipcRenderer: IpcRenderer = electron.ipcRenderer;

ipcRenderer.on("response", (event: IpcMessageEvent, args: any) => {
    console.log(args);
});

const App: React.FC = () => {
    var app = new Application();
    
    return (
        <BodyWidget app={app} />
    );
};

export default App;

