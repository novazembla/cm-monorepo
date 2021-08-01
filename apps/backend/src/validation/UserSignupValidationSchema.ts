import * as yup from "yup";

import translations from "./translations";

yup.setLocale(translations);

export const UserSignupValidationSchema = yup.object().shape({
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
  password: yup.string().required(
    // t("validation.page.login.passwordRequiredError", "Please enter your password")
    "validation.page.register.passwordRequiredError"
  ).min(12),
  confirmPassword: yup
    .string()
    .required(
      // t("validation.page.passwordreset.pleaseConfirmYourNewPassword", "Please confirm your new password")
      "validation.page.passwordreset.pleaseConfirmYourNewPassword"
    )
    // t("validation.page.passwordreset.passwordDoNotMatch", "The passwords do not match")
    .oneOf([yup.ref("password"), null], "validation.page.passwordreset.passwordDoNotMatch"),
  acceptedTerms: yup
    .bool()
    .oneOf(
      [true],
      // t("validation.page.login.acceptedTermsRequiredError", "Please accep t out terms & conditions")
      "validation.page.register.acceptedTermsRequiredError"
    ),
  
});

export default UserSignupValidationSchema;
