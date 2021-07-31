import * as yup from "yup";

import translations from "./translations";

yup.setLocale(translations);

export const PasswordRequestValidationSchema = yup.object().shape({
  email: yup
    .string()
    .required(
      // t("validation.page.passwordrequest.emailRequiredError", "Please enter your email address")
      "validation.page.passwordrequest.emailRequiredError"
    )
    .email(),
});

export default PasswordRequestValidationSchema;
