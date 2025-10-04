import { userProfileImageDeleteMutationGQL } from "@culturemap/core";

import { Box, Grid } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import {
  FieldInput,
  FieldRow,
  TwoColFieldRow,
  FieldImageUploader,
} from "~/components/forms";

import { yupIsFieldRequired } from "~/validation";
import { UserProfileUpdateValidationSchema } from ".";
import { useConfig } from "~/hooks";

export const UpdateForm = ({
  data,
  // errors,
  // disableNavigation,
  setActiveUploadCounter,
}: {
  data?: any;
  errors?: any;
  // eslint-disable-next-line @typescript-eslint/ban-types
  disableNavigation?: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  setActiveUploadCounter?: Function;
}) => {
  const config = useConfig();
  const { t } = useTranslation();

  const { firstName, lastName, profileImage } = data ?? {};
  const columns = config.enableProfilePicture
    ? { base: "100%", t: "max(20%, 250px) 1fr" }
    : "100%";
  const rows = config.enableProfilePicture
    ? { base: "auto 1fr", t: "auto" }
    : "auto";

  return (
    <Grid templateColumns={columns} templateRows={rows} gap="8">
      {config.enableProfilePicture && (
        <Box w={{ base: "50%", t: "100%" }}>
          <FieldImageUploader
            route="profileImage"
            id="profileImage"
            name="profileImage"
            label={t("page.register.profileimage", "Profile Image")}
            isRequired={yupIsFieldRequired(
              "profileImage",
              UserProfileUpdateValidationSchema
            )}
            setActiveUploadCounter={setActiveUploadCounter}
            deleteButtonGQL={userProfileImageDeleteMutationGQL}
            settings={{
              minFileSize: 1024 * 1024 * 0.05,
              maxFileSize: 1024 * 1024 * 12,
              aspectRatioPB: 133.33, // % bottom padding

              image: {
                status: profileImage?.status,
                id: profileImage?.id,
                meta: profileImage?.meta,
                alt: `${firstName} ${lastName}`,
                forceAspectRatioPB: 133.33,
                showPlaceholder: true,
                sizes: "(min-width: 45em) 20vw, 95vw",
              },
            }}
          />
        </Box>
      )}
      <Box>
        <TwoColFieldRow>
          <FieldRow>
            <FieldInput
              name="firstName"
              id="firstName"
              type="text"
              label={t(
                "page.register.form_field_firstName_label",
                "First Name"
              )}
              isRequired={yupIsFieldRequired(
                "firstName",
                UserProfileUpdateValidationSchema
              )}
              settings={{
                // defaultValue: data.abc.key
                placeholder: t(
                  "page.register.form_field_firstName_placeholder",
                  "Your first name"
                ),
              }}
            />
          </FieldRow>
          <FieldRow>
            <FieldInput
              name="lastName"
              id="lastName"
              type="text"
              label={t("page.register.form_field_lastName_label", "Last Name")}
              isRequired={yupIsFieldRequired(
                "lastName",
                UserProfileUpdateValidationSchema
              )}
              settings={{
                placeholder: t(
                  "page.register.form_field_lastName_placeholder",
                  "Your last name"
                ),
              }}
            />
          </FieldRow>
        </TwoColFieldRow>
        <FieldRow>
          <FieldInput
            name="email"
            id="email"
            type="email"
            label={t(
              "page.register.form_field_registration_label",
              "Email Address"
            )}
            isRequired={yupIsFieldRequired(
              "email",
              UserProfileUpdateValidationSchema
            )}
            settings={{
              placeholder: t(
                "page.register.form_field_registration_placeholder",
                "Please enter your email address"
              ),
            }}
          />
        </FieldRow>
      </Box>
    </Grid>
  );
};
export default UpdateForm;
