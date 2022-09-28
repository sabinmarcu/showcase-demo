import styled from "@emotion/styled";
import "./styles.css";

import { Showcase } from "./components/Showcase";
import { ChangeEvent, useCallback, useState } from "react";
import { FormControlLabel, Switch, TextField } from "@mui/material";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const useToggle = (initialValue: boolean = false) => {
  const [is, setIs] = useState(initialValue);
  const toggle = useCallback(() => setIs((it) => !it), [setIs]);
  return [is, toggle] as const;
};

export default function App() {
  const [size, setSize] = useState<number>(200);
  const onChangeSize = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      setSize(parseInt(value, 10));
    },
    [setSize]
  );
  const [debug, toggleDebug] = useToggle(false);
  const [shadow, toggleShadow] = useToggle(true);
  const [reflection, toggleReflection] = useToggle(true);
  const [radialReflection, toggleRadialReflection] = useToggle(true);
  return (
    <div className="App">
      <h1>Showcase Demo</h1>
      <Wrapper>
        <TextField
          label="Size (in px)"
          variant="outlined"
          type="number"
          value={size}
          onChange={onChangeSize}
        />
      </Wrapper>
      <Wrapper>
        <FormControlLabel
          control={<Switch checked={debug} onChange={toggleDebug} />}
          label="Debug"
        />
        <FormControlLabel
          control={<Switch checked={shadow} onChange={toggleShadow} />}
          label="Shadows"
        />
        <FormControlLabel
          control={<Switch checked={reflection} onChange={toggleReflection} />}
          label="Reflection"
        />
        <FormControlLabel
          control={
            <Switch
              checked={radialReflection}
              onChange={toggleRadialReflection}
            />
          }
          label="Use Radial Reflection"
        />
      </Wrapper>
      <Wrapper>
        <Showcase
          {...{ size, debug, reflection, shadow, radialReflection }}
          src="https://cdn-products.eneba.com/resized-products/kb003ljwkc8hxmlrwpkg_350x200_2x-0.jpg"
        />
        <Showcase
          {...{ size, debug, reflection, shadow, radialReflection }}
          src="https://image.api.playstation.com/vulcan/ap/rnd/202010/0605/s9anMLJErDUXJTbBOoKSiqiv.png"
        />
        <Showcase
          {...{ size, debug, reflection, shadow, radialReflection }}
          src="https://static.wikia.nocookie.net/wolfenstein/images/3/39/WTOB_Cover.jpg"
        />
      </Wrapper>
    </div>
  );
}
