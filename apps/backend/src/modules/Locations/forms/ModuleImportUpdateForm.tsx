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
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  chakra,
} from "@chakra-ui/react";

import {
  importFileDeleteMutationGQL,
  ImportStatus,
  importHeaders,
} from "@culturemap/core";

import { useTranslation } from "react-i18next";
import {
  FieldInput,
  FieldRow,
  FieldFileUploader,
  FieldSelect,
} from "~/components/forms";
import { MdContentCopy } from "react-icons/md";
import { useFormContext } from "react-hook-form";
import { getMultilangValue } from "~/utils";

export const ModuleImportUpdateForm = ({
  data,
  errors,
  action,
  isSubmitting,
  validationSchema,
  setActiveUploadCounter,
  onUpload,
}: {
  data?: any;
  errors?: any;
  isSubmitting: boolean;
  validationSchema: any;
  action: "create" | "update";
  onUpload: any;
  setActiveUploadCounter?: Function;
}) => {
  const [showMappingTable, setShowMappingTable] = useState(true);
  const [justDeleted, setJustDeleted] = useState(false);
  const [file, setFile] = useState(null);
  const [parseResult, setParseResult] = useState<any>();

  const { t } = useTranslation();

  const { importRead } = data;

  const { setValue, getValues } = useFormContext();

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
    errorValue = parseResult.errors
      .map((e: string, index: number) => `${index + 1}. ${e}`)
      .join("\n");
  } else if (importRead.errors.length > 0) {
    errorList = importRead.errors.map((err: any, index: number) => (
      <ListItem key={`error-${index}`}>{err}</ListItem>
    ));
    errorValue = importRead.errors
      .map((e: string, index: number) => `${index + 1}. ${e}`)
      .join("\n");
  }
  const clipboardErrors = useClipboard(errorValue);

  let warningList = undefined;
  let warningValue = "";
  if (parseResult && parseResult?.warnings?.length > 0) {
    warningList = parseResult.warnings.map((err: any, index: number) => (
      <ListItem key={`warning-${index}`}>{err}</ListItem>
    ));
    warningValue = parseResult.warnings
      .map((w: string, index: number) => `${index + 1}. ${w}`)
      .join("\n");
  } else if (importRead.warnings.length > 0) {
    warningList = importRead.warnings.map((err: any, index: number) => (
      <ListItem key={`warning-${index}`}>{err}</ListItem>
    ));
    warningValue = importRead.warnings
      .map((w: string, index: number) => `${index + 1}. ${w}`)
      .join("\n");
  }

  const clipboardWarnings = useClipboard(warningValue);

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

  const options = Object.keys(importHeaders).reduce(
    (agg: any, key: string) => {
      agg.push({
        value: key,
        label: getMultilangValue(importHeaders[key]),
      });
      return agg;
    },
    [
      {
        value: "",
        label: t(
          "module.locations.forms.import.select",
          "Select target column"
        ),
      },
    ] as any
  );

  const mapping = parseResult?.mapping ?? importRead?.mapping ?? undefined;
  const isProcessing = [ImportStatus.PROCESS, ImportStatus.PROCESSING].includes(
    data?.importRead?.status
  )
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
          isDisabled={[
            ImportStatus.ERROR,
            ImportStatus.PROCESS,
            ImportStatus.PROCESSING,
            ImportStatus.PROCESSED,
          ].includes(importRead.status)}
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
            setJustDeleted(false);

            if (typeof onUpload === "function")
              onUpload.call(null, data, formFunctions);

            setShowMappingTable(true);
          }}
          canDelete={[ImportStatus.ASSIGN, ImportStatus.CREATED].includes(
            importRead.status
          )}
          onDelete={() => {
            setParseResult(undefined);
            setValue("status", ImportStatus.CREATED);

            const mapping = getValues("mapping");
            if (Array.isArray(mapping)) {
              mapping.forEach((map, index) => {
                setValue(`mapping-col-${index}`, undefined);
              });
            }
            setValue("mapping", []);
            setValue("file", undefined);
            setJustDeleted(true);
            setShowMappingTable(false);
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
        showMappingTable &&
        mapping &&
        !justDeleted &&
        Array.isArray(mapping) &&
        mapping.length > 0 && (
          <FieldRow>
            <Box w="100%">
              <Box w="100%">
                <b>
                  {t(
                    "module.locations.forms.import.mapping.title",
                    "CSV column(s) to database columns mapping"
                  )}
                </b>
                <Table position="relative" mb="6" w="100%" mt="2">
                  <Thead>
                    <Tr>
                      <Th
                        pl="0"
                        borderColor="gray.300"
                        fontSize="md"
                        color="gray.800"
                      >
                        {t(
                          "module.locations.forms.import.mapping.columCSV",
                          "Header in CSV"
                        )}
                      </Th>
                      <Th
                        pl="0"
                        borderColor="gray.300"
                        fontSize="md"
                        color="gray.800"
                      >
                        {t(
                          "module.locations.forms.import.mapping.firstRow",
                          "Example (1st row in CSV)"
                        )}
                      </Th>

                      <Th
                        textAlign="center"
                        px="0"
                        borderColor="gray.300"
                        fontSize="md"
                        color="gray.800"
                        _last={{
                          position: "sticky",
                          right: 0,
                          p: 0,
                          "> div": {
                            p: 4,
                            h: "100%",
                            bg: "rgba(255,255,255,0.9)",
                          },
                        }}
                      >
                        {t(
                          "module.locations.forms.import.mapping.columnInDb",
                          "Column in DB"
                        )}
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {mapping.map((col: any, index: number) => {
                      const isUndefined =
                        typeof getValues(`mapping-col-${index}`) ===
                        "undefined";

                      return (
                        <Tr key={`col-${index}`}>
                          <Td pl="0" w="10%" whiteSpace="nowrap" verticalAlign="top">{col.header}</Td>
                          <Td pl="0" verticalAlign="top" ><chakra.pre fontSize="xs" whiteSpace="pre-wrap">{col.row}</chakra.pre></Td>
                          <Td px="0" w="33.33%" minW="250px">
                            {/* the awful isSubmitting hack forces a full rebuild of the select form field, it would alway jump back to the intitial defaultValue on form submit */}
                            {!isUndefined && data?.importRead && !isSubmitting && (
                              <FieldSelect
                                isRequired={true}
                                name={`mapping-col-${index}`}
                                id={`mapping-col-${index}`}
                                label={`CSV ${index + 1}`}
                                options={options}
                                isDisabled={
                                  ![
                                    ImportStatus.CREATED,
                                    ImportStatus.ASSIGN,
                                  ].includes(data?.importRead?.status)
                                }
                                settings={{
                                  defaultValue: getValues(
                                    `mapping-col-${index}`
                                  ),
                                  hideLabel: true,
                                }}
                              />
                            )}
                            {(!isUndefined && (!data || isSubmitting)) && (
                              <FieldSelect
                                isRequired={true}
                                name={`mapping-col-${index}`}
                                id={`mapping-col-${index}`}
                                label={`CSV ${index + 1}`}
                                options={options}
                                isDisabled={
                                  ![
                                    ImportStatus.CREATED,
                                    ImportStatus.ASSIGN,
                                  ].includes(data?.importRead?.status)
                                }
                                settings={{
                                  defaultValue: getValues(
                                    `mapping-col-${index}`
                                  ),
                                  hideLabel: true,
                                }}
                              />
                            )}
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </FieldRow>
        )}

      {errorList && !justDeleted && !isProcessing && (
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
              <Box maxH="600px" w="100%" overflowY="auto" color="red.600">
                <OrderedList>{errorList}</OrderedList>
              </Box>
            </Box>
          </Box>
        </FieldRow>
      )}

      {warningList && !justDeleted && !isProcessing && (
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

            <Box w="100%">
              <Box maxH="600px" w="100%" overflowY="auto" color="orange.600">
                <OrderedList>{warningList}</OrderedList>
              </Box>
            </Box>
          </Box>
        </FieldRow>
      )}

      {logList && !justDeleted && !isProcessing && (
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
              <Box maxH="600px" w="100%" overflowY="auto">
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
