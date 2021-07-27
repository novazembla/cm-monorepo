import React, { useState } from "react";
import * as yup from "yup";
import { Link, useHistory } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";

import { ValidationSchemaRegister } from "~/validation";

import { useUserSignupMutation } from "~/hooks/mutations";

import {
  ErrorMessage,
  FieldInput,
  FieldRow,
  FieldCheckbox,
} from "~/components/forms";

import { Heading, Text, Button, Flex, Box, Divider } from "@chakra-ui/react";

import {
  AuthenticationPage,
  AuthenticationFormContainer,
} from "~/components/ui";

const Signup = () => {
  const [firstMutation, firstMutationResults] = useUserSignupMutation();
  const [isFormError, setIsFormError] = useState(false);

  const { t } = useTranslation();
  const history = useHistory();

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm({
    resolver: yupResolver(ValidationSchemaRegister),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = formMethods;

  const onSubmit = async (
    data: yup.InferType<typeof ValidationSchemaRegister>
  ) => {
    setIsFormError(false); // TODO: how to have this clear set on form change, also how to set the form fields to not valid to make them red...
    try {
      await firstMutation(data);
      history.push("/");
    } catch (err) {
      setIsFormError(true);
    }
  };

  // t("page.register.error", "The login failed. Please try again.")
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
            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              onChange={() => {
                setIsFormError(false);
              }}
            >
              <fieldset disabled={disableForm}>
                {isFormError && <ErrorMessage error="page.register.error" />}
                <FieldRow>
                  <FieldInput
                    name="firstName"
                    id="firstName"
                    type="text"
                    label={t(
                      "page.register.form_field_firstName_label",
                      "First Name"
                    )}
                    data={{
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
                    data={{
                      placeholder: t(
                        "page.register.form_field_lastName_placeholder",
                        "Your last name"
                      ),
                      onChange: () => {
                        setIsFormError(false);
                      },
                    }}
                  />
                </FieldRow>
                <FieldRow>
                  <FieldInput
                    name="email"
                    id="email"
                    type="email"
                    label={t(
                      "page.register.form_field_registration_label",
                      "Email Address"
                    )}
                    data={{
                      placeholder: t(
                        "page.register.form_field_registration_placeholder",
                        "Please enter your email address"
                      ),
                      onChange: () => {
                        setIsFormError(false);
                      },
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
                    data={{
                      placeholder: t(
                        "page.register.form_field_password_placeholder",
                        "Please enter your password"
                      ),
                    }}
                  />
                </FieldRow>
                <FieldRow>
                  <FieldCheckbox
                    name="acceptedTerms"
                    label={"xxxx fix TODO: "}
                  />
                </FieldRow>
                <Divider />
                <FieldRow>
                  <Flex justify="space-between" alignItems="center" w="100%">
                    <Link to="/login">
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
