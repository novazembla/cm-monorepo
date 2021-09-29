import React, { useState } from "react";
import type * as yup from "yup";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Link as RouterLink } from "react-router-dom";

import { PasswordRequestValidationSchema, yupIsFieldRequired } from "~/validation";

import { useTranslation } from "react-i18next";

import { TextErrorMessage, FieldInput, FieldRow, FormScrollInvalidIntoView } from "~/components/forms";

import { useAuthPasswordRequestMutation } from "~/hooks/mutations";

import { Heading, Text, Button, Flex, Box, Divider, Link } from "@chakra-ui/react";

import {
  AuthenticationPage,
  AuthenticationFormContainer,
} from "~/components/ui";

const PasswordRequest = () => {
  const [firstMutation, firstMutationResponse] = useAuthPasswordRequestMutation();
  const [isFormError, setIsFormError] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const { t } = useTranslation();

  const formMethods = useForm<any>({
    'mode':'onTouched',
    resolver: yupResolver(PasswordRequestValidationSchema),
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = formMethods;

  const onSubmit = async (
    data: yup.InferType<typeof PasswordRequestValidationSchema>
  ) => {
    setIsFormError(false);
    try {
      const { errors } = await firstMutation(data.email);
      if (!errors) {
        setIsFormSubmitted(true);
      } else {
        setIsFormError(true);
      }
    } catch (err) {
      setIsFormError(true);
    }
  };

  if (isFormSubmitted && !firstMutationResponse.error && !isFormError)
    return (
      <AuthenticationPage>
        <AuthenticationFormContainer>
          <Box mb="6">
            <Heading as="h2" mb="2">
              {t("page.passwordrequest.thankyou", "Thank you!")}
            </Heading>
          </Box>
          <Text>
            {t(
              "page.passwordrequest.requestInYourEmail",
              "We've sent you an email with a password request link. Please click the link provided to reset your password."
            )}
          </Text>
        </AuthenticationFormContainer>
      </AuthenticationPage>
    );

  //
  return (
    <AuthenticationPage>
      <AuthenticationFormContainer>
        <Box mb="6">
          <Heading as="h2" mb="2">
            {t("page.passwordrequest.title", "Forgot your password?")}
          </Heading>
          <Text>
            {t(
              "page.passwordrequest.info",
              "Enter your registered email to request a password reset link via email."
            )}
          </Text>
        </Box>
        <Divider/>
        <FormProvider {...formMethods}>
          <FormScrollInvalidIntoView />
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <fieldset>
              {isFormError && (
                //  t("page.passwordrequest.error", "The reset request has failed. Please try again.")
                <TextErrorMessage error="page.passwordrequest.error" />
              )}

              <FieldRow>
                <FieldInput
                  name="email"
                  id="email"
                  type="email"
                  label={t(
                    "page.passwordrequest.form_field_email_label",
                    "Email Address"
                  )}
                  isRequired={yupIsFieldRequired("email",PasswordRequestValidationSchema)}
                  settings={{
                    placeholder: t(
                      "page.passwordrequest.form_field_email_placeholder",
                      "Please enter your email address"
                    ),
                  }}
                />
              </FieldRow>
              <Divider/>
              <FieldRow>
                <Flex justify="space-between" alignItems="center" w="100%">
                  <Link as={RouterLink} to="/login">
                    {t("page.passwordrequest.back_to_login", "Back to login")}
                    {/* (TODO: TABINDEX?) */}
                  </Link>
                  <Button
                    isLoading={isSubmitting}
                    type="submit"
                    colorScheme="wine"
                  >
                    {t(
                      "page.passwordrequest.form_button_submit",
                      "Request reset link"
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
export default PasswordRequest;
