import { string, bool, object, ref } from "yup";

import { passwordMinimumLength } from "~/config";

export const UserSignupValidationSchema = object().shape({
  firstName: string().required(
    // t("validation.page.register.firstNameRequiredError", "Please enter your first name")
    "validation.page.register.firstNameRequiredError"
  ),
  lastName: string().required(
    // t("validation.page.register.lastNameRequiredError", "Please enter your last name")
    "validation.page.register.lastNameRequiredError"
  ),
  email: string()
    .required(
      // t("validation.page.register.emailRequiredError", "Please enter your email address")
      "validation.page.register.emailRequiredError"
    )
    .email(),
  password: string()
    .required(
      // t("validation.page.register.passwordRequiredError", "Please enter your password")
      "validation.page.register.passwordRequiredError"
    )
    .min(passwordMinimumLength),
  confirmPassword: string()
    .required(
      // t("validation.page.register.pleaseConfirmYourPassword", "Please confirm your password")
      "validation.page.register.pleaseConfirmYourPassword"
    )
    // t("validation.page.passwordreset.passwordDoNotMatch", "The passwords do not match")
    .oneOf(
      [ref("password"), null],
      "validation.page.passwordreset.passwordDoNotMatch"
    ),
  acceptedTerms: bool().oneOf(
    [true],
    // t("validation.page.register.acceptedTermsRequiredError", "Please accept out terms & conditions")
    "validation.page.register.acceptedTermsRequiredError"
  ),
});

export default UserSignupValidationSchema;
