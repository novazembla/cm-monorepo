import React, { useState } from "react";
import type * as yup from "yup";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";

import { UserSignupValidationSchema, yupIsFieldRequired } from "~/validation";

import { useUserSignupMutation } from "~/hooks/mutations";

import {
  TextErrorMessage,
  FieldInput,
  FieldRow,
  FieldSwitch,
  TwoColFieldRow,
  FormScrollInvalidIntoView,
} from "~/components/forms";

import {
  Heading,
  Text,
  Button,
  Flex,
  Box,
  Divider,
  Link,
} from "@chakra-ui/react";

import {
  AuthenticationPage,
  AuthenticationFormContainer,
} from "~/components/ui";

const Signup = () => {
  const [firstMutation, firstMutationResults] = useUserSignupMutation();
  const [isFormError, setIsFormError] = useState(false);
  const [isFormEmailError, setIsFormEmailError] = useState(false);

  const { t } = useTranslation();
  const history = useHistory();

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(UserSignupValidationSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = formMethods;

  const onSubmit = async (
    data: yup.InferType<typeof UserSignupValidationSchema>
  ) => {
    setIsFormError(false); // TODO: how to have this clear set on form change, also how to set the form fields to not valid to make them red...
    setIsFormEmailError(false);
    try {
      const { errors } = await firstMutation(data);
      if (!errors) {
        history.push("/");
      } else {
        if (errors[0].message === "Email already taken")
          setIsFormEmailError(true);
        setIsFormError(true);
      }
    } catch (err) {
      setIsFormError(true);
    }
  };

  // t("page.register.error", "We're sorry something went wrong. Please check your data and try again.")
  // t("page.register.emailtaken", "The given email address is already in use. Maybe you did forget your password?")
  return (
    <>
      <AuthenticationPage>
        <AuthenticationFormContainer>
          <Box mb="6">
            <Heading as="h2" mb="2">
              {t("page.register.title", "Register as new User")}
            </Heading>
            <Text>
              {t(
                "page.register.prompt",
                "Please fill in the form to register as a new user."
              )}
            </Text>
          </Box>
          <Divider />

          <FormProvider {...formMethods}>
            <FormScrollInvalidIntoView/>
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <fieldset disabled={disableForm}>
                {isFormError && (
                  <TextErrorMessage error={`page.register.${isFormEmailError ? "emailtaken":"error"}`} />
                )}

                <TwoColFieldRow>
                  <FieldRow>
                    <FieldInput
                      name="firstName"
                      id="firstName"
                      type="text"
                      label={t(
                        "page.register.form_field_firstName_label",
                        "First Name"
                      )}
                      isRequired={yupIsFieldRequired(
                        "firstName",
                        UserSignupValidationSchema
                      )}
                      settings={{
                        placeholder: t(
                          "page.register.form_field_firstName_placeholder",
                          "Your first name"
                        ),
                      }}
                    />
                  </FieldRow>
                  <FieldRow>
                    <FieldInput
                      name="lastName"
                      id="lastName"
                      type="text"
                      label={t(
                        "page.register.form_field_lastName_label",
                        "Last Name"
                      )}
                      isRequired={yupIsFieldRequired(
                        "lastName",
                        UserSignupValidationSchema
                      )}
                      settings={{
                        placeholder: t(
                          "page.register.form_field_lastName_placeholder",
                          "Your last name"
                        ),
                      }}
                    />
                  </FieldRow>
                </TwoColFieldRow>
                <FieldRow>
                  <FieldInput
                    name="email"
                    id="email"
                    type="email"
                    label={t(
                      "page.register.form_field_registration_label",
                      "Email Address"
                    )}
                    isRequired={yupIsFieldRequired(
                      "email",
                      UserSignupValidationSchema
                    )}
                    settings={{
                      placeholder: t(
                        "page.register.form_field_registration_placeholder",
                        "Please enter your email address"
                      ),
                    }}
                  />
                </FieldRow>
                {/* TODO: needs password confirmation */}
                <FieldRow>
                  <FieldInput
                    name="password"
                    id="password"
                    type="password"
                    label={t(
                      "page.register.form_field_password_label",
                      "Your password"
                    )}
                    isRequired={yupIsFieldRequired(
                      "password",
                      UserSignupValidationSchema
                    )}
                    settings={{
                      autoComplete: "new-password",
                      placeholder: t(
                        "page.register.form_field_password_placeholder",
                        "Please enter your password"
                      ),
                    }}
                  />
                </FieldRow>
                <FieldRow>
                  <FieldInput
                    name="confirmPassword"
                    id="confirmPassword"
                    type="password"
                    label={t(
                      "page.passwordreset.form_field_password_confirmation_label",
                      "Confirm your new password"
                    )}
                    isRequired={yupIsFieldRequired(
                      "password",
                      UserSignupValidationSchema
                    )}
                    settings={{
                      autoComplete: "new-password",
                      placeholder: t(
                        "page.passwordreset.form_field_password_confirm_placeholder",
                        "Please confirm your password"
                      ),
                    }}
                  />
                </FieldRow>
                <FieldRow>
                  <FieldSwitch
                    name="acceptedTerms"
                    label={
                      <span>
                        {t(
                          "page.register.accpt_terms_and_conditions",
                          "I do accept the terms and conditions"
                        )}
                      </span>
                    }
                    isRequired={yupIsFieldRequired(
                      "acceptedTerms",
                      UserSignupValidationSchema
                    )}
                  />
                </FieldRow>
                <Divider />
                <FieldRow>
                  <Flex justify="space-between" alignItems="center" w="100%">
                    <Link as={RouterLink} to="/login">
                      {t("page.signup.back_to_login", "Back to login")}
                      {/* (TODO: TABINDEX?) */}
                    </Link>
                    <Button
                      isLoading={isSubmitting}
                      type="submit"
                      colorScheme="wine"
                    >
                      {t("page.register.form_button_submit", "Register")}
                    </Button>
                  </Flex>
                </FieldRow>
              </fieldset>
            </form>
          </FormProvider>
        </AuthenticationFormContainer>
      </AuthenticationPage>
    </>
  );
};
export default Signup;
