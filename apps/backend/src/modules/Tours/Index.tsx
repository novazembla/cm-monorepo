import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toursQueryGQL, tourDeleteMutationGQL } from "@culturemap/core";
import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ButtonListElement,
  ModulePage,
} from "~/components/modules";

import { moduleRootPath, multiLangFieldsTour } from "./moduleConfig";
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

  const { loading, error, data, refetch } = useQuery(toursQueryGQL, {
    onCompleted: () => {
      setIsRefetching(false);
    },
    onError: () => {
      setIsRefetching(false);
    },
    notifyOnNetworkStatusChange: true,
    variables: adminTableCreateQueryVariables(
      tableState,
      multiLangFieldsTour,
      i18n.language,
      config.activeLanguages
    ),
  });

  const [adminTableDeleteButtonOnClick, DeleteAlertDialog, isDeleteError] =
    useDeleteByIdButton(
      tourDeleteMutationGQL,
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
      title: t("module.tours.title", "Tours"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "navigation",
      to: `${moduleRootPath}/create`,
      label: t("module.tours.button.create", "Add new tour"),
      userCan: "tourCreate",
    },
  ];

  // columns need to be a ref!
  const { current: AdminTableColumns } = useRef([
    {
      Header: t("table.label.id", "Id"),
      accessor: "id",
    } as AdminTableColumn,
    {
      Cell: AdminTableMultiLangCell,
      Header: t("table.label.title", "Title"),
      accessor: "title",
    } as AdminTableColumn,
    {
      Header: t("tours.fields.label.tourStopCount", "Tour Stops"),
      accessor: "tourStopCount",
      isNumeric: true,
      disableSortBy: true,
    } as AdminTableColumn,
    {
      Cell: AdminTableActionCell,
      Header: t("table.label.actions", "Actions"),
      isStickyToTheRight: true,

      isCentered: true,
      appUser,

      showEdit: true,
      canEdit: (cell, appUser) =>
        appUser?.can("tourUpdate") ||
        (appUser.can("tourUpdateOwn") &&
          appUser.id === (cell?.row?.original as any)?.ownerId),
      editPath: `${moduleRootPath}/update/:id`,
      editButtonLabel: t("module.tours.button.edit", "Edit tour"),
      // editButtonComponent: undefined,

      showDelete: true,
      canDelete: (cell, appUser) => {
        return (
          (appUser?.can("tourDelete") ||
            (appUser.can("tourDeleteOwn") &&
              appUser.id === (cell?.row?.original as any)?.ownerId)) &&
          (cell as any).row.values.tourStopCount === 0
        );
      },

      deleteButtonLabel: t("module.tours.button.delete", "Delete tour"),
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
      refetchDataCache = data?.tours?.tours ?? [];
      refetchTotalCount = data?.tours?.totalCount ?? 0;

      setIsRefetching(true);

      refetch(
        adminTableCreateQueryVariables(
          newTableState,
          multiLangFieldsTour,
          i18n.language,
          config.activeLanguages
        )
      );

      setTableState(newTableState);
    }

    return doRefetch;
  };

  const tableTotalCount = data?.tours?.totalCount ?? refetchTotalCount;

  const tablePageCount =
    tableTotalCount > 0
      ? Math.ceil(
          (data?.tours?.totalCount ?? refetchTotalCount) / tableState.pageSize
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
          data={isRefetching ? refetchDataCache : data?.tours?.tours ?? []}
          intitalTableState={tableState}
        />
      </ModulePage>
      {DeleteAlertDialog}
    </>
  );
};
export default Index;
