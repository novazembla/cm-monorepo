import * as yup from "yup";

import translations from "./translations";

yup.setLocale(translations);

export const UserProfileUpdateValidationSchema = yup.object().shape({
  firstName: yup.string().required(
    // t("validation.page.login.emailRequiredError", "Please enter your email address")
    "validation.page.register.firstNameRequiredError"
  ),
  lastName: yup.string().required(
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
});

export default UserProfileUpdateValidationSchema;
