import React from "react";
import { FileStatus } from "@culturemap/core";
import type { ApiFileMetaInformation } from "@culturemap/core";
import { Flex, Button, Link, Box,chakra } from "@chakra-ui/react";
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
    content = (
      <Flex w="100%" justifyContent="space-between" alignItems="center">
        <Box>
          <chakra.span pr="1">
          {t(
            "apifile.fileCreatedWithFilename",
            "File created and saved with the file name:"
          )}
        </chakra.span>
        <b>{meta?.originalFileName}</b>
        </Box>
        {allowDownload && (
          <Button as={Link} href={meta?.originalFileUrl} rel="noreferrer" target="_blank" color="#fff !important" textDecoration="none !important">
            {t("apifile.linkDownload", "download")}
          </Button>
        )}
      </Flex>
    );
  }

  return (
    <Flex
      h="80px"
      alignItems="center"
      p="4"
      border="1px solid "
      borderColor="gray.400"
      borderRadius="md"
      w="100%"
    >
      {content}
    </Flex>
  );
};
