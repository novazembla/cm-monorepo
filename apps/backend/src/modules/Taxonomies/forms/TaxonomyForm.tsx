import { useTranslation } from "react-i18next";
import {
  FieldMultiLang,
} from "~/components/forms";

import { yupIsFieldRequired } from "~/validation";

export const TaxonomyForm = ({ data, errors, action, validationSchema }: { data?: any; errors?: any; validationSchema: any; action: "create" | "update" }) => {
  const { t } = useTranslation();

  return (
    <> 
      <FieldMultiLang
        name="name"
        id="name"
        type="text"
        label={t(
          "module.taxonomies.forms.taxonomy.field.label.name",
          "Name"
        )}
        isRequired={yupIsFieldRequired(
          "name",
          validationSchema
        )}
        settings={{
          defaultValues: data?.taxonomyRead?.name,
          placeholder: t(
            "module.taxonomies.forms.taxonomy.field.placeholder.name",
            "Taxonomy name"
          ),
        }}
      />
      <FieldMultiLang
        name="slug"
        id="slug"
        type="text"
        label={t(
          "module.taxonomies.forms.taxonomy.field.label.slug",
          "Slug"
        )}
        isRequired={yupIsFieldRequired(
          "slug",
          validationSchema
        )}
        settings={{
          defaultValues: data?.taxonomyRead?.slug,
          placeholder: t(
            "module.taxonomies.forms.taxonomy.field.placeholder.slug",
            "Slug / URL part"
          ),
        }}
      />
    </>
  );
};
export default TaxonomyForm;
