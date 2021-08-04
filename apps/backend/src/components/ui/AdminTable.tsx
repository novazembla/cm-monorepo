import React, { useCallback, useEffect, useMemo } from "react";
import {
  Table,
  Thead,
  Tr,
  Th,
  Td,
  chakra,
  Tbody,
  Checkbox,
  Box,
  Tfoot,
} from "@chakra-ui/react";
import {
  useGlobalFilter,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable,
  useAsyncDebounce,
  Column,
} from "react-table";

import { HiChevronDown, HiChevronUp } from "react-icons/hi";

import { useWhyDidYouUpdate } from "~/hooks";

export type AdminTableColumn = {
  Header: string;
  accessor?: string;
  isNumeric?: boolean;
  isDate?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  Cell?: React.FC<any>;
};

// const IndeterminateCheckbox = React.forwardRef(
//   ({ indeterminate, ...rest }, ref) => {
//     const defaultRef = React.useRef();
//     const resolvedRef = ref || defaultRef;

//     React.useEffect(() => {
//       resolvedRef.current.indeterminate = indeterminate;
//     }, [resolvedRef, indeterminate]);

//     return (
//       <>
//         <Checkbox ref={resolvedRef} {...rest} />
//       </>
//     );
//   }
// );

// Set our editable cell renderer as the default Cell renderer
// const defaultColumn = {
//   Cell: EditableCell,
// };

// export const DataTable = ({
//   columns,
//   data,
//   skipPageReset = false,
// }: {
//   columns: any[];
//   data: any[];
//   skipPageReset: boolean;
// }) => {
//   const {
//     getTableProps,
//     headerGroups,
//     prepareRow,
//     // defaultColumn,
//     page,
//     gotoPage,
//     setPageSize,
//     preGlobalFilteredRows,
//     setGlobalFilter,
//     state: { pageIndex, pageSize, selectedRowIds, globalFilter },
//   } = useTable(
//     {
//       columns,
//       data,
//       // xxx defaultColumn,
//       autoResetPage: !skipPageReset,
//     },
//     useGlobalFilter,
//     useSortBy,
//     usePagination,
//     useRowSelect,
//     (hooks) => {
//       hooks.allColumns.push((columns) => [
//         // Let's make a column for selection
//         {
//           id: "selection",
//           // The header can use the table's getToggleAllRowsSelectedProps method
//           // to render a checkbox.  Pagination is a problem since this will select all
//           // rows even though not all rows are on the current page.  The solution should
//           // be server side pagination.  For one, the clients should not download all
//           // rows in most cases.  The client should only download data for the current page.
//           // In that case, getToggleAllRowsSelectedProps works fine.
//           Header: ({ getToggleAllRowsSelectedProps }) => (
//             <Box>
//               <Checkbox {...getToggleAllRowsSelectedProps()} />
//             </Box>
//           ),
//           // The cell can use the individual row's getToggleRowSelectedProps method
//           // to the render a checkbox
//           Cell: ({ row }) => (
//             <Box>
//               <Checkbox {...row.getToggleRowSelectedProps()} />
//             </Box>
//           ),
//         },
//         ...columns,
//       ]);
//     }
//   );

//   const handleChangePage = (event: any, newPage: number) => {
//     gotoPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setPageSize(Number(event.target.value));
//   };

//   const removeByIndexs = (array, indexs) =>
//     array.filter((_: any, i: number) => !indexs.includes(i));

//   const deleteUserHandler = (event) => {
//     const newData = removeByIndexs(
//       data,
//       Object.keys(selectedRowIds).map((x) => parseInt(x, 10))
//     );
//     setData(newData);
//   };

//   const addUserHandler = (user) => {
//     const newData = data.concat([user]);
//     setData(newData);
//   };

//   // Render the UI for your table
//   return (
//     <Table>
//       <TableToolbar
//         numSelected={Object.keys(selectedRowIds).length}
//         deleteUserHandler={deleteUserHandler}
//         addUserHandler={addUserHandler}
//         preGlobalFilteredRows={preGlobalFilteredRows}
//         setGlobalFilter={setGlobalFilter}
//         globalFilter={globalFilter}
//       />
//       <Table {...getTableProps()}>
//         <Thead>
//           {headerGroups.map((headerGroup) => (
//             <Tr {...headerGroup.getHeaderGroupProps()}>
//               {headerGroup.headers.map((column) => (
//                 <Td
//                   {...(column.id === "selection"
//                     ? column.getHeaderProps()
//                     : column.getHeaderProps(column.getSortByToggleProps()))}
//                 >
//                   {column.render("Header")}
//                   {column.id !== "selection" ? (
//                     <TableSortLabel
//                       active={column.isSorted}
//                       // react-table has a unsorted state which is not treated here
//                       direction={column.isSortedDesc ? "desc" : "asc"}
//                     />
//                   ) : null}
//                 </Td>
//               ))}
//             </Tr>
//           ))}
//         </Thead>
//         <Tbody>
//           {page.map((row, i) => {
//             prepareRow(row);
//             return (
//               <Tr {...row.getRowProps()}>
//                 {row.cells.map((cell) => {
//                   return (
//                     <Td {...cell.getCellProps()}>
//                       {cell.render("Cell")}
//                     </Td>
//                   );
//                 })}
//               </Td>
//             );
//           })}
//         </Tbody>

//         <Tfoot>
//           <Tr>
//             <TablePagination
//               rowsPerPageOptions={[
//                 5,
//                 10,
//                 25,
//                 { label: "All", value: data.length },
//               ]}
//               colSpan={3}
//               count={data.length}
//               rowsPerPage={pageSize}
//               page={pageIndex}
//               SelectProps={{
//                 inputProps: { "aria-label": "rows per page" },
//                 native: true,
//               }}
//               onChangePage={handleChangePage}
//               onChangeRowsPerPage={handleChangeRowsPerPage}
//               ActionsComponent={TablePaginationActions}
//             />
//           </Tr>
//         </Tfoot>
//       </MaUTable>
//     </TableContainer>
//   );
// };

// https://medium.com/@blaiseiradukunda/react-table-7-tutorial-3d8ba6ac8b16

export type AdminTableState = {
  pageIndex: number;
  pageSize: number;
}

export const AdminTable = ({
  data,
  columns,
  onFetchData,
  intitalTableState,
  queryPageCount,
}: {
  data: any[];
  columns: AdminTableColumn[];
  onFetchData: (page: number, pageSize: number) => void;
  intitalTableState: AdminTableState;
  queryPageCount: number;
}) => {
  
  // https://github.com/tannerlinsley/react-table/issues/2912
  const memoedColumns = useMemo(
    () => columns,
    [columns]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,

    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns: memoedColumns,
      data,
      initialState: intitalTableState,
      manualPagination: true,
      autoResetPage: false,
      pageCount: queryPageCount,
    },
    useSortBy,
    usePagination
  );

  const onFetchDataDebounced = useAsyncDebounce(onFetchData, 100);

  // When the these table states changes, fetch new data!
  useEffect(() => {
    console.log("P", pageIndex, pageSize);
    // Every change will call our debounced function
    onFetchDataDebounced(pageIndex, pageSize);
    // Only the last call after the 100ms debounce is over will be fired!
  }, [onFetchDataDebounced, pageIndex, pageSize]);

  
  // https://github.com/tannerlinsley/react-table/issues/3064
  return (
    <>
      <div className="pagination">
      <button onClick={() => onFetchData(pageIndex, pageSize)}>
          Fetch
        </button>
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>{" "}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
        </button>{" "}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </button>{" "}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {">>"}
        </button>{" "}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
          onBlur={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <pre>
        <code>
          {JSON.stringify(
            {
              pageIndex,
              pageSize,
              pageCount,
              canNextPage,
              canPreviousPage,
            },
            null,
            1
          )}
        </code>
      </pre>
      <Table {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup) => (
            <Tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <Th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {/*isNumeric={column.isNumeric} */}
                  {column.render("Header")}
                  <chakra.span pl="4">
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <HiChevronDown aria-label="sorted descending" />
                      ) : (
                        <HiChevronUp aria-label="sorted ascending" />
                      )
                    ) : null}
                  </chakra.span>
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <Tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <Td {...cell.getCellProps()}>
                    {/*  isNumeric={cell.column.} */}
                    {cell.render("Cell")}
                    {/*  */}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </>
  );
};
