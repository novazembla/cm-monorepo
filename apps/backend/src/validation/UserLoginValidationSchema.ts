import {object, string} from "yup";

export const UserLoginValidationSchema = object().shape({
  email: string()
    .email()
    .required(
      // t("validation.page.login.emailRequiredError", "Please enter your email address")
      "validation.page.login.emailRequiredError"
    ),
  password: string()
    .required(
      // t("validation.page.login.passwordRequiredError", "Please enter your password")
      "validation.page.login.passwordRequiredError"
    ),
});

export default UserLoginValidationSchema;
