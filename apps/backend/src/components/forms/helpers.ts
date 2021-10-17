export const flattenErrors = (errors: any) =>
  errors && Object.keys(errors).length > 0
    ? Object.keys(errors).reduce((acc: any, key: any) => {
        if (!Array.isArray(errors[key]))
          return {
            ...acc,
            [key]: errors[key],
          };

        return {
          ...acc,
          ...Object.keys(errors[key]).reduce((accErr: any, idx: any) => {
            
            if (!errors[key][idx]) return accErr;

            return {
              ...accErr,
              ...Object.keys(errors[key][idx]).reduce(
                (accFields: any, error: any) => ({
                  ...accFields,
                  [`${key}[${idx}].${error}`]: errors[key][idx][error],
                }),
                {}
              ),
            };
          }, {}),
        };
      }, {})
    : {};
