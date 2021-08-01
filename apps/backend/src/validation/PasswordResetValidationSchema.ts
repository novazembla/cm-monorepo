import * as yup from "yup";

import translations from "./translations";

yup.setLocale(translations);

export const PasswordResetValidationSchema = yup.object().shape({
  newPassword: yup.string().required(
    // t("validation.page.passwordreset.pleaseProvideYourNewPassword", "Please enter your new password")
    "validation.page.passwordreset.pleaseProvideYourNewPassword"
  ).min(12),
  confirmPassword: yup
    .string()
    .required(
      // t("validation.page.passwordreset.pleaseConfirmYourNewPassword", "Please confirm your new password")
      "validation.page.passwordreset.pleaseConfirmYourNewPassword"
    )
    // t("validation.page.passwordreset.passwordDoNotMatch", "The passwords do not match")
    .oneOf([yup.ref("newPassword"), null], "validation.page.passwordreset.passwordDoNotMatch"),

});

export default PasswordResetValidationSchema;