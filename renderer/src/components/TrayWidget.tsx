import * as React from "react";
import styled from "@emotion/styled";

const S = {
    Tray: styled.div`
        min-width: 200px;
        background: rgb(20, 20, 20);
        flex-grow: 0;
        flex-shrink: 0;
        float: left;
    `,
};

export const TrayWidget = (props: { children?: any }) => <S.Tray>{props.children}</S.Tray>;
