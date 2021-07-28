import React, { useState, useEffect } from "react";

import { Button, Box, Heading, Text, Flex } from "@chakra-ui/react";
import { useHistory, useLocation } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { PageLoading } from "~/components/ui";

import { useAuthConfirmEmailMutation } from "~/hooks/mutations";
import { useAuthentication } from "~/hooks";

import { AuthenticationPage, AuthenticationFormContainer} from "~/components/ui";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

const EmailConfirmation = () => {
  const [, { isLoggedIn }] = useAuthentication();
  const query = useQuery();
  const token = query.get("token");

  const [firstMutation, firstMutationResults] = useAuthConfirmEmailMutation();
  
  const [isTokenConfirmed, setIsTokenConfirmed] = useState(false);

  const { t } = useTranslation();

  const confirmingToken = firstMutationResults.loading;
  const confirmationError = firstMutationResults.error;

  const history = useHistory();
  useEffect(() => {
    const confirmToken = async () => {
      try {
        await firstMutation(token ?? '');
        setIsTokenConfirmed(true);
      } catch (err) {
        setIsTokenConfirmed(false);
      }
    }

    if (token)
      confirmToken();

  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // todo make better TODO: 
  if (!confirmingToken && confirmationError)
    return (
      <AuthenticationPage>
        <AuthenticationFormContainer>
          <Box mb="6">
            <Heading as="h2" mb="2">
            {t("page.emailconfirmation.error", "Oops!")}
            </Heading>
          </Box>
          <Text>
            {t("page.emailconfirmation.errorExplanation", "We could not verify your email address.")}
            <br/><br/>TODO: add some logic to request a new verification email if user is logged in
          </Text>

          <Text>
            <Button onClick={() => history.push(isLoggedIn()? "/" : "/login")}>
              {(isLoggedIn())? t("page.emailconfirmation.button_goto_dashboard", "Goto dashboard") : t("page.emailconfirmation.button_goto_login", "Goto login")}
            </Button>
          </Text>
        </AuthenticationFormContainer>
      </AuthenticationPage>

    );

  if (!confirmingToken && isTokenConfirmed)
    return (
      <AuthenticationPage>
        <AuthenticationFormContainer>
          <Box mb="6">
            <Heading as="h2" mb="2">
            {t("page.emailconfirmation.thankyou", "Thank you!")}
            </Heading>
          </Box>
          <Text>
          {t("page.emailconfirmation.youCanNowLogin", "Your email has been confirmed.")}
          </Text>

          <Text>
            <Button onClick={() => history.push(isLoggedIn()? "/" : "/login")}>
              {(isLoggedIn())? t("page.emailconfirmation.button_goto_dashboard", "Goto dashboard") : t("page.emailconfirmation.button_goto_login", "Goto login")}
            </Button>
          </Text>
        </AuthenticationFormContainer>
      </AuthenticationPage>
    );

  return <AuthenticationPage>
        <AuthenticationFormContainer>
          <Flex height="220" alignItems="center" justify="center">
            <PageLoading/>
          </Flex>          
        </AuthenticationFormContainer>
      </AuthenticationPage>
  
  
  

};
export default EmailConfirmation;
