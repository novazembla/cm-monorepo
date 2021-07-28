export const yupFieldIsRequired = (key: string, yupValidationSchema: any) => {
  return yupValidationSchema?.fields[key]?.exclusiveTests?.required === true;
}