import React from "react";

import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ValidationSchemaLogin } from "../../validation";

import { useTranslation } from "react-i18next";

import { FieldInput } from "../../components/forms";
import { Button } from "@windmill/react-ui";
import { LanguageButtons } from "../../components/ui";
import { Link } from "react-router-dom";
import { httpAPI } from "../../services";

const Login = () => {
  const { t } = useTranslation();
  const formMethods = useForm({
    resolver: yupResolver(ValidationSchemaLogin),
  });
  const { handleSubmit } = formMethods;

  // TODO: fix data: object
  const onSubmit = (data: object) => {
    httpAPI.post('/api/v1/auth/forgot-password', data);
  };

  return (
    <>
      <div className="w-full max-w-sm mx-auto overflow-hidden bg-white filter drop-shadow-md rounded-lg shadow-md dark:bg-gray-800">
        <div className="px-6 py-4">
          <FormProvider {...formMethods}>
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
              <h2 className="text-3xl font-bold text-center text-gray-700 dark:text-white">
                {t("page.forgottenPassword.title", "Forgot your password?")}
              </h2>
              <p>{t(
                  "page.forgottenPassword.info",
                  "Enter your registered email to request a password reset link via email."
                )}</p>
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
              
              <div className="flex items-center justify-between mt-4">
                <Link
                  className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                  to="/"
                >{t(
                  "page.forgottenPassword.back_to_login",
                  "Back to login"
                )}
                </Link>

                <Button type="submit">
                  {t("page.forgottenPassword.form_button_login", "Request reset link")}
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
