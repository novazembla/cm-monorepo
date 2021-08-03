import { string, bool, object, ref } from "yup";

import { passwordMinimumLength } from "~/config";

export const UserSignupValidationSchema = object().shape({
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
  password: string()
    .required(
      // t("validation.page.login.passwordRequiredError", "Please enter your password")
      "validation.page.register.passwordRequiredError"
    )
    .min(passwordMinimumLength),
  confirmPassword: string()
    .required(
      // t("validation.page.passwordreset.pleaseConfirmYourNewPassword", "Please confirm your new password")
      "validation.page.passwordreset.pleaseConfirmYourNewPassword"
    )
    // t("validation.page.passwordreset.passwordDoNotMatch", "The passwords do not match")
    .oneOf(
      [ref("password"), null],
      "validation.page.passwordreset.passwordDoNotMatch"
    ),
  acceptedTerms: bool().oneOf(
    [true],
    // t("validation.page.login.acceptedTermsRequiredError", "Please accep t out terms & conditions")
    "validation.page.register.acceptedTermsRequiredError"
  ),
});

export default UserSignupValidationSchema;
