import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  importsQueryGQL,
  importDeleteMutationGQL,
  ImportStatus,
} from "@culturemap/core";
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
} from "~/components/ui";
import { config } from "~/config";
import { SortingRule, Cell } from "react-table";

import { filterColumnKeys } from "./moduleConfig";

export const AdminTableImportStatusCell = (cell: Cell) => {
  const { t } = useTranslation();
  let color = "gray";
  let variant = "subtle";
  let label = t("publish.status.unknown", "Unknown");

  if (cell.value === ImportStatus.CREATED) {
    color = "orange";
    label = t("import.status.autodraft", "CSV DATA NEEDED");
  }

  if (cell.value === ImportStatus.ASSIGN) {
    color = "orange";
    label = t("import.status.forreview", "Assign columns");
  }

  if (
    cell.value === ImportStatus.PROCESS
  ) {
    color = "cyan";
    label = t("import.status.rejected", "Scheduled");
  }

  if (
    cell.value === ImportStatus.PROCESSING
  ) {
    color = "cyan";
    label = t("import.status.rejected", "Processing");
  }

  if (cell.value === ImportStatus.PROCESSED) {
    color = "green";
    label = t("import.status.published", "Processed");
  }

  if (
    cell.value === ImportStatus.ERROR ||
    cell.value === ImportStatus.DELETED
  ) {
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
  sortBy: [],
  filterKeyword: "",
};

let refetchDataCache: any[] = [];
let refetchTotalCount = 0;
let refetchPageIndex: number | undefined = undefined;

const Import = () => {
  const { t } = useTranslation();
  const [appUser] = useAuthentication();
  const [tableState, setTableState] = useLocalStorage(
    `${moduleRootPath}/Index`,
    intitalTableState
  );

  const [isRefetching, setIsRefetching] = useState(false);

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
      filterColumnKeys,
      multiLangFields,
      config.activeLanguages
    ),
  });

  const [adminTableDeleteButtonOnClick, DeleteAlertDialog, isDeleteError] =
    useDeleteByIdButton(
      importDeleteMutationGQL,
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
      title: t("module.locations.mneuitem.imports", "Imports"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.cancel", "Cancel"),
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
      Cell: AdminTableImportStatusCell,
      Header: t("table.label.status", "status"),
      accessor: "status",
    } as AdminTableColumn,
    {
      Cell: AdminTableMultiLangCell,
      Header: t("table.label.title", "title"),
      accessor: "title",
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
      canDelete: (cell, appUser) =>
        appUser?.can("locationDelete") ||
        (appUser.can("locationDeleteOwn") &&
          appUser.id === (cell?.row?.original as any)?.ownerId),

      deleteButtonLabel: t("module.locations.import.button.delete", "Delete import"),
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
      refetchDataCache = data?.imports?.imports ?? [];
      refetchTotalCount = data?.imports?.totalCount ?? 0;

      setIsRefetching(true);

      refetch(
        adminTableCreateQueryVariables(
          newTableState,
          filterColumnKeys,
          multiLangFields,
          config.activeLanguages
        )
      );

      setTableState(newTableState);
    }

    return doRefetch;
  };

  const tableTotalCount = data?.imports?.totalCount ?? refetchTotalCount;

  const tablePageCount =
    tableTotalCount > 0
      ? Math.ceil(
          (data?.imports?.totalCount ?? refetchTotalCount) / tableState.pageSize
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
          {...{
            tableTotalCount,
            tablePageCount,
            isRefetching,
            onFetchData,
            refetchPageIndex,
          }}
          data={isRefetching ? refetchDataCache : data?.imports?.imports ?? []}
          intitalTableState={tableState}
        />
      </ModulePage>
      {DeleteAlertDialog}
    </>
  );
};
export default Import;
