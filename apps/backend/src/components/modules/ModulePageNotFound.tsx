// import { useFetch } from "~/hooks/useFetch";
// const users = useFretch('xxx');

import { Box, Text, Heading } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export const ModulePageNotFound = () => {
  const { t } = useTranslation();
  return (
    <>
      <Box layerStyle="pageContainerWhite">
        <Heading as="h2" mb="2">
          {t("http.error.404.title", "Not found")}
        </Heading>
        <Text mb="4">
          {t(
            "http.error.404.explanation",
            "The requested URL could not be found."
          )}
        </Text>
      </Box>
    </>
  );
};
export default ModulePageNotFound;
