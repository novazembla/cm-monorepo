import React from "react";
// import { /* Controller */, useFormContext } from 'react-hook-form'

type ComponentProps = {
  name: string;
  label: string;
  color: string;
  disabled: boolean;
  defaultValue: boolean;
};

const ReconomeFieldCheckboxRow = ({
  name,
  label,
  color,
  disabled,
  defaultValue = false,
}: ComponentProps) => {
  // const { control } = useFormContext();
  return <></>;
  // return <FormControlLabel
  //   control={<Controller
  //     render={({ onChange, onBlur, value }) => (
  //       <Checkbox
  //         onBlur={onBlur}
  //         onChange={e => onChange(e.target.checked)}
  //         checked={value}
  //         id={name}
  //         color={color}
  //         name={name}
  //         disabled={disabled}
  //         key={`key-${name}`}
  //       />
  //     )}
  //     name={name}
  //     control={control}
  //     defaultValue={defaultValue} 
  //   />}
  //   label={label}
  //   htmlFor={name}
  //   disabled={disabled}
  // />
};

export default ReconomeFieldCheckboxRow;
