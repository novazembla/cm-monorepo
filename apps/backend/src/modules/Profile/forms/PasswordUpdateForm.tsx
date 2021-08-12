import { useTranslation } from "react-i18next";

import { FieldInput, FieldRow } from "~/components/forms";

import {
  PasswordResetValidationSchema,
  yupIsFieldRequired,
} from "~/validation";

export const PasswordUpdateForm = ({
  data,
  errors,
}: {
  data?: any;
  errors?: any;
}) => {
  const { t } = useTranslation();

  return (
    <>
      <FieldRow>
        <FieldInput
          name="newPassword"
          id="newPassword"
          type="password"
          label={t("page.passwordreset.form_field_password_label", "New Password")}
          isRequired={yupIsFieldRequired(
            "newPassword",
            PasswordResetValidationSchema
          )}
          settings={{
            autoComplete: "new-password",
            placeholder: t(
              "page.passwordreset.form_field_password_placeholder",
              "Please enter your password"
            ),
          }}
        />
      </FieldRow>

      <FieldRow>
        <FieldInput
          name="confirmPassword"
          id="confirmPassword"
          type="password"
          label={t(
            "page.passwordreset.form_field_password_confirmation_label",
            "Confirm your new password"
          )}
          isRequired={yupIsFieldRequired(
            "confirmPassword",
            PasswordResetValidationSchema
          )}
          settings={{
            autoComplete: "new-password",
            placeholder: t(
              "page.passwordreset.form_field_password_confirm_placeholder",
              "Please confirm your password"
            ),
          }}
        />
      </FieldRow>
    </>
  );
};
export default PasswordUpdateForm;
