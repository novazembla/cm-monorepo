import { useState } from "react";
import {
  Divider,
  Box,
  IconButton,
  Input,
  Heading,
  Table,
  Td,
  Th,
  Thead,
  HStack,
  VisuallyHidden,
  Flex,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { DateSingleInput } from "@datepicker-react/styled";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

import { locationsSearchGQL } from "@culturemap/core";

import {
  FieldMultiLangInput,
  FieldMultiLangTextEditor,
  FieldSelect,
  FieldPublishStatusSelect,
  FieldRow,
  FieldSingleImage,
  TwoColFieldRow,
  FieldRadioOrCheckboxGroup,
  TimeField,
  FieldSingleSelectAutocomplete,
} from "~/components/forms";

import { HiOutlineTrash } from "react-icons/hi";
import { MdPlusOne } from "react-icons/md";

import { MultiLangValue } from "~/components/ui";
import { useAuthentication } from "~/hooks";
import { getMultilangValue } from "~/utils";

const isValidDate = (d: any) => {
  if (Object.prototype.toString.call(d) === "[object Date]") {
    return !isNaN(d.getTime());
  }
  return false;
};

const parseDateToTime = (t: any, fallback: string) => {
  try {
    return isValidDate(t)
      ? t.toLocaleTimeString(i18n.language, {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })
      : fallback;
  } catch (err) {}

  return fallback;
};

export const ModuleForm = ({
  data,
  action,
  validationSchema,
  setActiveUploadCounter,
}: {
  data?: any;
  validationSchema: any;
  action: "create" | "update";
  setActiveUploadCounter?: Function;
}) => {
  const [appUser] = useAuthentication();
  const [isOpenFieldArray, setIsOpenFieldArray] = useState<
    Record<string, boolean>
  >({});

  const { t } = useTranslation();

  let updateActions;

  const {
    // formState: { errors },
    register,
    control,
    getValues,
  } = useFormContext();

  // TODO: any need to make use of append? const { fields, remove, append, insert } = useFieldArray({
  const { fields, remove, insert } = useFieldArray({
    control,
    name: "dates",
    keyName: "fieldId",
  });

  if (action === "update") {
    if (data?.adminUsers) {
      updateActions = (
        <>
          <Divider mt="10" />
          <TwoColFieldRow>
            <FieldRow>
              <FieldPublishStatusSelect
                ownerId={data.eventRead.ownerId}
                module="event"
                status={data?.eventRead?.status}
              />
            </FieldRow>
            <FieldRow>
              <FieldSelect
                name="ownerId"
                id="ownerId"
                label={t("module.forms.field.label.author", "Author")}
                isRequired={true}
                options={data.adminUsers.map((authUser: any) => ({
                  value: authUser.id,
                  label: `${authUser.firstName} ${authUser.lastName}`,
                }))}
                isDisabled={
                  !(
                    appUser &&
                    (appUser.has("editor") ||
                      data.eventRead.ownerId === appUser.id)
                  )
                }
                settings={{
                  defaultValue: data.eventRead.ownerId,
                  placeholder: t(
                    "module.forms.field.placeholder.author",
                    "Please choose the author"
                  ),
                }}
              />
            </FieldRow>
          </TwoColFieldRow>
          <Divider mt="10" />
          <FieldSingleImage
            id="heroImage"
            name="heroImage"
            label={t("forms.heroImage.label", "Featured image")}
            currentImage={data?.eventRead?.heroImage}
            settings={{
              imageRequired: false,
              altRequired: false,
              creditsRequired: false,
            }}
            setActiveUploadCounter={setActiveUploadCounter}
            connectWith={{
              heroImageEvents: {
                connect: {
                  id: data?.eventRead?.id,
                },
              },
            }}
          />
        </>
      );
    } else {
      updateActions = (
        <input value={data?.eventRead?.ownerId} {...register("ownerId")} />
      );
    }
  }

  // TODO: allow taxonomies to be required (And validated accordingly)
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
      <FieldMultiLangInput
        name="title"
        id="title"
        type="text"
        label={t("module.events.forms.event.field.label.title", "Title")}
        isRequired={true}
        settings={{
          defaultValues: data?.eventRead?.title,
          placeholder: t(
            "module.events.forms.event.field.placeholder.title",
            "Event title"
          ),
        }}
      />
      <FieldMultiLangInput
        name="slug"
        id="slug"
        type="text"
        label={t("module.events.forms.event.field.label.slug", "Slug")}
        isRequired={true}
        settings={{
          defaultValues: data?.eventRead?.slug,
          placeholder: t(
            "module.events.forms.event.field.placeholder.slug",
            "Slug / URL part"
          ),
        }}
      />
      {updateActions}

      {data && data?.moduleTaxonomies && (
        <>
          <Divider mt="10" />
          {data?.moduleTaxonomies.map((taxonomy: any) => (
            <FieldRow key={`tax_${taxonomy.id}`}>
              <FieldRadioOrCheckboxGroup
                id={`tax_${taxonomy.id}`}
                name={`tax_${taxonomy.id}`}
                isRequired={false}
                label={<MultiLangValue json={taxonomy.name} />}
                type="checkbox"
                options={taxonomy.terms.map((term: any) => ({
                  label: term.name,
                  key: term.id,
                }))}
              />
            </FieldRow>
          ))}
        </>
      )}

      <Divider mt="10" />
      <FieldRow>
        <FieldSingleSelectAutocomplete
          name="locationId"
          id="locationId"
          label={t("forms.field.label.location", "Location")}
          isRequired={true}
          item={
            data?.eventRead?.locations && data?.eventRead?.locations?.length > 0
              ? {
                  label: getMultilangValue(data?.eventRead?.locations[0].title),
                  id: data?.eventRead?.locations[0].id,
                }
              : undefined
          }
          searchQueryGQL={locationsSearchGQL}
          settings={{
            placeholder: t(
              "forms.field.placeholder.locationsearch",
              "Please enter the location's title"
            ),
          }}
        />
      </FieldRow>

      <Divider mt="10" />

      <FieldMultiLangTextEditor
        name="description"
        id="description"
        type="basic"
        label={t(
          "module.events.forms.event.field.label.description",
          "Description"
        )}
        isRequired={false}
        settings={{
          defaultRequired: true,
          defaultValues: data?.eventRead?.description,
          maxLength: 1000,
          placeholder: t(
            "module.events.forms.event.field.placeholder.description",
            "Event description"
          ),
        }}
      />

      <FieldMultiLangTextEditor
        name="descriptionLocation"
        id="descriptionLocation"
        type="basic"
        label={t(
          "module.events.forms.event.field.label.descriptionLocation",
          "Event location Information"
        )}
        isRequired={false}
        settings={{
          defaultValues: data?.eventRead?.descriptionLocation,
          maxLength: 500,
          placeholder: t(
            "module.events.forms.event.field.placeholder.descriptionLocation",
            "Event loaction information (room, access, address, directions, ...)"
          ),
        }}
      />
      <Divider mt="10" />

      <Box>
        <Heading as="h2" mb="3">
          {t("module.events.forms.eventdates.heading", "Event date(s)")}
        </Heading>
        <Table position="relative" mb="400px" w="100%">
          <Thead>
            <tr>
              <Th pl="0" borderColor="gray.300" fontSize="md" color="gray.800">
                {t(
                  "module.events.forms.eventdates.table.column.date.label",
                  "Date"
                )}
              </Th>
              <Th pl="0" borderColor="gray.300" fontSize="md" color="gray.800">
                {t(
                  "module.events.forms.event.table.column.begin.label",
                  "Begin"
                )}
              </Th>
              <Th pl="0" borderColor="gray.300" fontSize="md" color="gray.800">
                {t("module.events.forms.event.table.column.end.label", "End")}
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
                {t("table.label.actions", "Actions")}
              </Th>
            </tr>
          </Thead>
          <tbody>
            {fields.map((f, index) => {
              const field = f as any;
              return (
                <tr key={f.fieldId}>
                  <Td pl="0" borderColor="gray.300">
                    <Controller
                      control={control}
                      name={`dates[${index}].date`}
                      defaultValue={field.date}
                      render={({
                        field: { onChange, onBlur, value, name, ref },
                      }) => {
                        const date = isValidDate(value) ? value : field.date;
                        return (
                          <DateSingleInput
                            onDateChange={(date) => {
                              onChange(date.date);
                              setIsOpenFieldArray({
                                ...isOpenFieldArray,
                                [`dates[${index}].date`]: false,
                              });
                            }}
                            onFocusChange={(focusedInput) => {
                              setIsOpenFieldArray({
                                ...isOpenFieldArray,
                                [`dates[${index}].date`]: focusedInput,
                              });
                            }}
                            displayFormat="dd/MM/yy"
                            showCalendarIcon={true}
                            showClose={false}
                            showDatepicker={
                              `dates[${index}].date` in isOpenFieldArray &&
                              isOpenFieldArray[`dates[${index}].date`]
                            }
                            showResetDate={false}
                            phrases={{
                              dateAriaLabel: t(
                                "module.events.forms.event.field.date.placeholder",
                                "Date"
                              ),
                              datePlaceholder: t(
                                "module.events.forms.event.field.date.placeholder",
                                "Date"
                              ),
                              datepickerStartDatePlaceholder: "",
                              datepickerStartDateLabel: "",
                              datepickerEndDateLabel: "",
                              datepickerEndDatePlaceholder: "",
                              resetDates: "",
                              close: t("form.datepicker.close", "close"),
                            }}
                            date={date}
                            weekdayLabelFormat={(date: Date) =>
                              date.toLocaleString(i18n.language, {
                                weekday: "short",
                              })
                            }
                            monthLabelFormat={(date: Date) =>
                              date.toLocaleString(i18n.language, {
                                month: "long",
                              })
                            }
                          />
                        );
                      }}
                    />
                  </Td>
                  <Td pl="0" borderColor="gray.300">
                    {/* eslint-disable-next-line jsx-a11y/label-has-for */}
                    <label htmlFor={`dates${index}begin`}>
                      <VisuallyHidden>
                        {t(
                          "module.events.forms.event.field.begin.label",
                          "Begin"
                        )}
                      </VisuallyHidden>
                      <Controller
                        control={control}
                        name={`dates[${index}].begin`}
                        defaultValue={
                          isValidDate(field.begin)
                            ? field.begin
                            : new Date(new Date().setHours(10, 0, 0))
                        }
                        render={({
                          field: { onChange, onBlur, value, name, ref },
                        }) => {
                          const time = parseDateToTime(value, "10:00");
                          return (
                            <TimeField
                              onChange={(event, time) => {
                                const date = getValues(`dates[${index}].date`);
                                const hm = time.split(":");
                                if (isValidDate(date)) {
                                  onChange(
                                    new Date(
                                      date.setHours(
                                        parseInt(hm[0]),
                                        parseInt(hm[1]),
                                        0
                                      )
                                    )
                                  );
                                } else {
                                  onChange(
                                    new Date(
                                      new Date().setHours(
                                        parseInt(hm[0]),
                                        parseInt(hm[1]),
                                        0
                                      )
                                    )
                                  );
                                }
                              }}
                              input={<Input id={`dates${index}end`} />}
                              value={time}
                            />
                          );
                        }}
                      />
                    </label>
                  </Td>
                  <Td pl="0" borderColor="gray.300">
                    {/* eslint-disable-next-line jsx-a11y/label-has-for */}
                    <label htmlFor={`dates${index}end`}>
                      <VisuallyHidden>
                        {t("module.events.forms.event.field.end.label", "End")}
                      </VisuallyHidden>
                      <Controller
                        control={control}
                        name={`dates[${index}].end`}
                        defaultValue={
                          isValidDate(field.end)
                            ? field.end
                            : new Date(new Date().setHours(18, 0, 0))
                        }
                        render={({
                          field: { onChange, onBlur, value, name, ref },
                        }) => {
                          const time = parseDateToTime(value, "18:00");
                          return (
                            <TimeField
                              onChange={(event, time) => {
                                const date = getValues(`dates[${index}].date`);
                                const hm = time.split(":");
                                if (isValidDate(date)) {
                                  onChange(
                                    new Date(
                                      date.setHours(
                                        parseInt(hm[0]),
                                        parseInt(hm[1]),
                                        0
                                      )
                                    )
                                  );
                                } else {
                                  onChange(
                                    new Date(
                                      new Date().setHours(
                                        parseInt(hm[0]),
                                        parseInt(hm[1]),
                                        0
                                      )
                                    )
                                  );
                                }
                              }}
                              input={<Input id={`dates${index}end`} />}
                              value={time}
                            />
                          );
                        }}
                      />
                    </label>
                  </Td>
                  <Td
                    px="0"
                    borderColor="gray.300"
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
                    <Flex justifyContent="center">
                      <HStack mx="auto">
                        <IconButton
                          aria-label={t(
                            "module.events.forms.event.field.dates.removedate",
                            "Remove"
                          )}
                          fontSize="xl"
                          colorScheme="red"
                          variant="outline"
                          icon={<HiOutlineTrash />}
                          onClick={() => remove(index)}
                          isDisabled={fields.length === 1}
                        />

                        <IconButton
                          aria-label={t(
                            "module.events.forms.event.field.dates.clone",
                            "Clone current line"
                          )}
                          variant="outline"
                          icon={<MdPlusOne />}
                          fontSize="xl"
                          onClick={() => {
                            const values = getValues(`dates[${index}]`);
                            const oneDayInMs = 60 * 60 * 24 * 1000;

                            insert(index + 1, {
                              date: isValidDate(values.date)
                                ? new Date(values.date.getTime() + oneDayInMs)
                                : new Date(),
                              begin: isValidDate(values.begin)
                                ? new Date(values.begin.getTime() + oneDayInMs)
                                : new Date(new Date().setHours(10, 0, 0)),
                              end: isValidDate(values.end)
                                ? new Date(values.end.getTime() + oneDayInMs)
                                : new Date(new Date().setHours(18, 0, 0)),
                            });
                          }}
                        />
                      </HStack>
                    </Flex>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Box>
    </>
  );
};
export default ModuleForm;

// TOOD: the event list should be empty on start/ be required, and have an add first date button or something like that.
