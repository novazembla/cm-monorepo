import * as yup from "yup";

import translations from "./translations";

yup.setLocale(translations);

export const ValidationSchemaLogin = yup.object().shape({
  email: yup
    .string()
    .email()
    .required(
      // t("validation.page.login.emailRequiredError", "Please enter your email address")
      "validation.page.login.emailRequiredError"
    ),
  password: yup
    .string()
    .required(
      // t("validation.page.login.passwordRequiredError", "Please enter your password")
      "validation.page.login.passwordRequiredError"
    ),
});

export default ValidationSchemaLogin;
