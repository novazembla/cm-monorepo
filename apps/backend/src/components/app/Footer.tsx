import React from "react";
import { Box } from "@chakra-ui/react";

import { useSettings } from "~/hooks";

import { isEmptyHtml } from "~/utils";

export const Footer = ({ type = "full" }: { type?: string }) => {
  const settings = useSettings();

  if (!settings.contactInfo || isEmptyHtml(settings.contactInfo)) return null;

  return (
    <Box
      textAlign="center"
      dangerouslySetInnerHTML={{
        __html: settings.contactInfo,
      }}
      sx={{
        a: {},
      }}
    ></Box>
  );
};
