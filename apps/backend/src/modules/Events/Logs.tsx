import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { eventImportLogsQueryGQL, tourUpdateMutationGQL } from "@culturemap/core";
import { useQuery } from "@apollo/client";

import { Cell } from "react-table";

import { Badge } from "@chakra-ui/react";

import {
  ModuleSubNav,
  ButtonListElement,
  ModulePage,
} from "~/components/modules";

import { moduleRootPath, multiLangFields } from "./moduleConfig";
import { useAuthentication, useLocalStorage, useTypedSelector } from "~/hooks";

import {
  AdminTable,
  AdminTableColumn,
  AdminTableState,
  adminTableCreateQueryVariables,
  adminTableCreateNewTableState,
  AdminTableActionCell,
  AdminTableDateCell,
} from "~/components/ui";
import { config } from "~/config";
import { SortingRule } from "react-table";

const intitalTableState: AdminTableState = {
  pageIndex: 0,
  pageSize: config.defaultPageSize ?? 30,
  sortBy: [{
    id: "updatedAt",
    desc: true,
  }],
  filterKeyword: "",
};

let refetchDataCache: any[] = [];
let refetchTotalCount = 0;
let refetchPageIndex: number | undefined = undefined;

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

const Logs = () => {
  const { t, i18n } = useTranslation();
  const [appUser] = useAuthentication();
  const [tableState, setTableState] = useLocalStorage(
    `${moduleRootPath}/Logs`,
    intitalTableState
  );

  const [isRefetching, setIsRefetching] = useState(false);

  const previousRoute = useTypedSelector(
    ({ router }) => router.router.previous
  );

  useEffect(() => {
    if (previousRoute?.indexOf(moduleRootPath) === -1) {
      setTableState(intitalTableState);
    }
  }, [previousRoute, setTableState]);

  const { loading, error, data, refetch } = useQuery(eventImportLogsQueryGQL, {
    onCompleted: () => {
      setIsRefetching(false);
    },
    onError: () => {
      setIsRefetching(false);
    },
    notifyOnNetworkStatusChange: true,
    variables: adminTableCreateQueryVariables(
      tableState,
      multiLangFields,
      i18n.language,
      config.activeLanguages
    ),
  });

  const breadcrumb = [
    {
      path: moduleRootPath,
      title: t("module.events.title", "Events"),
    },
    {
      title: t("module.events.menuitem.importLogs", "Import Logs"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.back", "Go back"),
      userCan: "eventRead",
    },
  ];

  // columns need to be a ref!
  const { current: AdminTableColumns } = useRef([
    {
      Header: t("table.label.id", "Id"),
      accessor: "id",
    } as AdminTableColumn,
    {
      Cell: AdminTableDateCell,
      Header: t("table.label.date", "date"),
      accessor: "updatedAt",
    } as AdminTableColumn,

    {
      Cell: AdminTableErrorsCountCell,
      Header: t("table.label.errors", "Errors"),
      accessor: "errors",
    } as AdminTableColumn,
    {
      Cell: AdminTableWarningsCountCell,
      Header: t("table.label.warnings", "Warnings"),
      accessor: "warnings",
    } as AdminTableColumn,
    {
      Cell: AdminTableActionCell,
      Header: t("table.label.actions", "Actions"),
      isStickyToTheRight: true,

      isCentered: true,
      appUser,

      showView: true,
      canView: (cell, appUser) => appUser?.can("eventRead"),
      viewPath: `${moduleRootPath}/log/:id`,
      viewButtonLabel: t("module.events.button.viewLog", "View log"),

      showDelete: false,
    } as AdminTableColumn,
  ]);

  const onFetchData = (
    pageIndex: number,
    pageSize: number,
    sortBy: SortingRule<Object>[],
    filterKeyword: string
  ) => {
    refetchPageIndex = undefined;

    const [newTableState, doRefetch, newPageIndex] =
      adminTableCreateNewTableState(
        tableState,
        pageIndex,
        pageSize,
        sortBy,
        filterKeyword
      );

    if (doRefetch) {
      refetchPageIndex = pageIndex !== newPageIndex ? newPageIndex : undefined;
      refetchDataCache = data?.eventImportLogs?.eventImportLogs ?? [];
      refetchTotalCount = data?.eventImportLogs?.totalCount ?? 0;

      setIsRefetching(true);

      refetch(
        adminTableCreateQueryVariables(
          newTableState,
          multiLangFields,
          i18n.language,
          config.activeLanguages
        )
      );

      setTableState(newTableState);
    }

    return doRefetch;
  };

  const tableTotalCount =
    data?.eventImportLogs?.totalCount ?? refetchTotalCount;

  const tablePageCount =
    tableTotalCount > 0
      ? Math.ceil(
          (data?.eventImportLogs?.totalCount ?? refetchTotalCount) /
            tableState.pageSize
        )
      : 0;

  return (
    <>
      <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
      <ModulePage isLoading={loading && !isRefetching} isError={!!error}>
        <AdminTable
          columns={AdminTableColumns}
          isLoading={loading}
          showFilter={false}
          showKeywordSearch={false}
          {...{
            tableTotalCount,
            tablePageCount,
            isRefetching,
            onFetchData,
            refetchPageIndex,
          }}
          data={
            isRefetching
              ? refetchDataCache
              : data?.eventImportLogs?.eventImportLogs ?? []
          }
          intitalTableState={tableState}
        />
      </ModulePage>
    </>
  );
};
export default Logs;
