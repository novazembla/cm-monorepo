import React, { useState, useEffect } from "react";
import * as yup from "yup";

import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { Link, useHistory, useLocation } from "react-router-dom";

import { ValidationSchemaPasswordReset } from "~/validation";

import { useTranslation } from "react-i18next";

import { ErrorMessage, FieldInput, FieldRow } from "~/components/forms";

import { useAuthPasswordResetMutation } from "~/hooks/mutations";

import { Heading, Text, Button, Flex, Box, Divider } from "@chakra-ui/react";

import {
  AuthenticationPage,
  AuthenticationFormContainer,
} from "~/components/ui";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const PasswordReset = () => {
  const query = useQuery();
  const token = query.get("token");

  const [firstMutation] = useAuthPasswordResetMutation();
  const [isFormError, setIsFormError] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const { t } = useTranslation();

  const formMethods = useForm({
    resolver: yupResolver(ValidationSchemaPasswordReset),
  });

  const {
    handleSubmit,
    trigger,
    formState: { isSubmitting },
  } = formMethods;

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
      <AuthenticationPage>
        <AuthenticationFormContainer>
          <Box mb="6">
            <Heading as="h2" mb="2">
            {t("page.passwordreset.thankyou", "Thank you!")}
            </Heading>
          </Box>
          <Text>
            {t("page.passwordreset.youCanNowLogin", "Your password has been reset.")}
          </Text>

          <Text>
          <Button type="submit" onClick={() => history.push("/login")}>
              {t("page.passwordreset.button_goto_login", "Goto login")}
            </Button>
          </Text>
        </AuthenticationFormContainer>
      </AuthenticationPage>
    );


  
  return (
    <AuthenticationPage>
      <AuthenticationFormContainer>
        <Box mb="6">
          <Heading as="h2" mb="2">
          {t("page.passwordreset.title", "Reset your password?")}
          </Heading>
          <Text>
          {t(
                    "page.passwordreset.info",
                    "Enter your new password and confirm it in the second field."
                  )}
          </Text>
        </Box>
        <Divider/>
          <FormProvider {...formMethods}>
            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              onChange={() => {
                trigger();
                setIsFormError(false);
              }}
            >
              <fieldset>
                {isFormError && (
                  // t("page.passwordreset.error", "The request has failed. Please try again.")
                  <ErrorMessage error="page.passwordreset.error" />
                )}
   
                <FieldRow>
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
                </FieldRow>

                <FieldRow>
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
                </FieldRow>
                <Divider/>
                <FieldRow>
                <Flex justify="space-between" alignItems="center" w="100%">
                  <Link to="/login">
                    {t("page.passwordreset.back_to_login", "Back to login")}
                    {/* (TODO: TABINDEX?) */}
                  </Link>
                  <Button
                    isLoading={isSubmitting}
                    type="submit"
                    colorScheme="wine"
                  >
                    {t(
                      "page.passwordreset.form_button_submit",
                      "Change password"
                    )}
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
export default PasswordReset;
