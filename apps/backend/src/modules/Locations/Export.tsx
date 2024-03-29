import { useTranslation } from "react-i18next";
import { MdContentCopy } from "react-icons/md";
import { useRouter } from "~/hooks";
import {
  Alert,
  AlertIcon,
  Box,
  useClipboard,
  ListItem,
  OrderedList,
  UnorderedList,
  IconButton,
} from "@chakra-ui/react";
import { dataExportReadQueryGQL, DataExportStatus } from "@culturemap/core";

import { useQuery } from "@apollo/client";
import { FieldRow } from "~/components/forms";
import {
  ModuleSubNav,
  ModulePage,
  ButtonListElement,
} from "~/components/modules";

import { ApiFile } from "~/components/ui";

import { moduleRootPath, dataImportExportType } from "./moduleConfig";

const Export = () => {
  const router = useRouter();

  const { t } = useTranslation();

  const { data, loading, error } = useQuery(dataExportReadQueryGQL, {
    variables: {
      id: parseInt(router.query.id, 10),
      type: dataImportExportType,
    },
  });

  const breadcrumb = [
    {
      path: moduleRootPath,
      title: t("module.locations.title", "Locations"),
    },
    {
      path: `${moduleRootPath}/exports`,
      title: t("module.locations.menuitem.dataExports", "Exports"),
    },
    {
      title: t("module.locations.breadcrumb.exportdetail", "Export detail"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: `${moduleRootPath}/exports`,
      label: t("module.button.back", "Go back"),
      userCan: "locationRead",
    },
  ];

  let errorList = undefined;
  let errorValue = "";
  if (data?.dataExportRead.errors.length > 0) {
    errorList = data?.dataExportRead.errors.map(
      (err: any, index: number) => (
        <ListItem key={`error-${index}`}>{err}</ListItem>
      )
    );
    errorValue = data?.dataExportRead.errors
      .map((e: string, index: number) => `${index + 1}. ${e}`)
      .join("\n");
  }
  const clipboardErrors = useClipboard(errorValue);

  let logList = undefined;
  let logValue = "";
  if (data?.dataExportRead.log.length > 0) {
    logList = data?.dataExportRead.log.map((err: any, index: number) => (
      <ListItem key={`log-${index}`}>{err}</ListItem>
    ));
    logValue = data?.dataExportRead.log.join("\n");
  }
  const clipboardLog = useClipboard(logValue);

  return (
    <>
      <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
      <ModulePage isLoading={loading} isError={!!error}>
        {[DataExportStatus.PROCESS, DataExportStatus.PROCESSING].includes(
          data?.dataExportRead?.status
        ) && (
          <Alert borderRadius="lg">
            <AlertIcon />
            {t(
              "module.locations.export.exportIsProcessing",
              "Your export is being processed on the server."
            )}
          </Alert>
        )}
        {[DataExportStatus.PROCESSED].includes(
          data?.dataExportRead?.status
        ) && (
          <Alert borderRadius="lg" colorScheme="green">
            <AlertIcon />
            {t(
              "module.locations.export.exportProcessed",
              "Your export has been processed."
            )}
          </Alert>
        )}
        <FieldRow>
          <b>
            {t("module.locations.export.field.label.exportName", "Export Name")}
          </b>
          : {data?.dataExportRead?.title}
        </FieldRow>
        {data?.dataExportRead?.file?.id &&
          DataExportStatus.PROCESSED === data?.dataExportRead?.status && (
            <FieldRow>
              <ApiFile
                id={data?.dataExportRead?.file?.id}
                status={data?.dataExportRead?.file?.status}
                meta={data?.dataExportRead?.file?.meta}
                allowDownload={true}
              />
            </FieldRow>
          )}
        {errorList && (
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

              <Box w="100%">
                <Box
                  maxH="1000px"
                  w="100%"
                  overflowY="auto"
                  color="red.600"
                  border="1px solid"
                  borderColor="gray.400"
                  borderRadius="md"
                  p="3"
                  px="6"
                >
                  <OrderedList>{errorList}</OrderedList>
                </Box>
              </Box>
            </Box>
          </FieldRow>
        )}

        {logList && (
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

              <Box w="100%">
                <Box
                  maxH="1000px"
                  w="100%"
                  overflowY="auto"
                  border="1px solid"
                  borderColor="gray.400"
                  borderRadius="md"
                  p="3"
                  px="4"
                >
                  <UnorderedList>{logList}</UnorderedList>
                </Box>
              </Box>
            </Box>
          </FieldRow>
        )}
      </ModulePage>
    </>
  );
};
export default Export;
