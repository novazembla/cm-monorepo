import { Divider } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  FieldMultiLangInput,
  FieldMultiLangTextEditor,
  FieldSelect,
  FieldPublishStatusSelect,
  FieldRow,
  LocationPicker,
  TwoColFieldRow,
  FieldSingleImage,
  FieldRadioOrCheckboxGroup,
} from "~/components/forms";
import { MultiLangValue } from "~/components/ui";
import { useAuthentication } from "~/hooks";

export const ModuleForm = ({
  data,
  errors,
  action,
  validationSchema,
}: {
  data?: any;
  errors?: any;
  validationSchema: any;
  action: "create" | "update";
}) => {
  const [appUser] = useAuthentication();

  const { t } = useTranslation();
  const { register } = useFormContext();

  let updateActions;

  if (action === "update") {
    if (data?.adminUsers) {
      updateActions = (
        <>
          <Divider mt="10" />
          <TwoColFieldRow>
            <FieldRow>
              <FieldPublishStatusSelect
                ownerId={data.locationRead.ownerId}
                module="location"
                status={data?.locationRead?.status}
              />
            </FieldRow>
            <FieldRow>
            <FieldSelect
                name="ownerId"
                id="ownerId"
                label={t("module.locations.forms.field.label.author", "Author")}
                isRequired={true}
                options={data.adminUsers.map((authUser: any) => ({
                  value: authUser.id,
                  label: `${authUser.firstName} ${authUser.lastName}`,
                }))}
                isDisabled={!(appUser && (appUser.has("editor") || data.locationRead.ownerId === appUser.id))}
                settings={{
                  defaultValue: data.locationRead.ownerId,
                  placeholder: t(
                    "module.locations.forms.field.placeholder.author",
                    "Please choose the location's author"
                  ),
                }}
              />
              
            </FieldRow>
          </TwoColFieldRow>
          <Divider mt="10" />
          <FieldSingleImage
            id="heroImage"
            name="heroImage"
            label={t("forms.heroImage.label", "Featured image")}
            currentImage={data?.locationRead?.heroImage}
            settings={{
              imageRequired: false,
              altRequired: false,
              creditsRequired: false,
            }}
            connectWith={{
              heroImageLocations: {
                connect: {
                  id: data?.locationRead?.id,            
                }
              }
            }}
          />
        </>
      );
    } else {
      updateActions = (
        <input value={data.locationRead.ownerId} {...register("ownerId")} />
      );
    }
  }
  return (
    <>
      <FieldMultiLangInput
        name="title"
        id="title"
        type="text"
        label={t("module.locations.forms.location.field.label.title", "Title")}
        isRequired={true}
        settings={{
          defaultValues: data?.locationRead?.title,
          placeholder: t(
            "module.locations.forms.location.field.placeholder.title",
            "Location title"
          ),
        }}
      />
      <FieldMultiLangInput
        name="slug"
        id="slug"
        type="text"
        label={t("module.locations.forms.location.field.label.slug", "Slug")}
        isRequired={true}
        settings={{
          defaultValues: data?.locationRead?.slug,
          placeholder: t(
            "module.locations.forms.location.field.placeholder.slug",
            "Slug / URL part"
          ),
        }}
      />
      {updateActions}
      <Divider mt="10" />
      <LocationPicker
        lat={data?.locationRead?.lat}
        lng={data?.locationRead?.lng}
        required
      />

      {data && data?.moduleTaxonomies && (
        <>
          <Divider mt="10" />
          {data?.moduleTaxonomies.map((taxonomy: any) => (
            <FieldRow key={`tax_${taxonomy.id}`}>
              <FieldRadioOrCheckboxGroup
                id={`tax_${taxonomy.id}`}
                name={`tax_${taxonomy.id}`}
                isRequired
                label={<MultiLangValue json={taxonomy.name} />}
                type="checkbox"
                options={taxonomy.terms.map((term: any) => ({
                  label: term.name,
                  key: term.id,
                }))}
              />
            </FieldRow>
          ))}
        </>
      )}
      <Divider mt="10" />

      <FieldMultiLangTextEditor
        name="address"
        id="address"
        type="basic"
        label={t(
          "module.locations.forms.location.field.label.address",
          "Address"
        )}
        isRequired={false}
        settings={{
          defaultRequired: true,
          defaultValues: data?.locationRead?.address,
          maxLength: 500,
          placeholder: t(
            "module.locations.forms.location.field.placeholder.address",
            "Location address"
          ),
        }}
      />

      <FieldMultiLangTextEditor
        name="description"
        id="description"
        type="basic"
        label={t(
          "module.locations.forms.location.field.label.description",
          "Description"
        )}
        isRequired={false}
        settings={{
          defaultRequired: true,
          defaultValues: data?.locationRead?.description,
          maxLength: 1000,
          placeholder: t(
            "module.locations.forms.location.field.placeholder.description",
            "Location description"
          ),
        }}
      />

      <FieldMultiLangTextEditor
        name="contactInfo"
        id="contactInfo"
        type="basic"
        label={t(
          "module.locations.forms.location.field.label.contactInfo",
          "Contact Information"
        )}
        isRequired={false}
        settings={{
          defaultValues: data?.locationRead?.contactInfo,
          maxLength: 500,
          placeholder: t(
            "module.locations.forms.location.field.placeholder.contactInfo",
            "Location contactInfo"
          ),
        }}
      />
      <FieldMultiLangTextEditor
        name="offers"
        id="offers"
        type="basic"
        label={t(
          "module.locations.forms.location.field.label.offers",
          "Offers"
        )}
        isRequired={false}
        settings={{
          defaultValues: data?.locationRead?.offers,
          maxLength: 500,
          placeholder: t(
            "module.locations.forms.location.field.placeholder.offers",
            "Location offers"
          ),
        }}
      />
    </>
  );
};
export default ModuleForm;
