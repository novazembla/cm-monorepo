import { useState, useEffect } from "react";
import { useCombobox } from "downshift";
import { useLazyQuery, DocumentNode } from "@apollo/client";
import debounce from "lodash.debounce";
import { useFormContext } from "react-hook-form";

import Highlighter from "react-highlight-words";
import {
  FormLabel,
  FormControl,
  Box,
  IconButton,
  Input,
  chakra,
  useToken,
  VisuallyHidden,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { RiCloseFill } from "@hacknug/react-icons/ri";
import { usePopper } from "@chakra-ui/popper";

import { getMultilangValue } from "~/utils";
import { FieldErrorMessage, flattenErrors } from ".";

export interface FieldSingleSelectAutocompleteItem {
  label: string;
  id: number;
}

export interface FieldSingleSelectAutocompleteSettings {
  placeholder?: string;
  hideLabel?: boolean;
  onItemChange?: (item: any) => void;
}

export const FieldSingleSelectAutocomplete = ({
  settings,
  item,
  id,
  label,
  name,
  isRequired,
  isDisabled,
  resultItemToString = (item: any) =>
    item?.label ?? item?.title ?? item?.name ?? item?.id,
  searchQueryGQL,
  searchQueryDataKey,
}: {
  settings?: FieldSingleSelectAutocompleteSettings;
  item?: FieldSingleSelectAutocompleteItem | undefined;
  id: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  label: string;
  name: string;
  resultItemToString?: (item: any) => string;
  searchQueryGQL: DocumentNode;
  searchQueryDataKey: string;
}) => {
  const { t } = useTranslation();
  const { popperRef, referenceRef } = usePopper({
    matchWidth: true,
  });

  const [wine100] = useToken("colors", ["wine.100"]);

  const [lastSearch, setLastSearch] = useState("");
  const [currentItem, setCurrentItem] = useState<any>();

  const [findItems, { loading, data, error }] = useLazyQuery(searchQueryGQL, {
    fetchPolicy: "no-cache",
  });

  const {
    formState: { errors },
    register,
    watch,
    setValue,
  } = useFormContext();

  const findItemsButChill = debounce((inputValue: string) => {
    if (lastSearch !== inputValue) {
      setLastSearch(inputValue);
      findItems({
        variables: {
          where: {
            fullText: {
              contains: inputValue,
              mode: "insensitive",
            },
          },
        },
      });
    }
  }, 350);

  let searchResult = [];
  if (
    data &&
    searchQueryDataKey in data &&
    searchQueryDataKey in data[searchQueryDataKey] &&
    data[searchQueryDataKey]?.totalCount > 0
  ) {
    searchResult = data[searchQueryDataKey][searchQueryDataKey].map(
      (item: any, index: number) => ({
        id: item.id,
        label: getMultilangValue(item.title),
      })
    );

    searchResult.sort(
      (
        item: FieldSingleSelectAutocompleteItem,
        item2: FieldSingleSelectAutocompleteItem
      ) => {
        if (item.label < item2.label) {
          return -1;
        }
        if (item2.label > item.label) {
          return 1;
        }
        return 0;
      }
    );
  }

  const {
    isOpen,
    inputValue,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    getItemProps,
    highlightedIndex,
    reset,
  } = useCombobox({
    initialSelectedItem: currentItem,
    items: searchResult,
    onStateChange: ({ inputValue, type, selectedItem, isOpen }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.ToggleButtonClick:
          if (
            isOpen &&
            typeof currentItem?.label === "string" &&
            currentItem?.label.length > 2
          ) {
            findItemsButChill(currentItem?.label);
          }

          break;

        case useCombobox.stateChangeTypes.InputChange:
          if (typeof inputValue === "string" && inputValue.length > 2)
            findItemsButChill(inputValue);

          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          if (!selectedItem) return;

          setCurrentItem(selectedItem);
          setValue(name, selectedItem.id, { shouldDirty: true });

          if (typeof settings?.onItemChange === "function")
            settings?.onItemChange.call(null, selectedItem);

          break;

        default:
          break;
      }
    },
    itemToString: resultItemToString,
  });

  useEffect(() => {
    setCurrentItem(item);
    setValue(name, item, {
      shouldDirty: false,
    });

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentValue = watch(name);
  useEffect(() => {
    if (!currentValue && currentItem) {
      setCurrentItem(undefined);
      reset();
    }
  }, [currentValue, reset, currentItem]);

  const flattenedErrors = flattenErrors(errors);

  return (
    <FormControl
      id={id}
      isInvalid={flattenedErrors[name]?.message}
      {...{ isRequired, isDisabled }}
    >
      {settings?.hideLabel ? (
        <VisuallyHidden>
          <FormLabel htmlFor={id} mb="0.5">
            {label}
          </FormLabel>
        </VisuallyHidden>
      ) : (
        <FormLabel htmlFor={id} mb="0.5">
          {label}
        </FormLabel>
      )}

      {currentItem?.id && (
        <Box>
          <Box
            position="relative"
            border="1px solid"
            borderColor="gray.400"
            borderRadius="md"
          >
            <Box
              h="48px"
              pl="4"
              pr="80px"
              overflow="hidden"
              textOverflow="ellipsis"
              w="100%"
              lineHeight="48px"
              color="gray.600"
            >
              {currentItem.label}
            </Box>
            <IconButton
              position="absolute"
              right="1"
              top="1"
              variant="outline"
              icon={<RiCloseFill />}
              onClick={() => {
                setCurrentItem(undefined);
                setValue(name, undefined, { shouldDirty: true });
                if (typeof settings?.onItemChange === "function")
                  settings?.onItemChange.call(null, undefined);
                reset();
              }}
              borderColor="gray.400"
              color="gray.800"
              fontSize="lg"
              h="38px"
              w="30px"
              minW="38px"
              p="0"
              aria-label={t(
                "forms.select.autocomplete.clearselection",
                "Clear selected element"
              )}
            ></IconButton>
          </Box>
        </Box>
      )}

      <Box
        h={currentItem?.id ? 0 : undefined}
        overflow={currentItem?.id ? "hidden" : undefined}
      >
        <Box {...getComboboxProps()}>
          <Box ref={referenceRef}>
            <Input
              {...getInputProps()}
              placeholder={settings?.placeholder ?? ""}
              h="50px"
            />
          </Box>
          <Box ref={popperRef} zIndex={1000}>
            <chakra.ul
              {...getMenuProps()}
              border={
                isOpen &&
                inputValue &&
                inputValue.length > 2 &&
                (loading || data || error)
                  ? "1px solid"
                  : "none"
              }
              borderRadius="md"
              bg="#fff"
              borderColor="gray.400"
              p="0"
              m="0"
              maxH="310px"
              overflowY="auto"
            >
              {isOpen &&
                inputValue &&
                inputValue.length > 2 &&
                (loading || error || data) && (
                  <>
                    {data &&
                      searchResult &&
                      !loading &&
                      searchResult.map((item: any, index: number) => {
                        return (
                          <chakra.li
                            listStyleType="none"
                            m="1"
                            px="2"
                            borderColor="gray.400"
                            cursor="pointer"
                            h="42px"
                            borderRadius="md"
                            lineHeight="42px"
                            bg={
                              highlightedIndex === index
                                ? "gray.200"
                                : "transparent"
                            }
                            key={`${item}${index}`}
                            {...getItemProps({ item, index })}
                          >
                            <chakra.span
                              display="block"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              w="100%"
                              whiteSpace="nowrap"
                            >
                              <Highlighter
                                highlightStyle={{
                                  background: wine100,
                                }}
                                searchWords={[inputValue]}
                                autoEscape={true}
                                textToHighlight={item.label}
                              />
                            </chakra.span>
                          </chakra.li>
                        );
                      })}

                    {(searchResult?.length === 0 || error) &&
                      !loading &&
                      inputValue.length > 2 && (
                        <chakra.li
                          listStyleType="none"
                          m="1"
                          px="2"
                          borderColor="gray.400"
                          cursor="default"
                          h="42px"
                          borderRadius="md"
                          lineHeight="42px"
                          key={`not-found`}
                        >
                          {t(
                            "forms.select.autocomplete.search.notfound",
                            "Nothing found"
                          )}
                        </chakra.li>
                      )}

                    {loading && (
                      <chakra.li
                        listStyleType="none"
                        m="1"
                        px="2"
                        borderColor="gray.400"
                        cursor="pointer"
                        h="42px"
                        borderRadius="md"
                        lineHeight="42px"
                        key={`not-found`}
                      >
                        {t(
                          "forms.select.autocomplete.search.loading",
                          "Serching the database"
                        )}
                      </chakra.li>
                    )}
                  </>
                )}
            </chakra.ul>
          </Box>
        </Box>
      </Box>

      <input
        {...{ valid: !flattenedErrors[name]?.message ? "valid" : undefined }}
        type="hidden"
        defaultValue={currentItem?.id}
        {...register(name, {
          required: isRequired,
        })}
      />
      <FieldErrorMessage error={flattenedErrors[name]?.message} />
    </FormControl>
  );
};
