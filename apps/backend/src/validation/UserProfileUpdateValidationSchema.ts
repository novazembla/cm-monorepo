import { string, object } from "yup";

export const UserProfileUpdateValidationSchema = object().shape({
  firstName: string().required(
    // t("validation.page.login.emailRequiredError", "Please enter your email address")
    "validation.page.register.firstNameRequiredError"
  ),
  lastName: string().required(
    // t("validation.page.login.emailRequiredError", "Please enter your email address")
    "validation.page.register.lastNameRequiredError"
  ),
  email: string()
    .required(
      // t("validation.page.login.emailRequiredError", "Please enter your email address")
      "validation.page.register.emailRequiredError"
    )
    .email(),
});

export default UserProfileUpdateValidationSchema;
