import React, { useState } from "react";
import { Heading, Text, Button, Flex } from "@chakra-ui/react";
import * as yup from "yup";
import { Link, useHistory } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";

import { ValidationSchemaLogin } from "~/validation";
import { useAuthLoginMutation } from "~/hooks/mutations";
import { ErrorMessage, FieldInput } from "~/components/forms";
import {
  AuthenticationPage,
  AuthenticationFormContainer,
} from "~/components/ui";

const Login = () => {
  const [firstMutation, firstMutationResults] = useAuthLoginMutation();
  const [isFormError, setIsFormError] = useState(false);

  const { t } = useTranslation();
  const history = useHistory();

  const formMethods = useForm({
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
      await firstMutation(data.email, data.password);
      history.push("/");
    } catch (err) {
      setIsFormError(true);
    }
  };

  // t("page.login.error", "The login failed. Please try again.")
  return (
    <AuthenticationPage>
      <Heading as="h2" mb="4">
        {t("page.login.title", "Login")}
      </Heading>
      <Text>
        {t(
          "page.login.prompt",
          "Please login to access the administration tool"
        )}
      </Text>

      <AuthenticationFormContainer>
        <FormProvider {...formMethods}>
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            onChange={() => {
              setIsFormError(false);
            }}
          >
            <fieldset>
              {isFormError && <ErrorMessage error="page.login.error" />}
              <div className="w-full mt-3">
                <FieldInput
                  name="email"
                  id="email"
                  type="email"
                  label={t(
                    "page.login.form_field_login_label",
                    "Email Address"
                  )}
                  data={{
                    required: true,
                    placeholder: t(
                      "page.login.form_field_login_placeholder",
                      "Please enter your email address"
                    ),
                  }}
                />
              </div>
              <div className="w-full mt-3">
                <FieldInput
                  name="password"
                  id="password"
                  type="password"
                  label={t(
                    "page.login.form_field_password_label",
                    "Your password"
                  )}
                  data={{
                    required: true,
                    placeholder: t(
                      "page.login.form_field_password_placeholder",
                      "Please enter your password"
                    ),
                  }}
                />
              </div>
              <div className="flex items-center justify-between mt-4">
                <Link
                  className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                  to="/register"
                >
                  {t("page.login.register", "Register as new user?")}
                  (xxx URL TABINDEX?)
                </Link>
                <Flex justify="space-between" alignItems="center">
                  <Link
                    className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                    to="/forgot-password"
                  >
                    {t(
                      "page.login.forgot_your_password",
                      "Forgot your password?"
                    )}
                    (xxx URL TABINDEX?)
                  </Link>
                  <Button
                    isLoading={isSubmitting}
                    type="submit"
                    colorScheme="pink"
                  >
                    {t("page.login.form_button_login", "Login")}
                  </Button>
                </Flex>
              </div>
            </fieldset>
          </form>
        </FormProvider>
      </AuthenticationFormContainer>
    </AuthenticationPage>
  );
};
export default Login;
