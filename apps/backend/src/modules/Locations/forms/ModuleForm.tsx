import { Divider, chakra, Alert, AlertIcon, Box } from "@chakra-ui/react";
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
  FieldImages,
  FieldModuleTaxonomies,
  FieldInput,
} from "~/components/forms";
import FieldMultiLangTextarea from "~/components/forms/FieldMultiLangTextarea";
import { useAuthentication } from "~/hooks";

import { yupIsFieldRequired } from "~/validation";

export const ModuleForm = ({
  data,
  errors,
  action,
  validationSchema,
  setActiveUploadCounter,
  clearAlternatives,
}: {
  data?: any;
  errors?: any;
  validationSchema: any;
  action: "create" | "update";
  setActiveUploadCounter?: Function;
  clearAlternatives?: () => void;
}) => {
  const [appUser] = useAuthentication();

  const { t } = useTranslation();
  const { register } = useFormContext();

  let updateActions;

  let alternativeLocations;

  if (
    data?.location?.geoCodingInfo?.count > 1 &&
    Array.isArray(data?.location?.geoCodingInfo?.geojson?.features) &&
    data?.location?.geoCodingInfo?.geojson?.features?.length > 0
  )
    alternativeLocations = data?.location?.geoCodingInfo?.geojson?.features;

  if (action === "update") {
    if (data?.adminUsers) {
      updateActions = (
        <>
          <Divider mt="10" />
          <TwoColFieldRow>
            <FieldRow>
              <FieldPublishStatusSelect
                ownerId={data.location.ownerId}
                module="location"
                status={data?.location?.status}
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
                      data.location.ownerId === appUser.id)
                  )
                }
                settings={{
                  defaultValue: data.location.ownerId,
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
            currentImage={data?.location?.heroImage}
            setActiveUploadCounter={setActiveUploadCounter}
            settings={{
              imageRequired: false,
              altRequired: false,
              creditsRequired: false,
            }}
            connectWith={{
              heroImageLocations: {
                connect: {
                  id: data?.location?.id,
                },
              },
            }}
          />
        </>
      );
    } else {
      updateActions = (
        <input value={data?.location?.ownerId} {...register("ownerId")} />
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
          defaultValues: data?.location?.title,
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
          defaultValues: data?.location?.slug,
          placeholder: t(
            "module.locations.forms.location.field.placeholder.slug",
            "Slug / URL part"
          ),
        }}
      />
      {updateActions}
      <Divider mt="10" />
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
              "module.locations.forms.field.label.contactInformation",
              "Contact Information"
            )}
          </chakra.span>
        </legend>
        <TwoColFieldRow>
          <FieldRow>
            <FieldInput
              id="email1"
              type="text"
              name="email1"
              label={t(
                "module.locations.forms.field.label.email1",
                "Email address (1)"
              )}
              isRequired={yupIsFieldRequired("email1", validationSchema)}
              settings={{
                placeholder: t(
                  "locations.forms.field.placeholder.email",
                  "petra.meier@contact.me"
                ),
              }}
            />
          </FieldRow>
          <FieldRow>
            <FieldInput
              id="email2"
              type="text"
              name="email2"
              label={t(
                "module.locations.forms.field.label.email2",
                "Email address (2)"
              )}
              isRequired={yupIsFieldRequired("email2", validationSchema)}
              settings={{
                placeholder: t(
                  "locations.forms.field.placeholder.email",
                  "petra.meier@contact.me"
                ),
              }}
            />
          </FieldRow>
        </TwoColFieldRow>
        <TwoColFieldRow>
          <FieldRow>
            <FieldInput
              id="phone1"
              type="text"
              name="phone1"
              label={t(
                "module.locations.forms.field.label.phone1",
                "Phone number (1)"
              )}
              isRequired={yupIsFieldRequired("phone1", validationSchema)}
              settings={{
                placeholder: t(
                  "locations.forms.field.placeholder.phone",
                  "+49327876780"
                ),
              }}
            />
          </FieldRow>
          <FieldRow>
            <FieldInput
              id="phone2"
              type="text"
              name="phone2"
              label={t(
                "module.locations.forms.field.label.phone2",
                "Phone number (2)"
              )}
              isRequired={yupIsFieldRequired("phone2", validationSchema)}
              settings={{
                placeholder: t(
                  "locations.forms.field.placeholder.phone",
                  "+49327876780"
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
          lat={data?.location?.lat}
          lng={data?.location?.lng}
          alternativeLocations={alternativeLocations}
          clearAlternatives={clearAlternatives}
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
          defaultRequired: false,
          defaultValues: data?.location?.description,
          maxLength: 2000,
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
          defaultValues: data?.location?.offers,
          maxLength: 750,
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
          defaultRequired: false,
          defaultValues: data?.location?.accessibilityInformation,
          maxLength: 750,
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

      {action === "update" && (
        <>
          <Divider mt="10" />
          <FieldImages
            id="images"
            name="images"
            label={t("forms.images.label", "Images")}
            currentImages={data?.location?.images}
            settings={{
              imageRequired: false,
              altRequired: false,
              creditsRequired: false,
            }}
            setActiveUploadCounter={setActiveUploadCounter}
            connectWith={{
              locations: {
                connect: {
                  id: data?.location?.id,
                },
              },
            }}
          />
        </>
      )}

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
        {data?.location?.meta?.suggestionSubmittersName && (
          <FieldRow>
            <Box>
              {t("location.suggestion.fieldName.name", "Suggester's name")}
              <br />
              <b>{data?.location?.meta?.suggestionSubmittersName}</b>
            </Box>
          </FieldRow>
        )}
        {data?.location?.meta?.suggestionSubmittersEmail && (
          <FieldRow>
            <Box>
              {t(
                "location.suggestion.fieldName.email",
                "Suggester's email address"
              )}
              <br />
              <a
                href={`mailto:${data?.location?.meta?.suggestionSubmittersEmail}`}
              >
                {data?.location?.meta?.suggestionSubmittersEmail}
              </a>
            </Box>
          </FieldRow>
        )}
        {data?.location?.meta?.suggestionComments && (
          <FieldRow>
            <Box>
              {t(
                "location.suggestion.fieldName.comments",
                "Suggester's comments and notes"
              )}
              <br />
              {data?.location?.meta?.suggestionComments}
            </Box>
          </FieldRow>
        )}

        {typeof data?.location?.meta?.suggestionTandC !== "undefined" && (
          <FieldRow>
            <Box>
              {t(
                "location.suggestion.fieldName.suggestionTandC",
                "Suggester accepted T&C"
              )}
              <br />
              <b>
                {data?.location?.meta?.suggestionTandC
                  ? t("location.suggestion.yes", "Yes")
                  : t("location.suggestion.no", "No")}
              </b>
            </Box>
          </FieldRow>
        )}

        {typeof data?.location?.meta?.suggestionIsOwner !== "undefined" && (
          <FieldRow>
            <Box>
              {t(
                "location.suggestion.fieldName.suggestionIsOwner",
                "Suggester confirms to be legally responsible"
              )}
              <br />
              <b>
                {data?.location?.meta?.suggestionIsOwner
                  ? t("location.suggestion.yes", "Yes")
                  : t("location.suggestion.no", "No")}
              </b>
            </Box>
          </FieldRow>
        )}

        {typeof data?.location?.meta?.suggestionImageRightsConfirmation !==
          "undefined" && (
          <FieldRow>
            <Box>
              {t(
                "location.suggestion.fieldName.suggestionImageRightsConfirmation",
                "Suggester confirms that the image can be published on the website"
              )}
              <br />
              <b>
                {data?.location?.meta?.suggestionImageRightsConfirmation
                  ? t("location.suggestion.yes", "Yes")
                  : t("location.suggestion.no", "No")}
              </b>
            </Box>
          </FieldRow>
        )}
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
              "module.locations.forms.fieldSet.label.seo",
              "SEO"
            )}
          </chakra.span>
        </legend>
        <FieldMultiLangTextarea
          name="metaDesc"
          id="metaDesc"
          type="basic"
          label={t(
            "module.locations.forms.location.field.label.metaDesc",
            "Meta Description"
          )}
          isRequired={false}
          settings={{
            defaultRequired: false,
            defaultValues: data?.location?.metaDesc,
            maxLength: 350,
          }}
        />
      </chakra.fieldset>
    </>
  );
};
export default ModuleForm;
