import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { Button } from "@windmill/react-ui";

import { ValidationSchemaLogin } from "../../validation";
import { setAuthTokens } from "axios-jwt";

import { ErrorMessage, FieldInput } from "../../components/forms";
import { LanguageButtons } from "../../components/ui";

import { httpAPI } from "../../services";

type dataLogin = {
  email: string;
  password: string;
}

const Login = () => {
  const [isLoginError, setIsLoginError] = useState(false);
  const { t } = useTranslation();
  const history = useHistory();

  const formMethods = useForm({
    resolver: yupResolver(ValidationSchemaLogin),
  });
  const { handleSubmit } = formMethods;

  const onSubmit = async (data: dataLogin) => {
    setIsLoginError(false); // TODO: how to have this clear set on form change, also how to set the form fields to not valid to make them red...
    try {
      const response = await httpAPI.post("/api/v1/auth/login", data);

      // save tokens to storage
      setAuthTokens({
        accessToken: response?.data?.tokens?.access,
        refreshToken: response?.data?.tokens?.refresh,
      });

      history.push("/");
    } catch (err) {
      setIsLoginError(true);
    }
  }; 

  // t("page.login.error", "The login failed. Please try again.")
  return (
    <>
      <div className="w-full max-w-sm mx-auto overflow-hidden bg-white filter drop-shadow-md rounded-lg shadow-md dark:bg-gray-800">
        <div className="px-6 py-4">
          <FormProvider {...formMethods}>
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <h2 className="text-3xl font-bold text-center text-gray-700 dark:text-white">
                {t("page.login.title", "Login")}
              </h2>
              {isLoginError && <ErrorMessage error="page.login.error" />}
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
                  to="/forgot-password"
                >
                  {t(
                    "page.login.forgot_your_password",
                    "Forgot your password?"
                  )}
                  (xxx URL TABINDEX?)
                </Link>
                <Link
                  className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                  to="/register"
                >
                  {t(
                    "page.login.register",
                    "Register as new user?"
                  )}
                  (xxx URL TABINDEX?)
                </Link>


                <Button type="submit">
                  {t("page.login.form_button_login", "Login")}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
      <LanguageButtons />
    </>
  );
};
export default Login;
