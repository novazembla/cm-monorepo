export const mapGroupOptionsToData = (
  newData: any,
  options: any,
  key: string
) => {
  if (!newData || !options) return [];

  return options.reduce((acc: any, option: any) => {
    if (newData[`${key}_${option.id}`])
      acc.push({
        id: option.id,
      });
    return acc;
  }, [] as any);
};

export const mapDataToGroupOptions = (data: any, options: any, key: string) => {
  if (!Array.isArray(data) || data.length === 0 || !Array.isArray(options))
    return {};

  return options.reduce((acc: any, option: any) => {
    return {
      ...acc,
      [`${key}_${option.id}`]:
        data.findIndex((t: any) => t.id === option.id) > -1,
    };
  }, {});
};