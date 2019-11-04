import * as React from "react";
import styled from "@emotion/styled";

const S = {
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
};

export const Header = (props: { importClick: () => void; exportClick: () => void }) => {
    return (
        <S.Header>
            <div key="1" className="title">
                Space Force Tech Tree ----{" "}
            </div>
            &nbsp;
            <button onClick={props.importClick}>Import Configs</button>
            &nbsp;
            <button onClick={props.exportClick}>Export Configs</button>
        </S.Header>
    );
};
