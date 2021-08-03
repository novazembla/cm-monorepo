import { useTranslation } from "react-i18next";

import { FieldInput, FieldRow, TwoColFieldRow } from "~/components/forms";

import {
  UserProfileUpdateValidationSchema,
  yupIsFieldRequired,
} from "~/validation";

export const UpdateForm = ({ data, errors }: { data?: any; errors?: any }) => {
  const { t } = useTranslation();

  return (
    <>
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
