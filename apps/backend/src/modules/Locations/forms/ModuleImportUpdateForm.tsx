import { useState, useEffect } from "react";
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

import { importFileDeleteMutationGQL, ImportStatus } from "@culturemap/core";

import { useTranslation } from "react-i18next";
import { FieldInput, FieldRow, FieldFileUploader } from "~/components/forms";
import { MdContentCopy } from "react-icons/md";
import { useFormContext } from "react-hook-form";

export const ModuleImportUpdateForm = ({
  data,
  errors,
  action,
  validationSchema,
  setActiveUploadCounter,
  onUpload,
}: {
  data?: any;
  errors?: any;
  validationSchema: any;
  action: "create" | "update";
  onUpload: any;
  setActiveUploadCounter?: Function;
}) => {
  const [file, setFile] = useState(null);
  const [parseResult, setParseResult] = useState<any>();

  const { t } = useTranslation();

  const { importRead } = data;

  const { getValues, setValue } = useFormContext();

  useEffect(() => {
    if (importRead && importRead?.file) {
      setFile(importRead?.file);
    }

    if (importRead && importRead?.mapping) {
      setFile(importRead?.file);
    }
  }, [importRead, setFile]);

  let errorList = undefined;
  let errorValue = "";
  if (parseResult && parseResult?.errors?.length > 0) {
    errorList = parseResult.errors.map((err: any, index: number) => (
      <ListItem key={`error-${index}`}>{err}</ListItem>
    ));
    errorValue = parseResult.errors.join("\n");
  } else if (importRead.errors.length > 0) {
    errorList = importRead.errors.map((err: any, index: number) => (
      <ListItem key={`error-${index}`}>{err}</ListItem>
    ));
    errorValue = importRead.errors.join("\n");
  }

  const clipboardErrors = useClipboard(errorValue);

  let logList = undefined;
  let logValue = "";
  if (parseResult && parseResult?.log?.length > 0) {
    logList = parseResult.log.map((err: any, index: number) => (
      <ListItem key={`log-${index}`}>{err}</ListItem>
    ));
    logValue = parseResult.log.join("\n");
  } else if (importRead.log.length > 0) {
    logList = importRead.log.map((err: any, index: number) => (
      <ListItem key={`log-${index}`}>{err}</ListItem>
    ));
    logValue = importRead.log.join("\n");
  }
  const clipboardLog = useClipboard(logValue);

  const mapping = parseResult?.mapping ?? importRead?.mapping ?? undefined;

  console.log(importRead, file, parseResult, parseResult?.errors, mapping);
  return (
    <>
      {action === "create" && (
        <>
          <Alert borderRadius="lg">
            <AlertIcon />
            {t(
              "form.info.pleasesafedraft",
              "Please save a draft to unlock further functionality"
            )}
          </Alert>
        </>
      )}
      <FieldRow>
        <FieldInput
          name="title"
          id="title"
          type="text"
          label={t("module.locations.forms.import.field.label.title", "Title")}
          isRequired={true}
          settings={{
            placeholder: t(
              "module.locations.forms.location.field.placeholder.title",
              "Import title"
            ),
          }}
        />
      </FieldRow>
      <FieldRow>
        <FieldFileUploader
          name="file"
          route="import"
          id="file"
          deleteButtonGQL={importFileDeleteMutationGQL}
          setActiveUploadCounter={setActiveUploadCounter}
          label={t("module.locations.forms.import.field.label.csv", "CSV File")}
          isRequired={true}
          onUpload={(data, formFunctions) => {
            setFile(data?.file);
            setParseResult(data?.initialParseResult);

            if (typeof onUpload === "function")
              onUpload.call(null, data, formFunctions);
          }}
          canDelete={[
            ImportStatus.UPLOADED,
            ImportStatus.ASSIGN,
            ImportStatus.CREATED,
          ].includes(importRead.status)}
          onDelete={() => {
            setParseResult(undefined);
            setValue("status", ImportStatus.CREATED);
          }}
          connectWith={{
            imports: {
              connect: {
                id: importRead?.id,
              },
            },
          }}
          settings={{
            file,
            accept: "text/csv",
            placeholder: t(
              "module.locations.forms.location.field.placeholder.csvfile",
              "Upload CSV"
            ),
          }}
        />
      </FieldRow>

      {errorValue === "" &&
        mapping &&
        (importRead.status === ImportStatus.ASSIGN || parseResult?.mapping) && (
          <Box>{JSON.stringify(mapping)}</Box>
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
              <Box h="300px" w="100%" overflowY="auto" color="red.600">
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
              <Box h="300px" w="100%" overflowY="auto">
                <UnorderedList>{logList}</UnorderedList>
              </Box>
            </Box>
          </Box>
        </FieldRow>
      )}
    </>
  );
};
export default ModuleImportUpdateForm;
