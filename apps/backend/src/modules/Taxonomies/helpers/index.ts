export const mapModulesCheckboxSelectionToData = (newData: any, modules: any) => {
  return Object.keys(modules)
    .reduce((acc, key) => {
      if (!modules[key].withTaxonomies) return acc;
      acc.push(modules[key]);
      return acc;
    }, [] as any[])
    .reduce((acc, module, i) => {

      if (!newData || !newData?.modules || !newData?.modules[i])
        return acc;

      acc.push({
        key: module.key
      })
      return acc;
    }, [] as any[]);
}