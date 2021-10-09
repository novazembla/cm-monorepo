import React from "react";
import { FileStatus } from "@culturemap/core";
import type { ApiFileMetaInformation } from "@culturemap/core";
import { Flex, Box, chakra } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export type ApiFileProps = {
  id: number | undefined; // TODO finish
  meta?: ApiFileMetaInformation;
  status: FileStatus;
  allowDownload: boolean;
};

export const ApiFile = ({ id, meta, status, allowDownload }: ApiFileProps) => {
  const { t } = useTranslation();

  let content;

  if (status === FileStatus.UPLOADED) {
    content = <Box><chakra.span pr="1">{t("apifile.fileUploadedWithFilename", "File uploaded and saved with the file name:")}</chakra.span><b>{meta?.originalFileName}</b>
      {allowDownload && <a href={meta?.originalFileUrl}>{t("apifile.linkDownload", "download")}</a>}
    </Box>;
  }

  return <Flex h="80px" alignItems="center" p="4" pr="60px" border="1px solid " borderColor="gray.400" borderRadius="md">{content}</Flex>;
};
