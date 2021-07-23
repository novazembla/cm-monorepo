import React, { useState } from "react";
import * as yup from "yup";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@windmill/react-ui";
import { Link } from "react-router-dom";

import { ValidationSchemaPasswordRequest } from "../../validation";

import { useTranslation } from "react-i18next";

import { ErrorMessage, FieldInput } from "../../components/forms";

import { LanguageButtons } from "../../components/ui";

import { useAuthPasswordRequestMutation } from "../../hooks/mutations";

const PasswordRequest = () => {
  const [firstMutation, firstMutationResults] =
    useAuthPasswordRequestMutation();
  const [isFormError, setIsFormError] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const { t } = useTranslation();

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm({
    resolver: yupResolver(ValidationSchemaPasswordRequest),
  });
  const { handleSubmit } = formMethods;

  const onSubmit = async (data: yup.InferType<typeof ValidationSchemaPasswordRequest>) => {
    setIsFormError(false); 
    try {
      await firstMutation(data.email);
      setIsFormSubmitted(true);
    } catch (err) {
      setIsFormError(true);
    }
  };

  if (isFormSubmitted)
    return (
      <div className="w-full max-w-sm mx-auto overflow-hidden bg-white filter drop-shadow-md rounded-lg shadow-md dark:bg-gray-800">
        <div className="px-6 py-4">
          <h2 className="text-3xl font-bold text-center text-gray-700 dark:text-white">
            {t("page.passwordrequest.thankyou", "Thank you!")}
          </h2>
          <p>
            {t(
              "page.passwordrequest.requestInYourEmail",
              "We've sent you an email with a password request link. Please click the link provided to reset your password."
            )}
          </p>
        </div>
      </div>
    );

  // t("page.passwordrequest.error", "The reset request has failed. Please try again.")
  return (
    <>
      <div className="w-full max-w-sm mx-auto overflow-hidden bg-white filter drop-shadow-md rounded-lg shadow-md dark:bg-gray-800">
        <div className="px-6 py-4">
          <FormProvider {...formMethods}>
            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              onChange={() => {
                setIsFormError(false);
              }}
            >
              <fieldset disabled={disableForm}>
              <h2 className="text-3xl font-bold text-center text-gray-700 dark:text-white">
                {t("page.passwordrequest.title", "Forgot your password?")}
              </h2>
              {isFormError && <ErrorMessage error="page.passwordrequest.error" />}
              <p>
                {t(
                  "page.passwordrequest.info",
                  "Enter your registered email to request a password reset link via email."
                )}
              </p>
              <div className="w-full mt-3">
                <FieldInput
                  name="email"
                  id="email"
                  type="email"
                  label={t(
                    "page.passwordrequest.form_field_email_label",
                    "Email Address"
                  )}
                  data={{
                    placeholder: t(
                      "page.passwordrequest.form_field_email_placeholder",
                      "Please enter your email address"
                    ),
                  }}
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <Link
                  className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                  to="/"
                >
                  {t("page.passwordrequest.back_to_login", "Back to login")}
                </Link>

                <Button type="submit">
                  {t(
                    "page.passwordrequest.form_button_submit",
                    "Request reset link"
                  )}
                </Button>
              </div>
              </fieldset>
            </form>
          </FormProvider>
        </div>
      </div>
      <LanguageButtons />
    </>
  );
};
export default PasswordRequest;
