import React, {
  useState,
  useEffect,
  useMemo,
  ChangeEvent,
  ChangeEventHandler,
} from "react";
import { Link as RouterLink } from "react-router-dom";
import {
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
} from "@chakra-ui/react";
import {
  usePagination,
  // TODO: enable useRowSelect,
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
  HiOutlineTrash
} from "react-icons/hi";

import { FiEdit } from "react-icons/fi";

import { useTranslation } from "react-i18next";

export type AdminTableColumn = {
  Header: string;
  accessor?: string;
  isNumeric?: boolean;
  isCentered?: boolean;

  isDate?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  editPath?: string;
  editButtonLabel?: string;
  editButtonComponent?: React.FC<any>;

  allowEdit?: boolean;

  allowDelete?: boolean;
  deleteButtonLabel?: string;
  deleteButtonComponent?: React.FC<any>;
  deleteButtonOnClick?: () => void;
  Cell?: React.FC<any>;
};

export type AdminTableQueryStats = {
  total: number;
  pageCount: number;
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

export const AdminTableActionButtonEdit = (cell: Cell) => {
  const column: any = cell.column;
  
  return (
    <IconButton
      variant="outline"
      as={RouterLink}
      to={`${column.editPath}`.replace(":id", cell.row.values.id)}
      icon={<FiEdit />}
      fontSize="lg"
      aria-label={column.editButtonLabel}
      disabled={!column.allowEdit}
    />
  );
};


export const AdminTableActionButtonDelete = (cell: Cell) => {
  const column: any = cell.column;
  
  return (
    <IconButton
      variant="outline"
      colorScheme="red"
      onClick={column.deleteButtonOnClick}
      icon={<HiOutlineTrash />}
      fontSize="xl"
      aria-label={column.deleteButtonLabel}
      disabled={!column.allowDelete}
    />
  );
};

export const AdminTableActionCell = (cell: Cell) => {
  const column: any = cell.column;
  return (
    <Flex justifyContent="center">
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
      
      </HStack>
    </Flex>
  );
};

export const AdminTable = ({
  data,
  columns,
  isLoading,
  onFetchData,
  intitalTableState,
  queryStats,
}: {
  data: any[];
  columns: AdminTableColumn[];
  isLoading: boolean;
  onFetchData: (
    page: number,
    pageSize: number,
    sortBy: SortingRule<Object>[],
    filterKeyword: string
  ) => boolean;
  intitalTableState: AdminTableState;
  queryStats: AdminTableQueryStats;
}) => {
  const [triggeredRefetch, setTriggeredRefetch] = useState(false);
  const [filterKeyword, setFilterKeyword] = useState(
    intitalTableState.filterKeyword
  );

  const { t } = useTranslation();

  // https://github.com/tannerlinsley/react-table/issues/2912
  const columnsMemoized = useMemo<AdminTableColumn[]>(() => columns, [columns]);

  const dataMemoized = useMemo(() => data, [data]);

  //https://react-table.tanstack.com/docs/faq

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
      columns: columnsMemoized,
      data: dataMemoized,
      initialState: intitalTableState,
      manualPagination: true,
      manualSortBy: true,
      autoResetPage: false,
      pageCount: queryStats.pageCount,
    },
    useSortBy,
    usePagination
  );

  // When the these table states changes, fetch new data!
  useEffect(() => {
    setTriggeredRefetch(
      onFetchData(pageIndex, pageSize, sortBy, filterKeyword)
    );
  }, [onFetchData, pageIndex, pageSize, sortBy, filterKeyword]);

  const pageButtonCount = Math.min(5, queryStats.pageCount);
  const pageButtonIndexes = [...Array(pageButtonCount).keys()].map((index) => {
    return Math.min(
      Math.max(pageIndex - Math.max(1, Math.floor(pageButtonCount / 2)), 0) +
        index,
      Math.max(0, queryStats.pageCount - pageButtonCount + index)
    );
  });

  useEffect(() => {
    if (!isLoading) setTriggeredRefetch(false);
  }, [isLoading]);

  const onFilterChange: ChangeEventHandler = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setFilterKeyword(event?.target?.value ?? "");
  };

  // https://github.com/tannerlinsley/react-table/issues/3064
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
        <FormLabel for="filter" w="25%"
        m="0"
          >
          <VisuallyHidden>{t("admintable.search", "Keyword search")}</VisuallyHidden>
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
      <Table
        {...getTableProps()}
        className={isLoading || triggeredRefetch ? "loading" : ""}
        opacity="1"
        trasition="all 0.3s"
        sx={{
          "&.loading": {
            opacity: 0.5,
            pointerEvents: "none",
          },
        }}
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
                >
                  
                  <Flex justifyContent={((column as any).isCentered)? "center": "flex-start"}>
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
        <Tbody {...getTableBodyProps()}>
          {(!data || data.length === 0) && (
            <Tr>
              <Td borderColor="gray.300" colspan="20" textAlign="center">
                {t("admintable.nodata", "No items found")}
              </Td>
            </Tr>
          )}
          {rows.map((row) => {
            prepareRow(row);
            return (
              <Tr
                {...row.getRowProps()}
                _hover={{
                  bg: "gray.50",
                }}
              >
                {row.cells.map((cell) => (
                  <Td
                    {...cell.getCellProps()}
                    borderColor="gray.300"
                    isNumeric={(cell.column as any).isNumeric}
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
            <Td id="pagination" colSpan={20} borderBottom="none">
              <Flex justifyContent="center" mt="7" mb="3">
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
    </>
  );
};
