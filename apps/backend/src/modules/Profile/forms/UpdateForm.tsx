import { userProfileImageDeleteMutationGQL } from "@culturemap/core";

import { Box, IconButton, Grid } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import {
  FieldInput,
  FieldRow,
  TwoColFieldRow,
  ImageUploader,
} from "~/components/forms";

import { HiOutlineTrash } from "react-icons/hi";

import { yupIsFieldRequired } from "~/validation";
import { useDeleteByIdButton } from "~/hooks";

import { UserProfileUpdateValidationSchema } from ".";
import { useState } from "react";

export const UpdateForm = ({
  data,
  errors,
  disableNavigation,
}: {
  data?: any;
  errors?: any;
  disableNavigation?: Function;
}) => {
  const { t } = useTranslation();

  const [imageDeleted, setImageDeleted] = useState(false);
  const { profileImageId, firstName, lastName, profileImage } = data ?? {};

  let profileImageTag;
  if (
    profileImage &&
    profileImage.status === 3 &&
    profileImage?.meta?.availableSizes
  ) {
    const originalUrl = profileImage?.meta?.availableSizes?.original?.url ?? "";

    const srcset = Object.keys(profileImage?.meta?.availableSizes).reduce(
      (acc: any, key: any) => {
        const size = profileImage?.meta?.availableSizes[key];
        if (!size.isJpg) return acc;

        acc.push(`${size.url} ${size.width}w`);

        return acc;
      },
      [] as string[]
    );
    profileImageTag = (
      <img
        src={originalUrl}
        srcSet={srcset.join(",")}
        alt={`${firstName} ${lastName}`}
      />
    );
  }

  const [deleteButtonOnClick, DeleteAlertDialog, isDeleteError] =
    useDeleteByIdButton(
      userProfileImageDeleteMutationGQL,
      () => {
        setImageDeleted(true);
      },
      {
        requireTextualConfirmation: false,
      }
    );

  return (
    <Grid
      templateColumns={{ base: "100%", t: "max(20%, 250px) 1fr" }}
      templateRows={{ base: "200px 1fr", t: "100%" }}
      gap="8"
    >
      {(!profileImageTag || imageDeleted) && (
        <ImageUploader
          id="profileImage"
          name="profileImage"
          label={t("page.register.profileimage", "Profile Image")}
          isRequired={yupIsFieldRequired(
            "profileImage",
            UserProfileUpdateValidationSchema
          )}
          settings={{
            defaultValue: 0,
            minFileSize: 1024 * 1024 * 0.05,
            maxFileSize: 1024 * 1024 * 2,
            aspectRatioPB: 133.33, // % bottom padding
          }}
        />
      )}
      {!imageDeleted && profileImageTag && (
        <Box position="relative">
          {profileImageTag}
          <IconButton
            position="absolute"
            top="3"
            right="3"
            fontSize="xl"
            icon={<HiOutlineTrash />}
            onClick={() => deleteButtonOnClick(profileImageId)}
            aria-label={t(
              "module.profile.button.deleteimage",
              "Delete profile image"
            )}
          >
            {t("module.profile.button.deleteimage", "Delete profile image")}
          </IconButton>
        </Box>
      )}
      {isDeleteError && (
        <p color="red.500">
          {t(
            "module.profile.deleteimage.error",
            "Unfortunately, we could not process you deletion request please try again later"
          )}
        </p>
      )}
      {DeleteAlertDialog}
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
