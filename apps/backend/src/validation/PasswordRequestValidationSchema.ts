import { string, object } from "yup";

export const PasswordRequestValidationSchema = object().shape({
  email: string()
    .required(
      // t("validation.page.passwordrequest.emailRequiredError", "Please enter your email address")
      "validation.page.passwordrequest.emailRequiredError"
    )
    .email(),
});

export default PasswordRequestValidationSchema;
