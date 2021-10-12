import { Divider, chakra, Alert, AlertIcon } from "@chakra-ui/react";
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
  FieldModuleTaxonomies,
  FieldInput,
} from "~/components/forms";
import { useAuthentication } from "~/hooks";

import { yupIsFieldRequired } from "~/validation";

export const ModuleForm = ({
  data,
  errors,
  action,
  validationSchema,
  setActiveUploadCounter,
}: {
  data?: any;
  errors?: any;
  validationSchema: any;
  action: "create" | "update";
  setActiveUploadCounter?: Function;
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
                label={t("module.forms.field.label.author", "Author")}
                isRequired={true}
                options={data.adminUsers.map((authUser: any) => ({
                  value: authUser.id,
                  label: `${authUser.firstName} ${authUser.lastName}`,
                }))}
                isDisabled={
                  !(
                    appUser &&
                    (appUser.has("editor") ||
                      data.locationRead.ownerId === appUser.id)
                  )
                }
                settings={{
                  defaultValue: data.locationRead.ownerId,
                  placeholder: t(
                    "module.forms.field.placeholder.author",
                    "Please choose the author"
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
            setActiveUploadCounter={setActiveUploadCounter}
            settings={{
              imageRequired: false,
              altRequired: false,
              creditsRequired: false,
            }}
            connectWith={{
              heroImageLocations: {
                connect: {
                  id: data?.locationRead?.id,
                },
              },
            }}
          />
        </>
      );
    } else {
      updateActions = (
        <input value={data?.locationRead?.ownerId} {...register("ownerId")} />
      );
    }
  }
  return (
    <>
      {action === "create" && (
        <>
          <Alert borderRadius="lg">
            <AlertIcon />
            {t(
              "form.info.pleasesafedraft",
              "Please save a draft to unlock further functionality"
            )}
          </Alert>
        </>
      )}

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
      <FieldModuleTaxonomies data={data} />
      <Divider mt="10" />
      <chakra.fieldset
        border="1px solid"
        borderColor="gray.400"
        p="4"
        borderRadius="md"
        w="100%"
      >
        <legend>
          <chakra.span px="2">
            {t("module.locations.forms.field.label.address", "Address")}
          </chakra.span>
        </legend>
        <TwoColFieldRow>
          <FieldRow>
            <FieldInput
              id="street1"
              type="text"
              name="street1"
              label={t(
                "module.locations.forms.field.label.street1",
                "Street (1)"
              )}
              isRequired={yupIsFieldRequired("street1", validationSchema)}
              settings={{
                placeholder: t(
                  "locations.forms.field.placeholder.street1",
                  "Street (1)"
                ),
              }}
            />
          </FieldRow>
          <FieldRow>
            <FieldInput
              id="houseNumber"
              type="text"
              name="houseNumber"
              label={t(
                "module.locations.forms.field.label.houseNumber",
                "House Number"
              )}
              isRequired={yupIsFieldRequired("houseNumber", validationSchema)}
              settings={{
                placeholder: t(
                  "locations.forms.field.placeholder.houseNumber",
                  "126a"
                ),
              }}
            />
          </FieldRow>
        </TwoColFieldRow>
        <TwoColFieldRow>
          <FieldRow>
            <FieldInput
              id="street2"
              type="text"
              name="street2"
              label={t(
                "module.locations.forms.field.label.street2",
                "Street (2)"
              )}
              isRequired={yupIsFieldRequired("street2", validationSchema)}
              settings={{
                placeholder: t(
                  "locations.forms.field.placeholder.street2",
                  "Street (2)"
                ),
              }}
            />
          </FieldRow>
          <FieldRow>
            <FieldInput
              id="co"
              type="text"
              name="co"
              label={t("module.locations.forms.field.label.co", "C/O")}
              isRequired={yupIsFieldRequired("co", validationSchema)}
              settings={{
                placeholder: t(
                  "locations.forms.field.placeholder.co",
                  "C/O ..."
                ),
              }}
            />
          </FieldRow>
        </TwoColFieldRow>
        <TwoColFieldRow>
          <FieldRow>
            <FieldInput
              id="postCode"
              type="text"
              name="postCode"
              label={t(
                "module.locations.forms.field.label.postCode",
                "Post Code"
              )}
              isRequired={yupIsFieldRequired("postCode", validationSchema)}
              settings={{
                placeholder: t(
                  "locations.forms.field.placeholder.postCode",
                  "Post code"
                ),
              }}
            />
          </FieldRow>
          <FieldRow>
            <FieldInput
              id="city"
              type="text"
              name="city"
              label={t("module.locations.forms.field.label.city", "City")}
              isRequired={yupIsFieldRequired("city", validationSchema)}
              settings={{
                placeholder: t(
                  "locations.forms.field.placeholder.city",
                  "City"
                ),
              }}
            />
          </FieldRow>
        </TwoColFieldRow>
      </chakra.fieldset>
      <Divider mt="10" />
      <chakra.fieldset
        border="1px solid"
        borderColor="gray.400"
        p="4"
        borderRadius="md"
        w="100%"
      >
        <legend>
          <chakra.span px="2">
            {t(
              "module.locations.forms.location.geoloaction",
              "Location on map"
            )}
          </chakra.span>
        </legend>
        <LocationPicker
          lat={data?.locationRead?.lat}
          lng={data?.locationRead?.lng}
          required
        />
      </chakra.fieldset>

      
      <Divider mt="10" />
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
      <FieldMultiLangTextEditor
        name="accessibilityInformation"
        id="accessibilityInformation"
        type="basic"
        label={t(
          "module.locations.forms.location.field.label.accessibilityInformation",
          "Accessibility Information"
        )}
        isRequired={false}
        settings={{
          defaultRequired: true,
          defaultValues: data?.locationRead?.accessibilityInformation,
          maxLength: 500,
          placeholder: t(
            "module.locations.forms.location.field.placeholder.accessibilityInformation",
            "Location accessibilityInformation"
          ),
        }}
      />
      <Divider mt="10" />
      <chakra.fieldset
        border="1px solid"
        borderColor="gray.400"
        p="4"
        borderRadius="md"
        w="100%"
      >
        <legend>
          <chakra.span px="2">
            {t(
              "module.locations.forms.field.label.socialMedia",
              "Website/Social Media"
            )}
          </chakra.span>
        </legend>
        <FieldRow>
          <FieldInput
            id="website"
            type="text"
            name="website"
            label={t("module.locations.forms.field.label.website", "Website")}
            isRequired={yupIsFieldRequired("website", validationSchema)}
            settings={{
              placeholder: t(
                "locations.forms.field.placeholder.url",
                "https://...."
              ),
            }}
          />
        </FieldRow>
        <TwoColFieldRow>
          <FieldRow>
            <FieldInput
              id="facebook"
              type="text"
              name="facebook"
              label={t(
                "module.locations.forms.field.label.facebook",
                "Facebook page"
              )}
              isRequired={yupIsFieldRequired("facebook", validationSchema)}
              settings={{
                placeholder: t(
                  "locations.forms.field.placeholder.url",
                  "https://...."
                ),
              }}
            />
          </FieldRow>
          <FieldRow>
            <FieldInput
              id="instagram"
              type="text"
              name="instagram"
              label={t(
                "module.locations.forms.field.label.instagram",
                "Instagram"
              )}
              isRequired={yupIsFieldRequired("instagram", validationSchema)}
              settings={{
                placeholder: t(
                  "locations.forms.field.placeholder.url",
                  "https://...."
                ),
              }}
            />
          </FieldRow>
        </TwoColFieldRow>
        <TwoColFieldRow>
          <FieldRow>
            <FieldInput
              id="twitter"
              type="text"
              name="twitter"
              label={t("module.locations.forms.field.label.twitter", "Twitter")}
              isRequired={yupIsFieldRequired("twitter", validationSchema)}
              settings={{
                placeholder: t(
                  "locations.forms.field.placeholder.url",
                  "https://...."
                ),
              }}
            />
          </FieldRow>
          <FieldRow>
            <FieldInput
              id="youtube"
              type="text"
              name="youtube"
              label={t("module.locations.forms.field.label.youtube", "YouTube")}
              isRequired={yupIsFieldRequired("youtube", validationSchema)}
              settings={{
                placeholder: t(
                  "locations.forms.field.placeholder.url",
                  "https://...."
                ),
              }}
            />
          </FieldRow>
        </TwoColFieldRow>
      </chakra.fieldset>
      <Divider mt="10" />
      <chakra.fieldset
        border="1px solid"
        borderColor="gray.400"
        p="4"
        borderRadius="md"
        w="100%"
      >
        <legend>
          <chakra.span px="2">
            {t(
              "module.locations.forms.field.label.additionalInformation",
              "Additional Information"
            )}
          </chakra.span>
        </legend>
        <FieldRow>
          <FieldInput
            id="agency"
            type="text"
            name="agency"
            label={t("module.locations.forms.field.label.agency", "Agency")}
            isRequired={yupIsFieldRequired("agency", validationSchema)}
            settings={{
              placeholder: t(
                "locations.forms.field.placeholder.agency",
                "Agency"
              ),
            }}
          />
        </FieldRow>

        <FieldRow>
          <FieldInput
            id="eventLocationId"
            type="text"
            name="eventLocationId"
            label={t(
              "module.locations.forms.field.label.eventLocationId",
              "berlin.de Event Location ID"
            )}
            isRequired={yupIsFieldRequired("eventLocationId", validationSchema)}
            settings={{
              placeholder: t(
                "locations.forms.field.placeholder.eventLocationId",
                "berlin.de Event Location ID"
              ),
            }}
          />
        </FieldRow>
      </chakra.fieldset>
    </>
  );
};
export default ModuleForm;
