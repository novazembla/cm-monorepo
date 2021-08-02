import React from "react";
import { Box, Link } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import { useSettings } from "~/hooks";

export const Footer = ({ type = "full" }: { type?: string }) => {
  const settings = useSettings();

  const { t } = useTranslation();

  return (
    <Box textAlign="center">
      <Link
        href={`mailto:${settings.contactEmail}`}
        color={type === "light" ? "wine.700" : "wine.700"}
      >
        {t("footer.contactLink.title", "Contact")}
      </Link>
    </Box>
  );
};
