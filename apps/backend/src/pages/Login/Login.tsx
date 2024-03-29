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
import type * as yup from "yup";
import { Link as RouterLink } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";

import { UserLoginValidationSchema, yupIsFieldRequired } from "~/validation";
import { useAuthLoginMutation } from "~/hooks/mutations";
import { useConfig } from "~/hooks";

import {
  AuthenticationPage,
  AuthenticationFormContainer,
} from "~/components/ui";
import {
  TextErrorMessage,
  FieldInput,
  FieldRow,
  FormScrollInvalidIntoView,
} from "~/components/forms";

const Login = () => {
  const config = useConfig();
  const [firstMutation] = useAuthLoginMutation();
  const [hasFormError, setHasFormError] = useState(false);

  const { t } = useTranslation();

  const formMethods = useForm<any>({
    mode: "onTouched",
    resolver: yupResolver(UserLoginValidationSchema as any),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = formMethods;

  const onSubmit = async (
    data: yup.InferType<typeof UserLoginValidationSchema>
  ) => {
    setHasFormError(false);
    try {
      const { errors } = await firstMutation(data.email, data.password);

      if (errors) setHasFormError(true);
    } catch (err) {
      setHasFormError(true);
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
            {config.enableOpenRegistration && (
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
          <FormScrollInvalidIntoView />
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <fieldset>
              {hasFormError && <TextErrorMessage error="page.login.error" />}
              <FieldRow>
                <FieldInput
                  name="email"
                  id="email"
                  type="email"
                  label={t(
                    "page.login.form_field_login_label",
                    "Email Address"
                  )}
                  isRequired={yupIsFieldRequired(
                    "email",
                    UserLoginValidationSchema
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
                  isRequired={yupIsFieldRequired(
                    "password",
                    UserLoginValidationSchema
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
