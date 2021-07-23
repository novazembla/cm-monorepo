import React, { useState, useEffect } from "react";
import * as yup from "yup";

import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "@windmill/react-ui";
import { Link, useHistory, useLocation } from "react-router-dom";

import { ValidationSchemaPasswordReset } from "../../validation";

import { useTranslation } from "react-i18next";

import { ErrorMessage, FieldInput } from "../../components/forms";

import { LanguageButtons } from "../../components/ui";

import { useAuthPasswordResetMutation } from "../../hooks/mutations";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const PasswordReset = () => {
  const query = useQuery();
  const token = query.get("token");

  const [firstMutation, firstMutationResults] = useAuthPasswordResetMutation();
  const [isFormError, setIsFormError] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const { t } = useTranslation();

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm({
    resolver: yupResolver(ValidationSchemaPasswordReset),
  });

  const { handleSubmit, trigger } = formMethods;
  const history = useHistory();
  useEffect(() => {
    if (!token) {
      history.push("/login");
    } else {
    }
  }, [token, history]);

  const onSubmit = async (data: yup.InferType<typeof ValidationSchemaPasswordReset>) => {
    setIsFormError(false);
    try {
      await firstMutation(data.newPassword, token ?? '');
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
            {t("page.passwordreset.thankyou", "Thank you!")}
          </h2>
          <p>{t("page.passwordreset.youCanNowLogin", "You can now login.")}</p>
          <p>
            <Button type="submit" onClick={() => history.push("/login")}>
              {t("page.passwordreset.button_goto_login", "Goto login")}
            </Button>
          </p>
        </div>
      </div>
    );

  // t("page.passwordreset.error", "The request has failed. Please try again.")
  return (
    <>
      <div className="w-full max-w-sm mx-auto overflow-hidden bg-white filter drop-shadow-md rounded-lg shadow-md dark:bg-gray-800">
        <div className="px-6 py-4">
          <FormProvider {...formMethods}>
            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              onChange={() => {
                trigger();
                setIsFormError(false);
              }}
            >
              <fieldset disabled={disableForm}>
                <h2 className="text-3xl font-bold text-center text-gray-700 dark:text-white">
                  {t("page.passwordreset.title", "Reset your password?")}
                </h2>
                {isFormError && (
                  <ErrorMessage error="page.passwordreset.error" />
                )}
                <p>
                  {t(
                    "page.passwordreset.info",
                    "Enter your new password and confirm it in the second field."
                  )}
                </p>
                <div className="w-full mt-3">
                  <FieldInput
                    name="newPassword"
                    id="newPassword"
                    type="password"
                    label={t(
                      "page.passwordreset.form_field_password_label",
                      "Password"
                    )}
                    data={{
                      placeholder: t(
                        "page.passwordreset.form_field_password_placeholder",
                        "Please enter your password"
                      ),
                    }}
                  />
                </div>

                <div className="w-full mt-3">
                  <FieldInput
                    name="confirmPassword"
                    id="confirmPassword"
                    type="password"
                    label={t(
                      "page.passwordreset.form_field_password_confirmation_label",
                      "Password confirmation"
                    )}
                    data={{
                      placeholder: t(
                        "page.passwordreset.form_field_password_confirm_placeholder",
                        "Please confirm your password"
                      ),
                    }}
                  />
                </div>

                <div className="flex items-center justify-between mt-4">
                  <Link
                    className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                    to="/"
                  >
                    {t("page.passwordreset.back_to_login", "Back to login")}
                  </Link>

                  <Button type="submit">
                    {t(
                      "page.passwordreset.form_button_submit",
                      "Change password"
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
export default PasswordReset;
