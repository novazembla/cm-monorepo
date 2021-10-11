import { useRouter } from "~/hooks";

import { Box, IconButton, UnorderedList, OrderedList, ListItem, useClipboard } from "@chakra-ui/react";

import { useQuery, gql } from "@apollo/client";

import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";


import {
  FieldRow,
} from "~/components/forms";


import { moduleRootPath } from "./moduleConfig";
import { useTranslation } from "react-i18next";
import { MdContentCopy } from "react-icons/md";

export const eventImportLogReadQueryGQL = gql`
  query eventImportLog($id: Int!) {
    eventImportLog(id: $id) {
      id
      log
      warnings
      errors
      createdAt
      updatedAt
    }
  }
`;

const Log = () => {
  const { t } = useTranslation();

  const router = useRouter();

  const { data, loading, error } = useQuery(
    eventImportLogReadQueryGQL,
    {
      variables: {
        id: parseInt(router.query.id, 10),
      },
    }
  );

  let date;
  try {
    if (data?.eventImportLog?.updatedAt)
      date = new Date(data?.eventImportLog?.updatedAt).toLocaleString();
  } catch(err){}

  let errorList = undefined;
  let errorValue = "";
  if (data?.eventImportLog && data?.eventImportLog?.errors?.length > 0) {
    errorList = data?.eventImportLog.errors.map((err: any, index: number) => (
      <ListItem key={`error-${index}`}>{err}</ListItem>
    ));
    errorValue = data?.eventImportLog.errors
      .map((e: string, index: number) => `${index + 1}. ${e}`)
      .join("\n");
  } else if (data?.eventImportLog.errors.length > 0) {
    errorList = data?.eventImportLog.errors.map((err: any, index: number) => (
      <ListItem key={`error-${index}`}>{err}</ListItem>
    ));
    errorValue = data?.eventImportLog.errors
      .map((e: string, index: number) => `${index + 1}. ${e}`)
      .join("\n");
  }
  const clipboardErrors = useClipboard(errorValue);

  let warningList = undefined;
  let warningValue = "";
  if (data?.eventImportLog && data?.eventImportLog?.warnings?.length > 0) {
    warningList = data?.eventImportLog.warnings.map((err: any, index: number) => (
      <ListItem key={`warning-${index}`}>{err}</ListItem>
    ));
    warningValue = data?.eventImportLog.warnings
      .map((w: string, index: number) => `${index + 1}. ${w}`)
      .join("\n");
  } else if (data?.eventImportLog.warnings.length > 0) {
    warningList = data?.eventImportLog.warnings.map((err: any, index: number) => (
      <ListItem key={`warning-${index}`}>{err}</ListItem>
    ));
    warningValue = data?.eventImportLog.warnings
      .map((w: string, index: number) => `${index + 1}. ${w}`)
      .join("\n");
  }

  const clipboardWarnings = useClipboard(warningValue);

  let logList = undefined;
  let logValue = "";
  if (data?.eventImportLog && data?.eventImportLog?.log?.length > 0) {
    logList = data?.eventImportLog.log.map((err: any, index: number) => (
      <ListItem key={`log-${index}`}>{err}</ListItem>
    ));
    logValue = data?.eventImportLog.log.join("\n");
  } else if (data?.eventImportLog.log.length > 0) {
    logList = data?.eventImportLog.log.map((err: any, index: number) => (
      <ListItem key={`log-${index}`}>{err}</ListItem>
    ));
    logValue = data?.eventImportLog.log.join("\n");
  }
  const clipboardLog = useClipboard(logValue);

  const breadcrumb = [
    {
      path: moduleRootPath,
      title: t("module.events.title", "Events"),
    },
    {
      path: `${moduleRootPath}/logs`,
      title: t("module.events.menuitem.importLogs", "Import Logs"),
    },
    {
      title: date ?? t("module.events.menuitem.importLog", "Log"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: `${moduleRootPath}/logs`,
      label: t("module.button.back", "Back"),
      userCan: "eventRead",
    },
  ];

  return (
    <>
      <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
      <ModulePage isLoading={loading} isError={!!error}>
        
        <FieldRow>
          <Box><b>{t("module.events.noImportErrors", "Date of import")}</b><br/>{date}</Box>
        </FieldRow>
        <FieldRow>
          <Box w="100%">
            <Box w="100%">
              <b>{t("module.locations.forms.import.errors", "Errors")}</b>
              <IconButton
                onClick={clipboardErrors.onCopy}
                ml={2}
                mt={-1}
                icon={<MdContentCopy />}
                aria-label="copy"
                border="none"
                color="#000"
                bg="transparent"
                _hover={{
                  bg: "none",
                  opacity: 0.6,
                }}
                _active={{
                  bg: "transparent",
                  color: "green.600",
                }}
                h="30px"
                w="30px"
                fontSize="md"
                justifyContent="flex-start"
              >
                {clipboardErrors.hasCopied
                  ? t("copied", "Copied")
                  : t("copy", "Copy")}
              </IconButton>
            </Box>

            {errorList && (<Box w="100%">
              <Box maxH="1000px" w="100%" overflowY="auto" color="red.600" border="1px solid" borderColor="gray.400" borderRadius="md" p="3" px="6">
                <OrderedList>{errorList}</OrderedList>
              </Box>
            </Box> )}
            {!errorList && <Box>{t("module.events.noImportErrors", "No import errors")}</Box>}
          </Box>
        </FieldRow>
     

      
        <FieldRow>
          <Box w="100%">
            <Box w="100%">
              <b>{t("module.locations.forms.import.warnings", "Warnings")}</b>
              <IconButton
                onClick={clipboardWarnings.onCopy}
                ml={2}
                mt={-1}
                icon={<MdContentCopy />}
                aria-label="copy"
                border="none"
                color="#000"
                bg="transparent"
                _hover={{
                  bg: "none",
                  opacity: 0.6,
                }}
                _active={{
                  bg: "transparent",
                  color: "green.600",
                }}
                h="30px"
                w="30px"
                fontSize="md"
                justifyContent="flex-start"
              >
                {clipboardWarnings.hasCopied
                  ? t("copied", "Copied")
                  : t("copy", "Copy")}
              </IconButton>
            </Box>

            {warningList && (<Box w="100%">
              <Box maxH="1000px" w="100%" overflowY="auto" color="orange.600" border="1px solid" borderColor="gray.400" borderRadius="md" p="3" px="6">
                <OrderedList>{warningList}</OrderedList>
              </Box>
            </Box> )}
            {!warningList && <Box>{t("module.events.noImportWarnings", "No import warnings")}</Box>}
          </Box>
        </FieldRow>
     

      
        <FieldRow>
          <Box w="100%">
            <Box w="100%">
              <b>{t("module.locations.forms.import.log", "Log")}</b>
              <IconButton
                onClick={clipboardLog.onCopy}
                ml={2}
                mt={-1}
                icon={<MdContentCopy />}
                aria-label="copy"
                border="none"
                color="#000"
                bg="transparent"
                _hover={{
                  bg: "none",
                  opacity: 0.6,
                }}
                _active={{
                  bg: "transparent",
                  color: "green.600",
                }}
                h="30px"
                w="30px"
                fontSize="md"
                justifyContent="flex-start"
              >
                Parsed 10 rows
                {clipboardLog.hasCopied
                  ? t("copied", "Copied")
                  : t("copy", "Copy")}
              </IconButton>
            </Box>

            {logList && (<Box w="100%">
              <Box maxH="1000px" w="100%" overflowY="auto" border="1px solid" borderColor="gray.400" borderRadius="md" p="3" px="4">
                <UnorderedList>{logList}</UnorderedList>
              </Box>
            </Box>  )}
          </Box>
        </FieldRow>
    
      </ModulePage>
    </>
  );
};
export default Log;
