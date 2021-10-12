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
              isRequired={true}
              options={Object.keys(modules).reduce((acc, key) => {
                const module: any = modules[key];
                if (!module.withTaxonomies) return acc;
                acc.push({
                  label: module.name,
                  id: module.id,
                });
                return acc;
              }, [] as FieldRadioOrCheckboxGroupOption[])}
            />
          </FieldRow>
          <FieldRow>
            <FieldSwitch
              name="hasColor"
              label={t(
                "module.taxonomies.forms.field.hasColor.label",
                "Show color fields"
              )}
              defaultChecked={!!data?.hasColor}
              colorScheme="wine"
            />
          </FieldRow>
          <FieldRow>
            <FieldSwitch
              name="collectPrimaryTerm"
              label={t(
                "module.taxonomies.forms.field.collectPrimaryTerm.label",
                "Show primary term select element"
              )}
              defaultChecked={!!data?.collectPrimaryTerm}
              colorScheme="wine"
            />
          </FieldRow>
          <FieldRow>
            <FieldSwitch
              name="isRequired"
              label={t(
                "module.taxonomies.forms.field.isRequired.label",
                "Selection of at least one term is required"
              )}
              defaultChecked={!!data?.isRequired}
              colorScheme="wine"
            />
          </FieldRow>
        </>
      )}

      {type === "term" && (!!data?.taxonomy?.hasColor || !!data?.hasColor) && (
        <>
          <FieldRow>
            <FieldInput
              id="color"
              label={t("module.taxonomies.forms.field.color.label", "Color (light)")}
              name="color"
              type="text"
              isRequired={yupIsFieldRequired("color", validationSchema)}
              settings={{
                placeholder: "#ab56cd",
              }}
            />
          </FieldRow>
          <FieldRow>
            <FieldInput
              id="colorDark"
              label={t(
                "module.taxonomies.forms.field.colorDark.label",
                "Color (dark)"
              )}
              name="colorDark"
              type="text"
              isRequired={yupIsFieldRequired("colorDark", validationSchema)}
              settings={{
                placeholder: "#6686cd",
              }}
            />
          </FieldRow>
        </>
      )}
    </>
  );
};
export default TaxonomyForm;
