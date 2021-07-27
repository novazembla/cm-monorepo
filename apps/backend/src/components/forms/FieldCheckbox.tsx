import React from "react";

import { Checkbox } from "@chakra-ui/react";

// import { useFormContext } from 'react-hook-form'

export const FieldCheckbox = ({
  name,
  label,
  disabled = false,
  defaultValue = false,
}: {
  name: string;
  label: string;
  disabled?: boolean;
  defaultValue?: boolean;
}) => {
  // const { control } = useFormContext();


  return <Checkbox name={name} isDisabled={disabled} defaultChecked={defaultValue} isRequired>
  {label}
</Checkbox>;
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

export default FieldCheckbox;
