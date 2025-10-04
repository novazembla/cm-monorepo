import { useState } from "react";
import { useCombobox } from "downshift";
import { useLazyQuery, DocumentNode } from "@apollo/client";
import debounce from "lodash.debounce";

import Highlighter from "react-highlight-words";
import {
  FormLabel,
  FormControl,
  Box,
  Input,
  chakra,
  useToken,
  VisuallyHidden,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { usePopper } from "@chakra-ui/popper";

export interface FieldAutocompleteItem {
  title: string;
  lat: number;
  lng: number;
  distance: number;
}

export interface FieldAutocompleteSettings {
  placeholder?: string;
  debounceInterval?: number;
  minimumLength?: number;
}

export const FieldAutocomplete = ({
  settings,
  id,
  label,
  onItemSelect,
  createSearchVariables,
  processSearchResult,
  resultItemToString,
  searchQueryGQL,
}: {
  settings?: FieldAutocompleteSettings;
  id: string;
  label: string;
  name: string;
  onItemSelect: (item: any) => void;
  createSearchVariables: (value: any) => Record<string, unknown>;
  processSearchResult: (data: any) => any;
  resultItemToString: (item: any) => string;
  searchQueryGQL: DocumentNode;
}) => {
  const { t } = useTranslation();
  const { popperRef, referenceRef } = usePopper({
    matchWidth: true,
  });

  const [wine100] = useToken("colors", ["wine.100"]);

  const [lastSearch, setLastSearch] = useState("");

  const [findItems, { loading, data, error }] = useLazyQuery(searchQueryGQL, {
    fetchPolicy: "no-cache",
  });

  const minLength = settings?.minimumLength ? settings?.minimumLength - 1 : 2;

  const findItemsButChill = debounce((inputValue: string) => {
    if (lastSearch !== inputValue) {
      setLastSearch(inputValue);
      findItems({
        variables: createSearchVariables(inputValue),
      });
    }
  }, settings?.debounceInterval ?? 350);

  let searchResult = [];
  if (data) searchResult = processSearchResult(data);

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
    initialSelectedItem: undefined,
    items: searchResult,
    onStateChange: ({ inputValue, type, selectedItem, isOpen }) => {
      switch (type) {
        case useCombobox.stateChangeTypes.InputChange:
          if (typeof inputValue === "string" && inputValue.length > minLength)
            findItemsButChill(inputValue);

          break;
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          if (!selectedItem) return;

          if (typeof onItemSelect === "function")
            onItemSelect.call(null, selectedItem);

          reset();
          break;

        default:
          break;
      }
    },
    itemToString: resultItemToString,
  });

  return (
    <FormControl id={id}>
      <VisuallyHidden>
        <FormLabel htmlFor={id} mb="0.5">
          {label}
        </FormLabel>
      </VisuallyHidden>

      <Box {...getComboboxProps()}>
        <Box ref={referenceRef}>
          <Input
            {...getInputProps()}
            placeholder={settings?.placeholder ?? ""}
          />
        </Box>
        <Box ref={popperRef} zIndex={1001}>
          <chakra.ul
            {...getMenuProps()}
            border={
              isOpen &&
              inputValue &&
              inputValue.length > minLength &&
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
              inputValue.length > minLength &&
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
                              textToHighlight={item.title}
                            />
                          </chakra.span>
                        </chakra.li>
                      );
                    })}

                  {((data && searchResult.length === 0) || error) &&
                    !loading &&
                    inputValue.length > 2 && (
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
    </FormControl>
  );
};
