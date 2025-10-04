import React, {
  useState,
  useEffect,
  useMemo,
  ChangeEvent,
  ChangeEventHandler,
  useRef,
} from "react";
import "regenerator-runtime"
// import 'regenerator-runtime/runtime';

import { PublishStatus } from "@culturemap/core";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  chakra,
  FormLabel,
  Tbody,
  Flex,
  Button,
  Tfoot,
  Link,
  Select,
  HStack,
  VisuallyHidden,
  Icon,
  IconButton,
  Input,
  Badge,
} from "@chakra-ui/react";
import { RiCloseFill } from "@hacknug/react-icons/ri";

import {
  usePagination,
  useSortBy,
  // TODO: enable useRowSelect,
  useAsyncDebounce,
  useTable,
  SortingRule,
  Cell,
} from "react-table";

import {
  HiChevronDown,
  HiChevronUp,
  HiChevronDoubleLeft,
  HiChevronDoubleRight,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineTrash,
} from "react-icons/hi";

import { FiEdit } from "react-icons/fi";
import { BsEye } from "react-icons/bs";

import { useTranslation } from "react-i18next";
import { MultiLangValue } from ".";

import {
  FieldRadioOrCheckboxGroup,
  FieldRow,
  FieldModuleTaxonomies,
  FieldSwitch,
} from "~/components/forms";

import type { AdminTableColumn, AdminTableState } from "./admin-table-utils";

export const AdminTableErrorsCountCell = (cell: Cell) => {
  let count = 0;
  let color = "gray";

  if (Array.isArray(cell.value) && cell.value.length > 0) {
    color = "red";
    count = cell.value.length;
  }

  return (
    <Badge
      minW="8rem"
      variant="subtle"
      textAlign="center"
      colorScheme={color}
      p="2"
      borderRadius="lg"
    >
      {count}
    </Badge>
  );
};

export const AdminTableWarningsCountCell = (cell: Cell) => {
  let count = 0;
  let color = "gray";

  if (Array.isArray(cell.value) && cell.value.length > 0) {
    color = "orange";
    count = cell.value.length;
  }

  return (
    <Badge
      minW="8rem"
      variant="subtle"
      textAlign="center"
      colorScheme={color}
      p="2"
      borderRadius="lg"
    >
      {count}
    </Badge>
  );
};

export const AdminTableActionButtonEdit = (cell: Cell) => {
  const column: any = cell.column;

  const hasAccess =
    typeof column.canEdit === "undefined" ||
    column.canEdit === true ||
    (typeof column.canEdit === "function" &&
      column.canEdit.call(null, cell, column.appUser));

  return (
    <IconButton
      variant="outline"
      as={RouterLink}
      to={`${column.editPath}`.replace(":id", cell.row.values.id)}
      icon={<FiEdit />}
      fontSize="lg"
      aria-label={column.editButtonLabel}
      title={column.editButtonLabel}
      disabled={!hasAccess}
    />
  );
};

export const AdminTableActionButtonView = (cell: Cell) => {
  const column: any = cell.column;

  const hasAccess =
    typeof column.canView === "undefined" ||
    column.canView === true ||
    (typeof column.canView === "function" &&
      column.canView.call(null, cell, column.appUser));

  return (
    <IconButton
      variant="outline"
      as={RouterLink}
      to={`${column.viewPath}`.replace(":id", cell.row.values.id)}
      icon={<BsEye />}
      fontSize="lg"
      aria-label={column.viewButtonLabel}
      title={column.viewButtonLabel}
      disabled={!hasAccess}
    />
  );
};

export const AdminTableActionButtonDelete = (cell: Cell) => {
  const column: any = cell.column;

  const hasAccess =
    typeof column.canDelete === "undefined" ||
    column.canDelete === true ||
    (typeof column.canDelete === "function" &&
      column.canDelete.call(null, cell, column.appUser));

  return (
    <IconButton
      variant="outline"
      colorScheme="red"
      onClick={() => {
        column.deleteButtonOnClick.call(null, cell);
      }}
      icon={<HiOutlineTrash />}
      fontSize="xl"
      aria-label={column.deleteButtonLabel}
      title={column.deleteButtonLabel}
      disabled={!hasAccess}
    />
  );
};

export const AdminTableActionCell = (cell: Cell) => {
  const column: any = cell.column;

  return (
    <Flex justifyContent="center" py="4" bg="rgba(255, 255, 255, 0.8)">
      <HStack>
        {column.showDelete &&
          React.createElement(
            column.deleteButtonComponent ?? AdminTableActionButtonDelete,
            cell
          )}
        {column.showEdit &&
          React.createElement(
            column.editButtonComponent ?? AdminTableActionButtonEdit,
            cell
          )}
        {column.showView &&
          React.createElement(
            column.viewButtonComponent ?? AdminTableActionButtonView,
            cell
          )}
      </HStack>
    </Flex>
  );
};

export const AdminTablePublishStatusCell = (cell: Cell) => {
  const { t } = useTranslation();
  let color = "gray";
  const variant = "subtle";
  let label = t("publish.status.unknown", "Unknown");

  if (cell.value === PublishStatus.AUTODRAFT) {
    color = "gray";
    label = t("publish.status.autodraft", "Draft");
  }

  if (cell.value === PublishStatus.DRAFT) {
    color = "gray";
    label = t("publish.status.draft", "Draft");
  }

  if (cell.value === PublishStatus.FORREVIEW) {
    color = "cyan";
    label = t("publish.status.forreview", "For review");
  }

  if (cell.value === PublishStatus.IMPORTED) {
    color = "orange";
    label = t("publish.status.imported", "Imported");
  }

  if (cell.value === PublishStatus.IMPORTEDWARNINGS) {
    color = "orange";
    label = t("publish.status.importedwrning", "Imported with warning(s)");
  }

  if (cell.value === PublishStatus.SUGGESTION) {
    color = "cyan";
    label = t("publish.status.suggestion", "Suggestion");
  }

  if (cell.value === PublishStatus.REJECTED) {
    color = "orange";
    label = t("publish.status.rejected", "Rejected");
  }

  if (cell.value === PublishStatus.PUBLISHED) {
    color = "green";
    label = t("publish.status.published", "Published");
  }

  if (cell.value === PublishStatus.TRASHED) {
    color = "red";
    label = t("publish.status.trashed", "Trashed");
  }

  return (
    <Badge
      minW="8rem"
      variant={variant}
      textAlign="center"
      colorScheme={color}
      p="2"
      borderRadius="lg"
    >
      {label}
    </Badge>
  );
};

export const AdminTableDateCell = (cell: Cell) => {
  let date = "-";

  try {
    date = new Date(cell.value).toLocaleString();
  } catch (err) {
    return null;
  }

  return <>{date}</>;
};

export const AdminTableMultiLangCell = (cell: Cell) => (
  <MultiLangValue json={cell.value} />
);

export const AdminTable = ({
  data,
  taxonomies,
  columns,
  isLoading,
  isRefetching,
  onFetchData,
  intitalTableState,
  tablePageCount,
  tableTotalCount,
  refetchPageIndex,
  showKeywordSearch = true,
  showFilter = true,
  statusFilter = [],
  resetFilter,
}: {
  data: any[];
  taxonomies?: any[];
  columns: AdminTableColumn[];
  isLoading: boolean;
  isRefetching: boolean;
  showKeywordSearch?: boolean;
  showFilter?: boolean;
  statusFilter?: PublishStatus[];
  onFetchData: (
    page: number,
    pageSize: number,
    sortBy: SortingRule<Record<string, unknown>>[],
    filterKeyword: string,
    forceRefetch?: boolean
  ) => boolean;
  resetFilter?: () => void;
  intitalTableState: AdminTableState;
  tablePageCount: number;
  tableTotalCount: number;
  refetchPageIndex: number | undefined;
}) => {
  const { t } = useTranslation();

  const [filterIsOpen, setFilterIsOpen] = useState(false);
  const filterContent = useRef<HTMLDivElement>(null);

  const [triggeredRefetch, setTriggeredRefetch] = useState(false);
  const [filterKeyword, setFilterKeyword] = useState(
    intitalTableState.filterKeyword
  );

  const dataMemoized = useMemo(() => data, [data]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns,
      data: dataMemoized,
      initialState: intitalTableState,
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      pageCount: tablePageCount,
    },
    useSortBy,
    usePagination
  );

  // Debounce our onFetchData call for 100ms
  const onFetchDataDebounced = useAsyncDebounce(
    (pageIndex, pageSize, sortBy, filterKeyword) => {
      setTriggeredRefetch(
        onFetchData(pageIndex, pageSize, sortBy, filterKeyword)
      );
    },
    100
  );

  // When the these table states changes, fetch potentiall new data using a debounce functione
  // to not catch the jitter that useTable does react
  useEffect(() => {
    onFetchDataDebounced(pageIndex, pageSize, sortBy, filterKeyword);
  }, [onFetchDataDebounced, pageIndex, pageSize, sortBy, filterKeyword]);

  // ... but also set immediately the ui to loading (better to cancel in 100ms) than to have
  // slow responden fading out of the table
  useEffect(() => {
    let mounted = true;

    if (mounted) setTriggeredRefetch(true);

    return () => {
      mounted = false;
    };
  }, [pageIndex, pageSize, sortBy]);

  // and if the new data came in we want to change the state of the table to active
  useEffect(() => {
    let mounted = true;

    if (mounted && !isLoading && !isRefetching) {
      setTriggeredRefetch(false);
      if (typeof refetchPageIndex !== "undefined")
        gotoPage(refetchPageIndex ?? 0);
    }

    return () => {
      mounted = false;
    };
  }, [gotoPage, isLoading, isRefetching, refetchPageIndex]);

  // Debounce our setFilterKeyword call for a few millisecond
  // to make the filter object not to query too often the db
  const setFilterKeywordDebounced = useAsyncDebounce(setFilterKeyword, 300);

  const onFilterChange: ChangeEventHandler = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setFilterKeywordDebounced(event?.target?.value ?? "");
  };

  // lastly calculate the buttons for the pagination
  const pageButtonCount = Math.min(5, tablePageCount);
  const pageButtonIndexes = [...Array(pageButtonCount).keys()].map((index) => {
    return Math.min(
      Math.max(pageIndex - Math.max(1, Math.floor(pageButtonCount / 2)), 0) +
        index,
      Math.max(0, tablePageCount - pageButtonCount + index)
    );
  });

  const keywordInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <VisuallyHidden>
        <Link to="#pagination">
          {t("admintable.gotopagination", "Skip to pagination")}
        </Link>
      </VisuallyHidden>

      {(showKeywordSearch || showFilter) && (
        <Box mb="5">
          <Flex
            py="2"
            justifyContent="space-between"
            borderY="1px solid"
            borderColor="gray.300"
          >
            <Box width="80%" pr="6">
              {showFilter && (
                <Button
                  onClick={() => {
                    setFilterIsOpen(!filterIsOpen);
                  }}
                >
                  {t("admintable.filter.button.toggle", "Filter")}
                </Button>
              )}
            </Box>
            <Box w="20%">
              <FormLabel position="relative" htmlFor="filter" m="0">
                <VisuallyHidden>
                  {t("admintable.search", "Keyword search")}
                </VisuallyHidden>
                <Input
                  name="filter"
                  id="filter"
                  onChange={onFilterChange}
                  onBlur={onFilterChange}
                  ref={keywordInputRef}
                  defaultValue={intitalTableState.filterKeyword}
                  placeholder={t("admintable.search", "Keyword search")}
                  pr="50px"
                />
                {filterKeyword && (
                  <IconButton
                    position="absolute"
                    right="5px"
                    top="5px"
                    variant="outline"
                    icon={<RiCloseFill />}
                    zIndex="10"
                    onClick={() => {
                      setFilterKeyword("");

                      if (keywordInputRef.current)
                        keywordInputRef.current.value = "";
                    }}
                    borderColor="gray.400"
                    color="gray.800"
                    fontSize="lg"
                    h="30px"
                    w="30px"
                    minW="30px"
                    p="0"
                    aria-label={t(
                      "forms.select.autocomplete.clearselection",
                      "Clear selected element"
                    )}
                  />
                )}
              </FormLabel>
            </Box>
          </Flex>
          {showFilter && (taxonomies || statusFilter) && (
            <Box
              position="relative"
              overflowY="hidden"
              transition="height 0.5s"
              w="100%"
              sx={{
                h:
                  filterIsOpen && filterContent.current
                    ? filterContent.current.offsetHeight + 1
                    : 0,
              }}
            >
              <Box
                ref={filterContent}
                w="100%"
                position="absolute"
                bottom="0"
                left="0"
              >
                <Box
                  pt="2"
                  pb="3"
                  borderBottom="1px solid"
                  borderColor="gray.300"
                  w="100%"
                >
                  {Array.isArray(statusFilter) && statusFilter.length > 0 && (
                    <FieldRow>
                      <FieldRadioOrCheckboxGroup
                        id="filter_status"
                        name="filter_status"
                        label={t(
                          "admintable.filter.status",
                          "Pulication status"
                        )}
                        type="checkbox"
                        options={statusFilter
                          .map((status: PublishStatus) => {
                            let value = {
                              id: 0,
                              label: "Unknown",
                            };

                            switch (status) {
                              case PublishStatus.IMPORTED:
                                value = {
                                  id: PublishStatus.IMPORTED,
                                  label: t(
                                    "publish.status.imported",
                                    "Imported"
                                  ),
                                };
                                break;

                              case PublishStatus.IMPORTEDWARNINGS:
                                value = {
                                  id: PublishStatus.IMPORTEDWARNINGS,
                                  label: t(
                                    "publish.status.importedwarning",
                                    "Imported with warning(s)"
                                  ),
                                };
                                break;

                              case PublishStatus.SUGGESTION:
                                value = {
                                  id: PublishStatus.SUGGESTION,
                                  label: t(
                                    "publish.status.suggestion",
                                    "Suggestion"
                                  ),
                                };
                                break;

                              case PublishStatus.DRAFT:
                                value = {
                                  id: PublishStatus.DRAFT,
                                  label: t("publish.status.draft", "Draft"),
                                };
                                break;

                              case PublishStatus.FORREVIEW:
                                value = {
                                  id: PublishStatus.FORREVIEW,
                                  label: t(
                                    "publish.status.forreview",
                                    "For review"
                                  ),
                                };
                                break;

                              case PublishStatus.REJECTED:
                                value = {
                                  id: PublishStatus.REJECTED,
                                  label: t(
                                    "publish.status.rejected",
                                    "Rejected"
                                  ),
                                };
                                break;

                              case PublishStatus.PUBLISHED:
                                value = {
                                  id: PublishStatus.PUBLISHED,
                                  label: t(
                                    "publish.status.published",
                                    "Published"
                                  ),
                                };
                                break;

                              case PublishStatus.TRASHED:
                                value = {
                                  id: PublishStatus.TRASHED,
                                  label: t("publish.status.trashed", "Trashed"),
                                };
                                break;

                              default:
                                value = {
                                  id: 0,
                                  label: "unknown",
                                };
                                break;
                            }

                            return value;
                          })
                          .sort((a: any, b: any) => {
                            if (a.label < b.label) return -1;
                            if (a.label > b.label) return 1;
                            return 0;
                          })}
                      />
                    </FieldRow>
                  )}

                  {taxonomies && (
                    <FieldModuleTaxonomies data={taxonomies} isFilter />
                  )}

                  <Flex
                    width="100%"
                    pt="3"
                    justifyContent="space-between"
                    alignContent="center"
                    px="1"
                  >
                    <Box>
                      {taxonomies && (
                        <FieldSwitch
                          name="and"
                          label={
                            <span>
                              {t(
                                "admintable.filter.termsAndRelationship",
                                "Items must have all the selected taxonomy terms"
                              )}
                            </span>
                          }
                          defaultChecked={!!intitalTableState.and}
                        />
                      )}
                    </Box>

                    <HStack>
                      <Button
                        colorScheme="gray"
                        onClick={() => {
                          setFilterKeyword("");

                          if (keywordInputRef.current)
                            keywordInputRef.current.value = "";

                          if (typeof resetFilter === "function")
                            resetFilter.call(null);

                          onFetchData(
                            intitalTableState.pageIndex,
                            intitalTableState.pageSize,
                            intitalTableState.sortBy,
                            intitalTableState.filterKeyword,
                            true
                          );
                          setFilterIsOpen(false);
                        }}
                      >
                        {t("admintable.filter.button.reset", "Reset")}
                      </Button>
                      <Button
                        onClick={() => {
                          onFetchData(
                            pageIndex,
                            pageSize,
                            sortBy,
                            filterKeyword
                          );
                          setFilterIsOpen(false);
                        }}
                      >
                        {t("admintable.filter.button.filter", "Filter")}
                      </Button>
                    </HStack>
                  </Flex>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      )}
      <Box className="admin-table-wrapper" w="100%" overflowX="auto">
        <Table
          {...getTableProps()}
          className={
            isLoading || triggeredRefetch
              ? "loading admin-table"
              : "admin-table"
          }
          opacity="1"
          trasition="all 0.3s"
          sx={{
            "&.loading": {
              opacity: 0.5,
              pointerEvents: "none",
            },
          }}
          w="100%"
        >
          <Thead>
            {headerGroups.map((headerGroup) => (
              <Tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <Th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    fontSize="md"
                    color="gray.800"
                    borderColor="gray.300"
                    isNumeric={(column as any).isNumeric}
                    _last={
                      (column as any).isStickyToTheRight
                        ? {
                            position: "sticky",
                            right: 0,
                            p: 0,
                            "> div": {
                              p: 4,
                              h: "100%",
                              bg: "rgba(255,255,255,0.9)",
                            },
                          }
                        : undefined
                    }
                  >
                    <Flex
                      justifyContent={
                        (column as any).isCentered
                          ? "center"
                          : (column as any).isNumeric
                          ? "flex-end"
                          : "flex-start"
                      }
                    >
                      {column.render("Header")}
                      <chakra.span w="22" pl="1">
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <Icon
                              as={HiChevronDown}
                              aria-label={t(
                                "admintable.sorted.desc",
                                "Sorted descending"
                              )}
                              fontSize="lg"
                              transform="translateY(-3px)"
                            />
                          ) : (
                            <Icon
                              as={HiChevronUp}
                              aria-label={t(
                                "admintable.sorted.asc",
                                "Sorted ascending"
                              )}
                              fontSize="lg"
                              transform="translateY(-3px)"
                            />
                          )
                        ) : null}
                      </chakra.span>
                    </Flex>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody {...getTableBodyProps()} position="relative">
            {(!data || data.length === 0) && (
              <Tr>
                <Td borderColor="gray.300" colSpan={20} textAlign="center">
                  {t("admintable.nodata", "No items found")}
                </Td>
              </Tr>
            )}
            {rows.map((row) => {
              prepareRow(row);
              return (
                <Tr
                  {...row.getRowProps()}
                  sx={{
                    _hover: {
                      td: {
                        bg: "gray.50",

                        "> div": {
                          bg: "transparent",
                        },
                      },
                    },
                  }}
                >
                  {row.cells.map((cell) => (
                    <Td
                      {...cell.getCellProps()}
                      borderColor="gray.300"
                      isNumeric={(cell.column as any).isNumeric}
                      transition="background-color 0.3s"
                      _last={
                        (cell.column as any).isStickyToTheRight
                          ? {
                              position: "sticky",
                              right: 0,
                              p: 0,
                            }
                          : undefined
                      }
                    >
                      {cell.render("Cell")}
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
          <Tfoot>
            <Tr>
              <Td id="pagination" colSpan={20} borderBottom="none" px="0">
                <Flex
                  justifyContent={{ base: "flex-start", d: "center" }}
                  mt="7"
                  mb="3"
                >
                  <HStack>
                    <Box pr="6" whiteSpace="nowrap">
                      {t("admintable.total", "Total count")}: {tableTotalCount}
                    </Box>
                    <IconButton
                      icon={<HiChevronDoubleLeft />}
                      onClick={() => gotoPage(0)}
                      disabled={!canPreviousPage}
                      aria-label={t(
                        "admintable.pagination.gotofirstpage",
                        "goto first page"
                      )}
                    >
                      {"<<"}
                    </IconButton>
                    <IconButton
                      icon={<HiChevronLeft />}
                      onClick={() => previousPage()}
                      disabled={!canPreviousPage}
                      aria-label={t(
                        "admintable.pagination.gotopreviouspage",
                        "goto previous page"
                      )}
                    >
                      {"<"}
                    </IconButton>
                    {pageButtonIndexes.map((index) => (
                      <Button
                        key={`b-${index}`}
                        onClick={() => gotoPage(index)}
                        isActive={pageIndex === index}
                        // disabled={!canNextPage}
                        aria-label={t(
                          "admintable.pagination.gotopage",
                          "goto page number {{page}}",
                          { page: index + 1 }
                        )}
                      >
                        {index + 1}
                      </Button>
                    ))}
                    <IconButton
                      icon={<HiChevronRight />}
                      onClick={() => nextPage()}
                      disabled={!canNextPage}
                      aria-label={t(
                        "admintable.pagination.gotonextpage",
                        "goto next page"
                      )}
                    >
                      {">"}
                    </IconButton>
                    <IconButton
                      icon={<HiChevronDoubleRight />}
                      onClick={() => gotoPage(pageCount - 1)}
                      disabled={!canNextPage}
                      aria-label={t(
                        "admintable.pagination.gotolastpage",
                        "goto last page"
                      )}
                    >
                      {">>"}
                    </IconButton>
                    <Select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                      }}
                      onBlur={(e) => {
                        setPageSize(Number(e.target.value));
                      }}
                    >
                      {[10, 20, 30, 50, 100].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                          {t(
                            "admintable.changepagesize",
                            "{{pageSize}} per page",
                            {
                              pageSize,
                            }
                          )}
                        </option>
                      ))}
                    </Select>
                  </HStack>
                </Flex>
              </Td>
            </Tr>
          </Tfoot>
        </Table>
      </Box>
    </>
  );
};
