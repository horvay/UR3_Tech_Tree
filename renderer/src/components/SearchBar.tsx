import * as React from "react";
import styled from "@emotion/styled";

const S = {
    Container: styled.div`
        width: 100%;
        padding: 5px;
    `,
};

export const SearchBar = (props: { onChange: (search: string) => void }) => {
    const [search, setSearch] = React.useState<string>("");

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.currentTarget.value);
        props.onChange(e.currentTarget.value);
    };

    return (
        <S.Container>
            <input onChange={onChange} value={search}></input>
        </S.Container>
    );
};
