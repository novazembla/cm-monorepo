import * as yup from "yup";

import translations from "./translations";

yup.setLocale(translations);

const schema = yup.object().shape({
  firstName: yup
    .string()
    .required(
      // t("validation.page.login.emailRequiredError", "Please enter your email address")
      "validation.page.register.firstNameRequiredError"
    ),
  lastName: yup
    .string()
    .required(
      // t("validation.page.login.emailRequiredError", "Please enter your email address")
      "validation.page.register.lastNameRequiredError"
    ),
  email: yup
    .string()
    .required(
      // t("validation.page.login.emailRequiredError", "Please enter your email address")
      "validation.page.register.emailRequiredError"
    )
    .email(),
  password: yup
    .string()
    .required(
      // t("validation.page.login.passwordRequiredError", "Please enter your password")
      "validation.page.register.passwordRequiredError"
    ),
});

export default schema;
