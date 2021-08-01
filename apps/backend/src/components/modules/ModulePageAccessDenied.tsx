import { Box, Text, Heading } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export const ModulePageAccessDenied = () => {
  const { t } = useTranslation();
  return (
    <>
      <Box
        layerStyle="pageContainerWhite"
        minH={{ base: "calc(100vh - 106px)", tw: "calc(100vh - 142px)" }}
      >
        <Heading as="h2" mb="2">
          {t("http.error.403.title", "Access denied")}
        </Heading>
        <Text mb="4">
          {t(
            "http.error.403.explanation",
            "You don't have permission to see this page."
          )}
        </Text>
      </Box>
    </>
  );
};
export default ModulePageAccessDenied;
