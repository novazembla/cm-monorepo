import React, { useState } from "react";
import * as yup from "yup";
import { Link, useHistory } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { Button } from "@windmill/react-ui";

import { ValidationSchemaRegister } from "~/validation";

import { useUserSignupMutation } from "~/hooks/mutations";

import { ErrorMessage, FieldInput } from "~/components/forms";
import { LanguageButtons } from "~/components/ui";

// TODO: needs email confirmation

const Signup = () => {
  const [firstMutation, firstMutationResults] = useUserSignupMutation();
  const [isFormError, setIsFormError] = useState(false);

  const { t } = useTranslation();
  const history = useHistory();

  const disableForm = firstMutationResults.loading;

  const formMethods = useForm({
    resolver: yupResolver(ValidationSchemaRegister),
  });
  const { handleSubmit, register } = formMethods;

  const onSubmit = async (data: yup.InferType<typeof ValidationSchemaRegister>) => {
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
                {t("page.register.title", "Register as new User")}
              </h2>
              {isFormError && <ErrorMessage error="page.register.error" />}
              <div className="w-full mt-3">
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
                    )
                  }}
                />
              </div>
              <div className="w-full mt-3">
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
              </div>
              <div className="w-full mt-3">
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
              </div>
              <div className="w-full mt-3">
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
              </div>
              <div className="w-full mt-3">
                <input
                  type="checkbox"
                  id="acceptedTerms"
                  checked
                  {...register("acceptedTerms")}
                />
                Terms are great!
              </div>

              <div className="flex items-center justify-between mt-4">
                <Link
                  className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                  to="/login"
                >
                  {t("page.register.form_button_goto_login", "Login")}
                  (xxx URL TABINDEX?)
                </Link>
                <Button type="submit">
                  {t("page.register.form_button_submit", "Register")}
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
export default Signup;
