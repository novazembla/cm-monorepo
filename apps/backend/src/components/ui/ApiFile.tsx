import React from "react";
import { FileStatus } from "@culturemap/core";
import type { ApiFileMetaInformation } from "@culturemap/core";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";


export type ApiFileProps = {
  id: number | undefined; // TODO finish
  meta?: ApiFileMetaInformation;
  status: FileStatus;
  allowDownload: boolean;
}

export const ApiFile = ({
  id,
  meta,
  status,
  allowDownload,
}: ApiFileProps) => {
  const { t } = useTranslation();

  let content;
  
  if (
    status === FileStatus.READY
  ) {
    content = "xxx show file info here";
  }

  return <Box>{content}</Box>;
};
