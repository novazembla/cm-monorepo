export const mapDataToPrimaryTerms = (data: any, taxonomies: any) => {
  if (!data || data.length === 0 || !taxonomies) return {};

  return taxonomies.reduce((accTax: any[], taxonomy: any) => {
    if (!taxonomy.collectPrimaryTerm) return accTax;

    if (!taxonomy?.terms || taxonomy.terms.length === 0) return accTax;

    const firstMatch = taxonomy?.terms.find(
      (term: any) => data.findIndex((t: any) => t.id === term.id) > -1
    );

    return {
      ...accTax,
      [`primary_tax_${taxonomy.id}`]: firstMatch?.id,
    };
  }, {});
};

export const mapTermDataToPrimaryTerm = (termData: any, terms: any) => {
  if (
    !Array.isArray(termData) ||
    termData.length === 0 ||
    !Array.isArray(terms)
  )
    return undefined;

  return terms.find(
    (term: any) => termData.findIndex((t: any) => t.id === term.id) > -1
  );
};

export const mapPrimaryTermsToData = (
  type: string,
  data: any,
  taxonomies: any
) => {
  if (!taxonomies) return {};

  const primaryTerms = taxonomies.reduce((accTax: any[], taxonomy: any) => {
    if (!data[`primary_tax_${taxonomy.id}`]) return accTax;

    accTax.push({
      id: parseInt(data[`primary_tax_${taxonomy.id}`]),
    });
    return accTax;
  }, []);

  if (primaryTerms.length > 0) {
    return {
      primaryTerms: {
        [type]: primaryTerms,
      },
    };
  }
  return {};
};
