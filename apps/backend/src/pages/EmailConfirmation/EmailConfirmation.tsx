import React, { useState, useEffect } from "react";

import { Button, Box, Heading, Text, Flex } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { LoadingIcon } from "~/components/ui";

import { decodeJwt, JWTPayload} from "jose";

import {
  useAuthVerifyEmailMutation,
  useAuthRequestEmailVerificationEmail,
} from "~/hooks/mutations";
import { useAuthentication, useRouter } from "~/hooks";

import {
  AuthenticationPage,
  AuthenticationFormContainer,
} from "~/components/ui";
import { AuthenticatedApiUserData } from "@culturemap/core";

export interface TokenPayload extends JWTPayload {
  exp: number;
  iat: number;
  type: string;
  user?: AuthenticatedApiUserData;
}


const EmailConfirmation = () => {
  const router = useRouter();

  const [appUser, { isLoggedIn }] = useAuthentication();
  
  const token = router.query.token ?? "";

  const [verificationMutation, verificationMutationResults] =
    useAuthVerifyEmailMutation();
  const [requestMutation, requestMutationResults] =
    useAuthRequestEmailVerificationEmail();

  const [isTokenConfirmed, setIsTokenConfirmed] = useState(false);
  const [isTokenError, setIsTokenError] = useState(false);
  const [hasRequestedEmail, setHasRequestedEmail] = useState(false);
  const [isRequestingError, setIsRequestingError] = useState(false);

  const { t } = useTranslation();

  const confirmingToken = verificationMutationResults.loading;
  const confirmationError = verificationMutationResults.error;
  
  useEffect(() => {
    const confirmToken = async () => {
      try {
        const payload = decodeJwt<TokenPayload>(token);

        if (!payload || 
            (payload.exp && payload.exp * 1000 < Date.now()) ||
            (!payload?.user?.id))
          throw Error("Incorrect token provided");

        if (decodeJwt(token)) {
          const { errors } = await verificationMutation(token);
          if (!errors) {
            setIsTokenConfirmed(true);
          } else {
            setIsTokenError(true);
          }
        } else {
          setIsTokenError(true);
        }
      } catch (err) {
        setIsTokenError(true);
      }
    };

    if (token) confirmToken();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const requestAnotherEmail = async () => {
    setIsRequestingError(false);

    try {
      if (appUser?.id) {
        await requestMutation(appUser.id);
        setHasRequestedEmail(true);
      } else {
        setHasRequestedEmail(true);
        setIsRequestingError(true);
      }
    } catch (err) {
      setHasRequestedEmail(true);
      setIsRequestingError(true);
    }
  };

  let content = (<Flex height="220" alignItems="center" justify="center" position="relative"><LoadingIcon type="inline" size={90} /></Flex>);
  
  const buttonDashboardLogin = (<Text>
    <Button as={RouterLink} to={isLoggedIn() ? "/locations" : "/login"} textDecoration="none">
      {isLoggedIn()
        ? t(
            "page.emailconfirmation.button_goto_backend",
            "Goto backend"
          )
        : t("page.emailconfirmation.button_goto_login", "Goto login")}
    </Button>
  </Text>);

  if (hasRequestedEmail) 
    content = (
      <>
        <Box mb="6">
          <Heading as="h2" mb="2">
            {(isRequestingError || requestMutationResults.error) && t("general.error.title", "We are sorry")}
            {(!isRequestingError && !requestMutationResults.error) && t("page.emailconfirmation.requestsuccesstitles", "Thanky you")}
          </Heading>
        </Box>
        <Text>
          {(isRequestingError || requestMutationResults.error) && t(
            "page.emailconfirmation.errorExplanation",
            "We could not verify your email address based on the information provided."
          )}
          {(!isRequestingError && !requestMutationResults.error) && t("page.emailconfirmation.requestsuccessexplanation", "We've send you another email. Please check your inbox.")}
        </Text>
        <>{buttonDashboardLogin}</>
      </>
    );
  
  if (!confirmingToken && (isTokenError || confirmationError) && !hasRequestedEmail) 
    content = (
      <>
          <Box mb="6">
            <Heading as="h2" mb="2">
              {t("general.error.title", "We are sorry")}
            </Heading>
          </Box>
          <Text>
            {t(
              "page.emailconfirmation.errorExplanation",
              "We could not verify your email address based on the information provided."
            )}{" "}
            {(!isLoggedIn() &&
                t(
                  "page.emailconfirmation.logintoproceed",
                  "Please login to request another verification email."
                ))}
          </Text>

          {isLoggedIn() && (
            <>
              <Text>
                <Button
                  onClick={requestAnotherEmail}
                  isLoading={requestMutationResults.loading}
                >
                  {t(
                    "page.emailconfirmation.requestanotheremail",
                    "Request a new verification email."
                  )}
                </Button>
              </Text>
            </>
          )}
          {(!isLoggedIn()) && (
            <>{buttonDashboardLogin}</>
          )}
      </>
    );
  

  if (!confirmingToken && isTokenConfirmed)
    content = (
      <>
          <Box mb="6">
            <Heading as="h2" mb="2">
              {t("general.success.title", "Thank you!")}
            </Heading>
          </Box>
          <Text>
            {t(
              "page.emailconfirmation.youCanNowLogin",
              "Your email has been confirmed."
            )}
          </Text>

          <>{buttonDashboardLogin}</>
        </>
    );

  return (
    <AuthenticationPage>
      <AuthenticationFormContainer>
        {content}
      </AuthenticationFormContainer>
    </AuthenticationPage>
  );
};
export default EmailConfirmation;
