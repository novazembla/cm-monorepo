import { useTranslation } from "react-i18next";
import {
  FieldMultiLangInput,
} from "~/components/forms";

export const TaxonomyForm = ({ data, errors, action, validationSchema }: { data?: any; errors?: any; validationSchema: any; action: "create" | "update" }) => {
  const { t } = useTranslation();

  return (
    <> 
      <FieldMultiLangInput
        name="name"
        id="name"
        type="text"
        label={t(
          "module.taxonomies.forms.taxonomy.field.label.name",
          "Name"
        )}
        isRequired={true}
        settings={{
          defaultValues: data?.taxonomyRead?.name,
          placeholder: t(
            "module.taxonomies.forms.taxonomy.field.placeholder.name",
            "Taxonomy name"
          ),
        }}
      />
      <FieldMultiLangInput
        name="slug"
        id="slug"
        type="text"
        label={t(
          "module.taxonomies.forms.taxonomy.field.label.slug",
          "Slug"
        )}
        isRequired={true}
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
