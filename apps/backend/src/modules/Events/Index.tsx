import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { eventsQueryGQL, eventDeleteMutationGQL } from "@culturemap/core";
import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ButtonListElement,
  ModulePage,
} from "~/components/modules";

import { moduleRootPath, multiLangFields } from "./moduleConfig";
import {
  useDeleteByIdButton,
  useAuthentication,
  useLocalStorage,
  useTypedSelector,
} from "~/hooks";

import {
  AdminTable,
  AdminTableColumn,
  AdminTableState,
  adminTableCreateQueryVariables,
  adminTableCreateNewTableState,
  AdminTableActionCell,
  AdminTableMultiLangCell,
  AdminTablePublishStatusCell,
  AdminTableDateCell,
} from "~/components/ui";
import { config } from "~/config";
import { SortingRule } from "react-table";

const intitalTableState: AdminTableState = {
  pageIndex: 0,
  pageSize: config.defaultPageSize ?? 30,
  sortBy: [],
  filterKeyword: "",
};

let refetchDataCache: any[] = [];
let refetchTotalCount = 0;
let refetchPageIndex: number | undefined = undefined;

const Index = () => {
  const { t, i18n } = useTranslation();
  const [appUser] = useAuthentication();
  const [tableState, setTableState] = useLocalStorage(
    `${moduleRootPath}/Index`,
    intitalTableState
  );

  const [isRefetching, setIsRefetching] = useState(false);


  const previousRoute = useTypedSelector(({router}) => router.router.previous);

  useEffect(() => {
    if (previousRoute?.indexOf(moduleRootPath) === -1) {
      setTableState(intitalTableState);
    }    
  }, [previousRoute, setTableState])

  const { loading, error, data, refetch } = useQuery(eventsQueryGQL, {
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

  const [adminTableDeleteButtonOnClick, DeleteAlertDialog, isDeleteError] =
    useDeleteByIdButton(
      eventDeleteMutationGQL,
      () => {
        refetch(tableState);
      },
      {
        requireTextualConfirmation: true,
      }
    );

  const breadcrumb = [
    {
      path: moduleRootPath,
      title: t("module.events.title", "Events"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "navigation",
      to: `${moduleRootPath}/create`,
      label: t("module.events.button.create", "Add new event"),
      userCan: "eventCreate",
    },
    {
      type: "navigation",
      to: `${moduleRootPath}/logs`,
      label: t("module.locations.menuitem.importLogs", "Import Logs"),
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
      Header: t("table.label.lastUpdate", "Last update"),
      accessor: "updatedAt",
    } as AdminTableColumn,
    {
      Cell: AdminTablePublishStatusCell,
      Header: t("table.label.status", "status"),
      accessor: "status",
    } as AdminTableColumn,
    {
      Cell: AdminTableMultiLangCell,
      Header: t("table.label.title", "Title"),
      accessor: "title",
    } as AdminTableColumn,
    {
      Cell: AdminTableActionCell,
      Header: t("table.label.actions", "Actions"),
      isStickyToTheRight: true,

      isCentered: true,
      appUser,

      showEdit: true,
      canEdit: (cell, appUser) =>
        appUser?.can("eventUpdate") ||
        (appUser.can("eventUpdateOwn") &&
          appUser.id === (cell?.row?.original as any)?.ownerId),
      editPath: `${moduleRootPath}/update/:id`,
      editButtonLabel: t("module.events.button.edit", "Edit event"),
      // editButtonComponent: undefined,

      showDelete: true,
      canDelete: (cell, appUser) =>
        appUser?.can("eventDelete") ||
        (appUser.can("eventDeleteOwn") &&
          appUser.id === (cell?.row?.original as any)?.ownerId),

      deleteButtonLabel: t("module.events.button.delete", "Delete event"),
      // deleteButtonComponent?: React.FC<any>;

      deleteButtonOnClick: (cell) => {
        adminTableDeleteButtonOnClick(cell?.row?.values?.id ?? 0);
      },
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
      refetchDataCache = data?.events?.events ?? [];
      refetchTotalCount = data?.events?.totalCount ?? 0;

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

  const tableTotalCount = data?.events?.totalCount ?? refetchTotalCount;

  const tablePageCount =
    tableTotalCount > 0
      ? Math.ceil(
          (data?.events?.totalCount ?? refetchTotalCount) / tableState.pageSize
        )
      : 0;

  return (
    <>
      <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
      <ModulePage
        isLoading={loading && !isRefetching}
        isError={!!error || !!isDeleteError}
      >
        <AdminTable
          columns={AdminTableColumns}
          isLoading={loading}
          showFilter={true}
          showKeywordSearch={true}
          {...{
            tableTotalCount,
            tablePageCount,
            isRefetching,
            onFetchData,
            refetchPageIndex,
          }}
          data={isRefetching ? refetchDataCache : data?.events?.events ?? []}
          intitalTableState={tableState}
        />
      </ModulePage>
      {DeleteAlertDialog}
    </>
  );
};
export default Index;
