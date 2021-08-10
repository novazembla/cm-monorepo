import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { pagesQueryGQL, pageDeleteMutationGQL } from "@culturemap/core";
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

const filterColumnKeys = ["name", "slug"];

const Index = () => {
  const { t } = useTranslation();
  const [appUser] = useAuthentication();
  const [tableState, setTableState] = useLocalStorage(
    `${moduleRootPath}/Index`,
    intitalTableState
  );

  const [isRefetching, setIsRefetching] = useState(false);
  
  const { loading, error, data, refetch } = useQuery(pagesQueryGQL, {
    onCompleted: () => {
      setIsRefetching(false);
    },
    onError: () => {
      setIsRefetching(false);
    },
    notifyOnNetworkStatusChange: true,
    variables: adminTableCreateQueryVariables(tableState, filterColumnKeys, multiLangFields, config.activeLanguages),
  });

  const [adminTableDeleteButtonOnClick, DeleteAlertDialog, isDeleteError] =
    useDeleteByIdButton(
      pageDeleteMutationGQL,
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
      title: t("module.pages.title", "Pages"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "navigation",
      to: `${moduleRootPath}/create`,
      label: t("module.pages.button.create", "Add new page"),
      userCan: "userCreate",
    },
  ];

  // columns need to be a ref!
  const { current: AdminTableColumns } = useRef([
    {
      Header: t("pages.fields.label.id", "Id"),
      accessor: "id",
    } as AdminTableColumn,
    {
      Cell: AdminTableMultiLangCell,
      Header: t("pages.fields.label.title", "title"),
      accessor: "title",
    } as AdminTableColumn,
    {
      Cell: AdminTableMultiLangCell,
      Header: t("pages.fields.label.slug", "Slug"),
      accessor: "slug",
    } as AdminTableColumn,
    {
      Cell: AdminTableActionCell,
      Header: t("pages.fields.label.actions", "Actions"),
      isStickyToTheRight: true,

      isCentered: true,
      appUser,

      showEdit: true,
      canEdit: (cell, appUser) =>
        appUser?.can("pageUpdate"),
      editPath: `${moduleRootPath}/update/:id`,
      editButtonLabel: t("module.pages.button.edit", "Edit page"),
      // editButtonComponent: undefined,

      showDelete: true,
      canDelete: (cell, appUser) => appUser?.can("pageDelete"),
        
      deleteButtonLabel: t("module.pages.button.delete", "Delete page"),
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
      refetchDataCache = data?.pages?.pages ?? [];
      refetchTotalCount = data?.pages?.totalCount ?? 0;

      setIsRefetching(true);

      refetch(adminTableCreateQueryVariables(newTableState, filterColumnKeys, multiLangFields, config.activeLanguages));

      setTableState(newTableState);
    }

    return doRefetch;
  };

  const tableTotalCount = data?.pages?.totalCount ?? refetchTotalCount;

  const tablePageCount =
    tableTotalCount > 0
      ? Math.ceil(
          (data?.pages?.totalCount ?? refetchTotalCount) / tableState.pageSize
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
          data={isRefetching ? refetchDataCache : data?.pages?.pages ?? []}
          intitalTableState={tableState}
        />
      </ModulePage>
      {DeleteAlertDialog}
    </>
  );
};
export default Index;
