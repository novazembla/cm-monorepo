import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

export const NotFound = () => {
  const { t } = useTranslation();

  return (
    <Box textAlign="center" mt="6">
      <Heading as="h2" mb="2">
        {t("http.error.404.title", "Not found")}
      </Heading>
      <Text mb="4">
        {t(
          "http.error.404.explanation",
          "The requested URL could not be found."
        )}
      </Text>

      <Button mt="4" as={NavLink} to="/">
        {t("http.error.404.backtohome", "Go back to home screen")}
      </Button>
    </Box>
  );
};
export default NotFound;
