import { useTranslation } from "react-i18next";
import {
  FieldMultiLangInput,
  FieldRadioOrCheckboxGroup,
  FieldRadioOrCheckboxGroupOption,
  FieldRow,
} from "~/components/forms";
import { useModules } from "~/hooks";
import { yupIsFieldRequired } from "~/validation";

export const TaxonomyForm = ({
  data,
  errors,
  action,
  validationSchema,
  type,
}: {
  data?: any;
  errors?: any;
  validationSchema: any;
  action: "create" | "update";
  type: "taxonomy" | "term";
}) => {
  const { t } = useTranslation();
  const modules = useModules();

  
  return (
    <>
      <FieldMultiLangInput
        name="name"
        id="name"
        type="text"
        label={t("module.taxonomies.forms.taxonomy.field.label.name", "Name")}
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
        label={t("module.taxonomies.forms.taxonomy.field.label.slug", "Slug")}
        isRequired={true}
        settings={{
          defaultValues: data?.taxonomyRead?.slug,
          placeholder: t(
            "module.taxonomies.forms.taxonomy.field.placeholder.slug",
            "Slug / URL part"
          ),
        }}
      />

      {type === "taxonomy" && (
        <FieldRow>
          <FieldRadioOrCheckboxGroup
            id="modules"
            label={t(
              "module.taxonomies.forms.field.modules.label",
              "Active for the following Modules"
            )}
            name="modules"
            type="checkbox"
            isRequired={yupIsFieldRequired(
              "modules",
              validationSchema
            )}
            options={Object.keys(modules).reduce((acc, key) => {
              const module: any = modules[key];
              if (!module.withTaxonomies) return acc;
              acc.push({
                label: module.name,
                key: module.key,
              });
              return acc;
            }, [] as FieldRadioOrCheckboxGroupOption[])}
            
          />
        </FieldRow>
      )}
    </>
  );
};
export default TaxonomyForm;
