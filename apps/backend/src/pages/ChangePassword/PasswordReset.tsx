import React, { useState, useEffect } from "react";
import type * as yup from "yup";

import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { Link as RouterLink } from "react-router-dom";

import { PasswordResetValidationSchema, yupIsFieldRequired } from "~/validation";

import { useTranslation } from "react-i18next";

import { TextErrorMessage, FieldInput, FieldRow, FormScrollInvalidIntoView } from "~/components/forms";

import { useAuthPasswordResetMutation } from "~/hooks/mutations";

import { Heading, Text, Button, Flex, Box, Divider, Link } from "@chakra-ui/react";
import { useRouter } from "~/hooks";
import {
  AuthenticationPage,
  AuthenticationFormContainer,
} from "~/components/ui";

const PasswordReset = () => {
  const router = useRouter();
  
  const token = router.query?.token;

  const [firstMutation] = useAuthPasswordResetMutation();
  const [hasFormError, setHasFormError] = useState(false);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);

  const { t } = useTranslation();

  const formMethods = useForm<any>({
    'mode':'onTouched',
    resolver: yupResolver(PasswordResetValidationSchema as any),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = formMethods;

  useEffect(() => {
    if (!token) {
      router.push("/login");
    } else {
    }
  }, [token, router]);

  const onSubmit = async (data: yup.InferType<typeof PasswordResetValidationSchema>) => {
    setHasFormError(false);
    try {
      const { errors } = await firstMutation(data.newPassword, token ?? '');
      if (!errors) {
        setIsFormSubmitted(true);
      } else {
        setHasFormError(true);
      }
    } catch (err) {
      setHasFormError(true);
    }
  };

  if (isFormSubmitted)
    return (
      <AuthenticationPage>
        <AuthenticationFormContainer>
          <Box mb="6">
            <Heading as="h2" mb="2">
            {t("general.success.title", "Thank you!")}
            </Heading>
          </Box>
          <Text>
            {t("page.passwordreset.youCanNowLogin", "Your password has been reset.")}
          </Text>

          <Text>
          <Button as={RouterLink} to="/login">
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
            <FormScrollInvalidIntoView/>
            <form
              noValidate
              onSubmit={handleSubmit(onSubmit)}
            >
              <fieldset>
                {hasFormError && (
                  // t("general.error.requestfailed", "The request has failed. Please try again.")
                  <TextErrorMessage error="page.passwordreset.error" />
                )}
   
                <FieldRow>
                  <FieldInput
                    name="newPassword"
                    id="newPassword"
                    type="password"
                    label={t(
                      "page.passwordreset.form_field_password_label",
                      "New Password"
                    )}
                    isRequired={yupIsFieldRequired("newPassword",PasswordResetValidationSchema)}
                    settings={{
                      autoComplete: "new-password",
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
                      "Confirm your new password"
                    )}
                    isRequired={yupIsFieldRequired("confirmPassword",PasswordResetValidationSchema)}
                    settings={{
                      autoComplete: "new-password",
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
                  <Link as={RouterLink}  to="/login">
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
