import { useEffect, useState, useMemo } from "react";
import { Box } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useDropzone } from "react-dropzone";
import { FieldInput, FieldRow, TwoColFieldRow } from "~/components/forms";

import {
  UserProfileUpdateValidationSchema,
  yupIsFieldRequired,
} from "~/validation";

import { useAuthentication, useConfig } from "~/hooks";
import { useUserProfileImageUpdateMutation } from "../hooks/useUserProfileImageUpdateMutation";

const baseStyle = {
  flex: 1,
  display: "flex",
  fleDirection: "column",
  alignItems: "center",
  padding: "20px",
  height: "100px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const activeStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

export const UpdateForm = ({ data, errors }: { data?: any; errors?: any }) => {
  const [appUser] = useAuthentication();
  
  const { t } = useTranslation();
  const config = useConfig();

  const [firstMutation, firstMutationResults] = useUserProfileImageUpdateMutation()
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDropAccepted: async (acceptedFiles) => {
      console.log(acceptedFiles)
      try {
        if (appUser) {
          const { errors } = await firstMutation(appUser?.id, {
            image: acceptedFiles[0]
          });
  
          if (!errors) {
            console.log(data)
            // successToast();
  
            // history.push("/profile");
          }
        }
      
      } catch (err) {
        console.error(err);
      }
    }
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isDragActive, isDragReject, isDragAccept]
  );

  return (
    <>
      <section className="container">
        <div {...getRootProps({ className: "dropzone", style })}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop some files here, or click to select files</p>
        </div>
      </section>
      <TwoColFieldRow>
        <FieldRow>
          <FieldInput
            name="firstName"
            id="firstName"
            type="text"
            label={t("page.register.form_field_firstName_label", "First Name")}
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
    </>
  );
};
export default UpdateForm;
