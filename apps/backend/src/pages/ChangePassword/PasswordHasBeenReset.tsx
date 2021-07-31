import { useHistory } from "react-router-dom";

import { useTranslation } from "react-i18next";

import { Heading, Text, Button, Box } from "@chakra-ui/react";

import {
  AuthenticationPage,
  AuthenticationFormContainer,
} from "~/components/ui";


const PasswordReset = () => {
  const history = useHistory();
  const { t } = useTranslation();

  return (
    <AuthenticationPage>
      <AuthenticationFormContainer>
        <Box mb="6">
          <Heading as="h2" mb="2">
          {t("general.success.title", "Thank you!")}
          </Heading>
        </Box>
        <Text>
          {t("page.passwordreset.youPasswordHasBeenResetPleaseReauthenticate", "Your password has been changed. Please login again.")}
        </Text>

        <Text>
        <Button type="submit" onClick={() => history.push("/login")}>
            {t("page.passwordreset.button_goto_login", "Goto login")}
          </Button>
        </Text>
      </AuthenticationFormContainer>
    </AuthenticationPage>
  );

};
export default PasswordReset;
