export const mapModulesCheckboxArrayToData = (newData: any, taxonomies: any) => {

  if (!newData || !taxonomies) 
    return [];

  return taxonomies.reduce((accTerms: any[], taxonomy: any) => {
    if (!taxonomy?.terms || taxonomy.terms.length === 0)
      return accTerms;  

    if (!(`tax_${taxonomy.id}` in newData))
      return accTerms;

    return taxonomy?.terms.reduce((selectedTerms: any[], term: any, i: number) => {
      if (!newData[`tax_${taxonomy.id}`][i])
        return selectedTerms;

      selectedTerms.push({
        id: term.id
      })
      return selectedTerms
    }, accTerms)

  }, []);
}

export const mapDataToModulesCheckboxArray = (data: any, taxonomies: any) => {
  if (!data || data.length === 0 || !taxonomies) 
    return {};

  return taxonomies.reduce((accTax: any[], taxonomy: any) => {
    if (!taxonomy?.terms || taxonomy.terms.length === 0)
      return accTax;  

    return {
      ...accTax,
      [`tax_${taxonomy.id}`]: taxonomy?.terms.map((term: any) => data.findIndex((t: any) => t.id === term.id) > -1)
    }
  }, {});
}
