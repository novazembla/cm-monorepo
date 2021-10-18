import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  dataExportsQueryGQL,
  dataExportDeleteMutationGQL,
  ExportStatus,
} from "@culturemap/core";
import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ButtonListElement,
  ModulePage,
} from "~/components/modules";

import { moduleRootPath } from "./moduleConfig";
import {
  useDeleteByIdButton,
  useAuthentication,
  useLocalStorage,
  useTypedSelector,
} from "~/hooks";

import { Badge } from "@chakra-ui/react";

import {
  AdminTable,
  AdminTableColumn,
  AdminTableState,
  adminTableCreateQueryVariables,
  adminTableCreateNewTableState,
  AdminTableActionCell,
  AdminTableMultiLangCell,
  AdminTableDateCell,
} from "~/components/ui";
import { config } from "~/config";
import { SortingRule, Cell } from "react-table";

export const AdminTableExportStatusCell = (cell: Cell) => {
  const { t } = useTranslation();
  let color = "gray";
  let variant = "subtle";
  let label = t("publish.status.unknown", "Unknown");

  if (cell.value === ExportStatus.CREATED) {
    color = "orange";
    label = t("import.status.created", "Created");
  }

  if (cell.value === ExportStatus.PROCESS) {
    color = "cyan";
    label = t("import.status.scheduled", "Scheduled");
  }

  if (cell.value === ExportStatus.PROCESSING) {
    color = "cyan";
    label = t("import.status.processing", "Processing");
  }

  if (cell.value === ExportStatus.PROCESSED) {
    color = "green";
    label = t("import.status.published", "Processed");
  }

  if (cell.value === ExportStatus.ERROR) {
    color = "red";
    label = t("import.status.error", "Error");
  }

  if (cell.value === ExportStatus.DELETED) {
    color = "red";
    label = t("import.status.trashed", "Trashed");
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

const intitalTableState: AdminTableState = {
  pageIndex: 0,
  pageSize: config.defaultPageSize ?? 30,
  sortBy: [
    {
      id: "updatedAt",
      desc: true,
    },
  ],
  filterKeyword: "",
  statusFilter: [],
  taxFilter: [],
  and: false,
};

let refetchDataCache: any[] = [];
let refetchTotalCount = 0;
let refetchPageIndex: number | undefined = undefined;

const DataExports = () => {
  const { t, i18n } = useTranslation();
  const [appUser] = useAuthentication();
  const [tableState, setTableState] = useLocalStorage(
    `${moduleRootPath}/DataExport`,
    intitalTableState
  );

  const [isRefetching, setIsRefetching] = useState(false);

  const previousRoute = useTypedSelector(
    ({ router }) => router.router.previous
  );

  const [isTableStateReset, setIsTableStateReset] = useState(false);
  useEffect(() => {
    if (previousRoute?.indexOf(moduleRootPath) === -1 && !isTableStateReset) {
      setTableState(intitalTableState);
      setIsTableStateReset(true);
    }
  }, [previousRoute, setTableState, setIsTableStateReset, isTableStateReset]);
  const { loading, error, data, refetch } = useQuery(dataExportsQueryGQL, {
    onCompleted: () => {
      setIsRefetching(false);
    },
    onError: () => {
      setIsRefetching(false);
    },
    notifyOnNetworkStatusChange: true,
    variables: adminTableCreateQueryVariables(
      tableState,
      [],
      i18n.language,
      config.activeLanguages,
      {
        type: "event"
      }
    ),
  });

  const [adminTableDeleteButtonOnClick, DeleteAlertDialog, isDeleteError] =
    useDeleteByIdButton(
      dataExportDeleteMutationGQL,
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
      title: t("module.locations.title", "Locations"),
    },
    {
      title: t("module.locations.menuitem.dataExports", "Exports"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.back", "Go back"),
      userCan: "locationRead",
    }
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
      Cell: AdminTableExportStatusCell,
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

      showView: true,
      canView: (cell, appUser) => (appUser?.can("locationUpdate") ||
      (appUser.can("locationUpdateOwn") &&
        appUser.id === (cell?.row?.original as any)?.ownerId)),
      viewPath: `${moduleRootPath}/export/:id`,
      viewButtonLabel: t("module.locations.exports.button.view", "View import"),
      
      showDelete: true,
      canDelete: (cell, appUser) => {
        return (
          (appUser?.can("locationDelete") ||
            (appUser.can("locationDeleteOwn") &&
              appUser.id === (cell?.row?.original as any)?.ownerId)) &&
          (cell?.row?.original as any).status !== ExportStatus.PROCESSING
        );
      },

      deleteButtonLabel: t(
        "module.locations.import.button.delete",
        "Delete import"
      ),
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
      refetchDataCache = data?.dataExports?.dataExports ?? [];
      refetchTotalCount = data?.dataExports?.totalCount ?? 0;

      setIsRefetching(true);

      refetch(
        adminTableCreateQueryVariables(
          newTableState,
          [],
          i18n.language,
          config.activeLanguages,
          {
            type: "location"
          }
        )
      );

      setTableState(newTableState);
    }

    return doRefetch;
  };

  const tableTotalCount = data?.dataExports?.totalCount ?? refetchTotalCount;

  const tablePageCount =
    tableTotalCount > 0
      ? Math.ceil(
          (data?.dataExports?.totalCount ?? refetchTotalCount) / tableState.pageSize
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
          showFilter={false}
          showKeywordSearch={false}
          {...{
            tableTotalCount,
            tablePageCount,
            isRefetching,
            onFetchData,
            refetchPageIndex,
          }}
          data={isRefetching ? refetchDataCache : data?.dataExports?.dataExports ?? []}
          intitalTableState={tableState}
        />
      </ModulePage>
      {DeleteAlertDialog}
    </>
  );
};
export default DataExports;
