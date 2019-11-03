import * as React from "react";
import styled from "@emotion/styled";

const S = {
    Container: styled.div`
        width: 100%;
        padding: 5px;
    `,
};

let refInput: React.RefObject<HTMLInputElement>;

const onKeyUp = (e: KeyboardEvent) => {
    if (e.key == "F1") {
        if (refInput.current) refInput.current.focus();
    }
};

window.removeEventListener("keyup", onKeyUp);
window.addEventListener("keyup", onKeyUp, true);

export const SearchBar = (props: { onChange: (search: string) => void }) => {
    const [search, setSearch] = React.useState<string>("");
    const ref = React.useRef<HTMLInputElement>(null);
    refInput = ref;

    const updateSearch = (newSearch: string) => {
        setSearch(newSearch);
        props.onChange(newSearch);
    }
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => updateSearch(e.currentTarget.value);

    if (ref.current) {
        ref.current.removeEventListener("focus", () => updateSearch(""));
        ref.current.addEventListener("focus", () => updateSearch(""));
    }

    return (
        <S.Container>
            <input ref={ref} placeholder="item search" onChange={onChange} value={search}></input>
        </S.Container>
    );
};
