import React, {
  useState,
  useEffect,
  useMemo,
  ChangeEvent,
  ChangeEventHandler,
} from "react";
import type { AuthenticatedAppUser } from "@culturemap/core";
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
  Badge
} from "@chakra-ui/react";
import {
  usePagination,
  // TODO: enable useRowSelect,
  useAsyncDebounce,
  useSortBy,
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

export type AdminTableColumn = {
  Header: string;
  accessor?: string;
  isNumeric?: boolean;
  isCentered?: boolean;
  isStickyToTheRight?: boolean;

  isDate?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showView?: boolean;
  editPath?: string;
  viewPath?: string;
  editButtonLabel?: string;
  viewButtonLabel?: string;
  editButtonComponent?: React.FC<any>;
  viewButtonComponent?: React.FC<any>;

  canEdit?: boolean | ((cell: Cell, appUser: AuthenticatedAppUser) => boolean);
  canView?: boolean | ((cell: Cell, appUser: AuthenticatedAppUser) => boolean);

  canDelete?:
    | boolean
    | ((cell: Cell, appUser: AuthenticatedAppUser) => boolean);
  deleteButtonLabel?: string;
  deleteButtonComponent?: React.FC<any>;
  deleteButtonOnClick?: (cell: Cell) => void;

  appUser?: AuthenticatedAppUser;
  Cell?: React.FC<any>;
};

export type AdminTableState = {
  pageIndex: number;
  pageSize: number;
  sortBy: SortingRule<Object>[];
  filterKeyword: string;
};

export type AdminTableQueryVariables = {
  pageSize?: number | undefined;
  pageIndex?: number | undefined;
  orderBy?: Record<string, "asc" | "desc"> | undefined;
  where?: any;
};

export const adminTableCreateQueryVariables = (
  tState: AdminTableState,
  filterColumnKeys: string[],
  jsonColumns?: string[],
  jsonKeys?: string[]
) => {
  let variables: AdminTableQueryVariables = {
    pageIndex: tState.pageIndex,
    pageSize: tState.pageSize,
  };

  if (tState.sortBy && Array.isArray(tState.sortBy) && tState.sortBy.length) {
    variables = {
      ...variables,
      orderBy: {
        [tState.sortBy[0].id]: tState.sortBy[0].desc ? "desc" : "asc",
      },
    };
  }

  if (tState.filterKeyword && tState.filterKeyword.length > 2) {
    // however in any case we need to set the where clause

    variables = {
      ...variables,
      where: {
        OR: filterColumnKeys.map((key) => {
          if (jsonColumns && jsonKeys && jsonColumns.includes(key)) {
            return {
              OR: jsonKeys.map((jKey) => ({
                [key]: {
                  path: jKey,
                  string_contains: tState.filterKeyword,
                  // TODO: maybe enable at some point mode: 'insensitive',
                },
              })),
            };
          } else {
            return {
              [key]: {
                contains: tState.filterKeyword,
                mode: "insensitive",
              },
            };
          }
        }),
      },
    };
  }

  return variables;
};

export const adminTableCreateNewTableState = (
  tableState: AdminTableState,
  pageIndex: number,
  pageSize: number,
  sortBy: SortingRule<Object>[],
  filterKeyword: string
): [AdminTableState, boolean, number] => {
  let newTableState = {
    ...tableState,
    filterKeyword,
  };

  let doRefetch = false;

  let newPageIndex = pageIndex;

  if (
    (!sortBy || (Array.isArray(sortBy) && sortBy.length === 0)) &&
    tableState.sortBy.length > 0
  ) {
    newTableState = {
      ...newTableState,
      sortBy: [],
    };
    newPageIndex = 0;
    doRefetch = true;
  }

  if (Array.isArray(sortBy) && sortBy.length > 0) {
    if (
      tableState.sortBy.length === 0 ||
      tableState?.sortBy[0]?.id !== sortBy[0].id ||
      tableState?.sortBy[0]?.desc !== sortBy[0].desc
    ) {
      newTableState = {
        ...newTableState,
        sortBy: [sortBy[0]],
      };
      newPageIndex = 0;
      doRefetch = true;
    }
  }

  if (tableState.pageSize !== pageSize) {
    newTableState = {
      ...newTableState,
      pageSize,
    };
    doRefetch = true;
  }

  if (!filterKeyword || filterKeyword.length < 3) {
    // we need to clear the where clause
    if (tableState.filterKeyword.length >= 3) {
      doRefetch = true;
      newPageIndex = 0;
    }
  } else {
    // a change happened ensure that the refetch is being triggerd
    if (tableState.filterKeyword !== filterKeyword) {
      doRefetch = true;
      newPageIndex = 0;
    }
  }

  if (tableState.pageIndex !== newPageIndex) {
    newTableState = {
      ...newTableState,
      pageIndex: newPageIndex,
    };
    doRefetch = true;
  }

  return [newTableState, doRefetch, newPageIndex];
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
  const {t} = useTranslation();
  let color = "gray";
  let variant = "subtle";
  let label = t("publish.status.unknown", "Unknown")

  if (cell.value === PublishStatus.AUTODRAFT) {
    color = "gray";
    label = t("publish.status.autodraft", "Draft")
  }

  if (cell.value === PublishStatus.DRAFT) {
    color = "gray";
    label = t("publish.status.draft", "Draft")
  }
    

  if (cell.value === PublishStatus.FORREVIEW) {
    color = "cyan";
    label = t("publish.status.forreview", "For review")
  }

  if (cell.value === PublishStatus.REJECTED) {
    color = "orange";
    label = t("publish.status.rejected", "Rejected")
  }

  if (cell.value === PublishStatus.PUBLISHED) {
    color = "green";
    label = t("publish.status.published", "Published")
  }

  if (cell.value === PublishStatus.TRASHED) {
    color = "red";
    label = t("publish.status.trashed", "Trashed")
  }

  return (
    <Badge
      w="120px"
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

export const AdminTableMultiLangCell = (cell: Cell) => (
  <MultiLangValue json={cell.value} />
);

export const AdminTable = ({
  data,
  columns,
  isLoading,
  isRefetching,
  onFetchData,
  intitalTableState,
  tablePageCount,
  tableTotalCount,
  refetchPageIndex,
}: {
  data: any[];
  columns: AdminTableColumn[];
  isLoading: boolean;
  isRefetching: boolean;
  onFetchData: (
    page: number,
    pageSize: number,
    sortBy: SortingRule<Object>[],
    filterKeyword: string
  ) => boolean;
  intitalTableState: AdminTableState;
  tablePageCount: number;
  tableTotalCount: number;
  refetchPageIndex: number | undefined;
}) => {
  const { t } = useTranslation();

  // TODO: remove

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

  return (
    <>
      <VisuallyHidden>
        <Link to="#pagination">
          {t("admintable.gotopagination", "Skip to pagination")}
        </Link>
      </VisuallyHidden>

      <Flex
        mb="5"
        py="2"
        justifyContent="flex-end"
        borderY="1px solid"
        borderColor="gray.300"
      >
        <FormLabel htmlFor="filter" w="25%" m="0">
          <VisuallyHidden>
            {t("admintable.search", "Keyword search")}
          </VisuallyHidden>
          <Input
            name="filter"
            id="filter"
            onChange={onFilterChange}
            onBlur={onFilterChange}
            defaultValue={intitalTableState.filterKeyword}
            placeholder={t("admintable.search", "Keyword search")}
          />
        </FormLabel>
      </Flex>
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
                          bg: "transparent"
                        }
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
