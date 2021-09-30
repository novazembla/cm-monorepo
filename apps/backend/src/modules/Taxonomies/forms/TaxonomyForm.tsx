import { useTranslation } from "react-i18next";
import {
  FieldMultiLangInput,
  FieldInput,
  FieldRadioOrCheckboxGroup,
  FieldRadioOrCheckboxGroupOption,
  FieldRow,
  FieldSwitch,
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

  console.log(data);

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
        <>
          <FieldRow>
            <FieldRadioOrCheckboxGroup
              id="modules"
              label={t(
                "module.taxonomies.forms.field.modules.label",
                "Active for the following Modules"
              )}
              name="modules"
              type="checkbox"
              isRequired={yupIsFieldRequired("modules", validationSchema)}
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
          <FieldRow>
            <FieldSwitch 
              name="hasColor"
              label={t("module.taxonomies.forms.field.hasColor.label", "Show color field")}
              defaultChecked={!!data.hasColor}
              colorScheme="wine"
            />
          </FieldRow>
        </>
      )}

      {type === "term" && (!!data?.taxonomy?.hasColor || !!data?.hasColor) && (
        <FieldRow>
          <FieldInput
            id="color"
            label={t("module.taxonomies.forms.field.color.label", "Color")}
            name="color"
            type="text"
            isRequired={yupIsFieldRequired("color", validationSchema)}
            settings={{
              placeholder: "#ab56cd",
            }}
          />
        </FieldRow>
      )}
    </>
  );
};
export default TaxonomyForm;
