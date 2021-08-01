import React, { useState } from "react";
import {
  Heading,
  Text,
  Button,
  Flex,
  Box,
  Divider,
  Link,
} from "@chakra-ui/react";
import * as yup from "yup";
import { Link as RouterLink } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";

import { ValidationSchemaLogin, yupFieldIsRequired } from "~/validation";
import { useAuthLoginMutation } from "~/hooks/mutations";
import { useConfig } from "~/hooks";

import {
  AuthenticationPage,
  AuthenticationFormContainer,
} from "~/components/ui";
import { TextErrorMessage, FieldInput, FieldRow } from "~/components/forms";

const Login = () => {
  const config = useConfig();
  const [firstMutation] = useAuthLoginMutation();
  const [isFormError, setIsFormError] = useState(false);

  const { t } = useTranslation();

  const formMethods = useForm({
    mode: "onTouched",
    resolver: yupResolver(ValidationSchemaLogin),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = formMethods;

  const onSubmit = async (
    data: yup.InferType<typeof ValidationSchemaLogin>
  ) => {
    setIsFormError(false);
    try {
      const { errors } = await firstMutation(data.email, data.password);

      if (errors) setIsFormError(true);
 
    } catch (err) {
      console.log(1);
      setIsFormError(true);
    }
  };

  // t("page.login.error", "The login failed. Please try again.")
  return (
    <AuthenticationPage>
      <AuthenticationFormContainer>
        <Box mb="6">
          <Heading as="h2" mb="2">
            {t("page.login.title", "Login")}
          </Heading>
          <Text>
            {t(
              "page.login.prompt",
              "Please login to access the administration tool."
            )}
            {config.enableRegistration && (
              <>
                <br />
                {t(
                  "page.login.no_account_prompt",
                  "Don't have an account?"
                )}{" "}
                <Link as={RouterLink} to="/register">
                  {t("page.login.register_link", "Register as new user")}
                  {/* (TODO TABINDEX?) */}
                </Link>
              </>
            )}
          </Text>
        </Box>
        <Divider />
        <FormProvider {...formMethods}>
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <fieldset>
              {isFormError && <TextErrorMessage error="page.login.error" />}
              <FieldRow>
                <FieldInput
                  name="email"
                  id="email"
                  type="email"
                  label={t(
                    "page.login.form_field_login_label",
                    "Email Address"
                  )}
                  isRequired={yupFieldIsRequired(
                    "email",
                    ValidationSchemaLogin
                  )}
                  settings={{
                    placeholder: t(
                      "page.login.form_field_login_placeholder",
                      "Please enter your email address"
                    ),
                  }}
                />
              </FieldRow>
              <FieldRow>
                <FieldInput
                  name="password"
                  id="password"
                  type="password"
                  label={t(
                    "page.login.form_field_password_label",
                    "Your password"
                  )}
                  isRequired={yupFieldIsRequired(
                    "password",
                    ValidationSchemaLogin
                  )}
                  settings={{
                    placeholder: t(
                      "page.login.form_field_password_placeholder",
                      "Please enter your password"
                    ),
                  }}
                />
              </FieldRow>
              <Divider />
              <FieldRow>
                <Flex justify="space-between" alignItems="center" w="100%">
                  <Link as={RouterLink} to="/forgot-password">
                    {t(
                      "page.login.forgot_your_password",
                      "Forgot your password?"
                    )}
                    {/* (TODO: TABINDEX?) */}
                  </Link>
                  <Button
                    isLoading={isSubmitting}
                    type="submit"
                    colorScheme="wine"
                  >
                    {t("page.login.form_button_login", "Login")}
                  </Button>
                </Flex>
              </FieldRow>
            </fieldset>
          </form>
        </FormProvider>
      </AuthenticationFormContainer>
    </AuthenticationPage>
  );
};
export default Login;
