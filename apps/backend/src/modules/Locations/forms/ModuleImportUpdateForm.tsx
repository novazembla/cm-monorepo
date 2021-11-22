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
  dataImportFileDeleteMutationGQL,
  DataImportStatus,
  dataImportHeadersLocation,
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
import { dataImportExportType } from "../moduleConfig";

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

  const { dataImportRead } = data;

  const { setValue, getValues } = useFormContext();

  useEffect(() => {
    if (dataImportRead && dataImportRead?.file) {
      setFile(dataImportRead?.file);
    }

    if (dataImportRead && dataImportRead?.mapping) {
      setFile(dataImportRead?.file);
    }
  }, [dataImportRead, setFile]);

  let errorList = undefined;
  let errorValue = "";
  if (parseResult && parseResult?.errors?.length > 0) {
    errorList = parseResult.errors.map((err: any, index: number) => (
      <ListItem key={`error-${index}`}>{err}</ListItem>
    ));
    errorValue = parseResult.errors
      .map((e: string, index: number) => `${index + 1}. ${e}`)
      .join("\n");
  } else if (dataImportRead.errors.length > 0) {
    errorList = dataImportRead.errors.map((err: any, index: number) => (
      <ListItem key={`error-${index}`}>{err}</ListItem>
    ));
    errorValue = dataImportRead.errors
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
  } else if (dataImportRead.warnings.length > 0) {
    warningList = dataImportRead.warnings.map((err: any, index: number) => (
      <ListItem key={`warning-${index}`}>{err}</ListItem>
    ));
    warningValue = dataImportRead.warnings
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
  } else if (dataImportRead.log.length > 0) {
    logList = dataImportRead.log.map((err: any, index: number) => (
      <ListItem key={`log-${index}`}>{err}</ListItem>
    ));
    logValue = dataImportRead.log.join("\n");
  }
  const clipboardLog = useClipboard(logValue);

  const options = Object.keys(dataImportHeadersLocation).reduce(
    (agg: any, key: string) => {
      agg.push({
        value: key,
        label: getMultilangValue(dataImportHeadersLocation[key]),
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

  const mapping = parseResult?.mapping ?? dataImportRead?.mapping ?? undefined;
  const isProcessing = [
    DataImportStatus.PROCESS,
    DataImportStatus.PROCESSING,
  ].includes(data?.dataImportRead?.status);
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
            DataImportStatus.ERROR,
            DataImportStatus.PROCESS,
            DataImportStatus.PROCESSING,
            DataImportStatus.PROCESSED,
          ].includes(dataImportRead.status)}
          settings={{
            placeholder: t(
              "module.imports.forms.import.field.placeholder.title",
              "Import title"
            ),
          }}
        />
      </FieldRow>
      <FieldRow>
        {[
          DataImportStatus.ERROR,
          DataImportStatus.PROCESS,
          DataImportStatus.PROCESSING,
          DataImportStatus.PROCESSED,
        ].includes(dataImportRead.status) && !!!dataImportRead?.file ? (
          <Box>
            {t(
              "module.locations.forms.import.nofile",
              "This is the log of an automated import without an uploaded file"
            )}
          </Box>
        ) : (
          <FieldFileUploader
            name="file"
            route="import"
            id="file"
            deleteButtonGQL={dataImportFileDeleteMutationGQL}
            setActiveUploadCounter={setActiveUploadCounter}
            additionalDeleteData={{
              type: dataImportExportType,
            }}
            label={t(
              "module.locations.forms.import.field.label.csv",
              "CSV File"
            )}
            isRequired={true}
            onUpload={(data, formFunctions) => {
              setFile(data?.file);
              setParseResult(data?.initialParseResult);
              setJustDeleted(false);

              if (typeof onUpload === "function")
                onUpload.call(null, data, formFunctions);

              setShowMappingTable(true);
            }}
            canDelete={[
              DataImportStatus.ASSIGN,
              DataImportStatus.CREATED,
            ].includes(dataImportRead.status)}
            onDelete={() => {
              setParseResult(undefined);
              setValue("status", DataImportStatus.CREATED);

              const mapping = getValues("mapping");
              if (Array.isArray(mapping)) {
                mapping.forEach((map, index) => {
                  setValue(`mapping-col-${index}`, undefined);
                });
              }
              setValue("mapping", []);
              setValue("log", []);
              setValue("warnings", []);
              setValue("errors", []);
              setValue("file", undefined);
              setJustDeleted(true);
              setShowMappingTable(false);
            }}
            connectWith={{
              dataImports: {
                connect: {
                  id: dataImportRead?.id,
                },
              },
            }}
            settings={{
              file,
              accept: ".csv, text/csv, text/plain",
              placeholder: t(
                "module.locations.forms.location.field.placeholder.csvfile",
                "Upload CSV"
              ),
            }}
          />
        )}
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
                          <Td
                            pl="0"
                            w="10%"
                            whiteSpace="nowrap"
                            verticalAlign="top"
                          >
                            {col.header}
                          </Td>
                          <Td pl="0" verticalAlign="top">
                            <chakra.pre fontSize="xs" whiteSpace="pre-wrap">
                              {col.row}
                            </chakra.pre>
                          </Td>
                          <Td px="0" w="33.33%" minW="250px">
                            {/* the awful isSubmitting hack forces a full rebuild of the select form field, it would alway jump back to the intitial defaultValue on form submit */}
                            {!isUndefined &&
                              data?.dataImportRead &&
                              !isSubmitting && (
                                <FieldSelect
                                  isRequired={true}
                                  name={`mapping-col-${index}`}
                                  id={`mapping-col-${index}`}
                                  label={`CSV ${index + 1}`}
                                  options={options}
                                  isDisabled={
                                    ![
                                      DataImportStatus.CREATED,
                                      DataImportStatus.ASSIGN,
                                    ].includes(data?.dataImportRead?.status)
                                  }
                                  settings={{
                                    defaultValue: getValues(
                                      `mapping-col-${index}`
                                    ),
                                    hideLabel: true,
                                  }}
                                />
                              )}
                            {!isUndefined && (!data || isSubmitting) && (
                              <FieldSelect
                                isRequired={true}
                                name={`mapping-col-${index}`}
                                id={`mapping-col-${index}`}
                                label={`CSV ${index + 1}`}
                                options={options}
                                isDisabled={
                                  ![
                                    DataImportStatus.CREATED,
                                    DataImportStatus.ASSIGN,
                                  ].includes(data?.dataImportRead?.status)
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
              <Box
                maxH="1000px"
                w="100%"
                overflowY="auto"
                color="orange.600"
                border="1px solid"
                borderColor="gray.400"
                borderRadius="md"
                p="3"
                px="6"
              >
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
    </>
  );
};
export default ModuleImportUpdateForm;
