import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  importsQueryGQL,
  dataImportDeleteMutationGQL,
  DataImportStatus,
} from "@culturemap/core";
import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ButtonListElement,
  ModulePage,
} from "~/components/modules";

import {
  moduleRootPath,
  dataImportExportType,
} from "./moduleConfig";
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
  AdminTableDateCell,
  AdminTableWarningsCountCell,
  AdminTableErrorsCountCell,
} from "~/components/ui";
import { config } from "~/config";
import { SortingRule, Cell } from "react-table";

export const AdminTableDataImportStatusCell = (cell: Cell) => {
  const { t } = useTranslation();
  let color = "gray";
  const variant = "subtle";
  let label = t("publish.status.unknown", "Unknown");

  if (cell.value === DataImportStatus.CREATED) {
    color = "orange";
    label = t("import.status.autodraft", "CSV DATA NEEDED");
  }

  if (cell.value === DataImportStatus.ASSIGN) {
    color = "orange";
    label = t("import.status.forreview", "Assign columns");
  }

  if (cell.value === DataImportStatus.PROCESS) {
    color = "cyan";
    label = t("import.status.scheduled", "Scheduled");
  }

  if (cell.value === DataImportStatus.PROCESSING) {
    color = "cyan";
    label = t("import.status.processing", "Processing");
  }

  if (cell.value === DataImportStatus.PROCESSED) {
    color = "green";
    label = t("import.status.published", "Processed");
  }

  if (cell.value === DataImportStatus.ERROR) {
    color = "red";
    label = t("import.status.error", "Error");
  }

  if (cell.value === DataImportStatus.DELETED) {
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

const Import = () => {
  const { t, i18n } = useTranslation();
  const [appUser] = useAuthentication();
  const [tableState, setTableState] = useLocalStorage(
    `${moduleRootPath}/Import`,
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
  const { loading, error, data, refetch } = useQuery(importsQueryGQL, {
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
        type: dataImportExportType,
      }
    ),
  });

  const [adminTableDeleteButtonOnClick, DeleteAlertDialog, isDeleteError] =
    useDeleteByIdButton(
      dataImportDeleteMutationGQL,
      () => {
        refetch(tableState);
      },
      {
        requireTextualConfirmation: true,
        additionalDeleteData: {
          type: dataImportExportType,
        },
      }
    );

  const breadcrumb = [
    {
      path: moduleRootPath,
      title: t("module.locations.title", "Locations"),
    },
    {
      title: t("module.locations.menuitem.imports", "Imports"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.back", "Go back"),
      userCan: "locationRead",
    },
    {
      type: "navigation",
      to: `${moduleRootPath}/import/create`,
      label: t("module.locations.import.button.create", "New import"),
      userCan: "locationCreate",
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
      Cell: AdminTableDataImportStatusCell,
      Header: t("table.label.status", "status"),
      accessor: "status",
    } as AdminTableColumn,
    {
      Header: t("table.label.title", "Title"),
      accessor: "title",
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

      showEdit: true,
      canEdit: (cell, appUser) => appUser?.can("locationUpdate"),
      editPath: `${moduleRootPath}/import/:id`,
      editButtonLabel: t("module.locations.import.button.edit", "Edit import"),
      // editButtonComponent: undefined,

      showDelete: true,
      canDelete: (cell, appUser) => {
        return (
          (appUser?.can("locationDelete") ||
            (appUser.can("locationDeleteOwn") &&
              appUser.id === (cell?.row?.original as any)?.ownerId)) &&
          (cell?.row?.original as any).status !== DataImportStatus.PROCESSING
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
    sortBy: SortingRule<Record<string, unknown>>[],
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
      refetchDataCache = data?.dataImports?.dataImports ?? [];
      refetchTotalCount = data?.dataImports?.totalCount ?? 0;

      setIsRefetching(true);

      refetch(
        adminTableCreateQueryVariables(
          newTableState,
          [],
          i18n.language,
          config.activeLanguages,
          {
            type: dataImportExportType,
          }
        )
      );

      setTableState(newTableState);
    }

    return doRefetch;
  };

  const tableTotalCount = data?.dataImports?.totalCount ?? refetchTotalCount;

  const tablePageCount =
    tableTotalCount > 0
      ? Math.ceil(
          (data?.dataImports?.totalCount ?? refetchTotalCount) /
            tableState.pageSize
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
          data={
            isRefetching
              ? refetchDataCache
              : data?.dataImports?.dataImports ?? []
          }
          intitalTableState={tableState}
        />
      </ModulePage>
      {DeleteAlertDialog}
    </>
  );
};
export default Import;
