import * as React from "react";
import styled from "@emotion/styled";

const S = {
    Tray: styled.div`
        min-width: 200px;
        background: rgb(20, 20, 20);
        flex-grow: 0;
        flex-shrink: 0;
        overflow-y: scroll;
        float: left;
    `
}

export class TrayWidget extends React.Component {
    render() {
        return <S.Tray>{this.props.children}</S.Tray>;
    }
}
