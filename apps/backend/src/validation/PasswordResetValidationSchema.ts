import {string, object, ref } from "yup";
import { passwordMinimumLength } from "~/config";

export const PasswordResetValidationSchema = object().shape({
  newPassword: string().required(
    // t("validation.page.passwordreset.pleaseProvideYourNewPassword", "Please enter your new password")
    "validation.page.passwordreset.pleaseProvideYourNewPassword"
  ).min(passwordMinimumLength),
  confirmPassword: string()
    .required(
      // t("validation.page.passwordreset.pleaseConfirmYourNewPassword", "Please confirm your new password")
      "validation.page.passwordreset.pleaseConfirmYourNewPassword"
    )
    // t("validation.page.passwordreset.passwordDoNotMatch", "The passwords do not match")
    .oneOf([ref("newPassword"), null], "validation.page.passwordreset.passwordDoNotMatch"),

});

export default PasswordResetValidationSchema;
