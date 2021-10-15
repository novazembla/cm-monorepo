import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  taxonomiesQueryGQL,
  taxonomyDeleteMutationGQL,
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
  statusFilter: [],
  taxFilter: [],
  and: false,
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

  const [isTableStateReset, setIsTableStateReset] = useState(false);
  useEffect(() => {
    if (previousRoute?.indexOf(moduleRootPath) === -1 && !isTableStateReset) {
      setTableState(intitalTableState);
      setIsTableStateReset(true);
    }
  }, [previousRoute, setTableState, setIsTableStateReset, isTableStateReset]);

  const { loading, error, data, refetch } = useQuery(taxonomiesQueryGQL, {
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
      taxonomyDeleteMutationGQL,
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
      title: t("module.taxonomies.title", "Taxonomies"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "navigation",
      to: `${moduleRootPath}/create`,
      label: t("module.taxonomies.button.create", "Add new taxonomy"),
      userCan: "taxCreate",
    },
  ];

  // columns need to be a ref!
  const { current: AdminTableColumns } = useRef([
    {
      Header: t("tablae.label.id", "Id"),
      accessor: "id",
    } as AdminTableColumn,
    {
      Cell: AdminTableMultiLangCell,
      Header: t("tablae.label.name", "Name"),
      accessor: "name",
    } as AdminTableColumn,
    {
      Cell: AdminTableMultiLangCell,
      Header: t("tablae.label.slug", "Slug"),
      accessor: "slug",
    } as AdminTableColumn,
    {
      Header: t("taxonomies.fields.label.termCount", "Number of terms"),
      accessor: "termCount",
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
      canEdit: (cell, appUser) => appUser?.can("taxUpdate"),
      editPath: `${moduleRootPath}/update/:id`,
      editButtonLabel: t("module.taxonomies.button.edit", "Edit taxonomy"),
      // editButtonComponent: undefined,

      showView: true,
      canView: (cell, appUser) => appUser?.can("taxUpdate"),
      viewPath: `${moduleRootPath}/:id/terms`,
      viewButtonLabel: t(
        "module.taxonomies.button.view",
        "View taxonomy terms"
      ),
      // viewButtonComponent: undefined,

      showDelete: true,
      canDelete: (cell, appUser) => {
        return (
          appUser?.can("taxDelete") && (cell as any).row.values.termCount === 0
        );
      },

      deleteButtonLabel: t(
        "module.taxonomies.button.delete",
        "Delete taxonomy"
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
      refetchDataCache = data?.taxonomies?.taxonomies ?? [];
      refetchTotalCount = data?.taxonomies?.totalCount ?? 0;

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

  const tableTotalCount = data?.taxonomies?.totalCount ?? refetchTotalCount;

  const tablePageCount =
    tableTotalCount > 0
      ? Math.ceil(
          (data?.taxonomies?.totalCount ?? refetchTotalCount) /
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
          showKeywordSearch={true}
          {...{
            tableTotalCount,
            tablePageCount,
            isRefetching,
            onFetchData,
            refetchPageIndex,
          }}
          data={
            isRefetching ? refetchDataCache : data?.taxonomies?.taxonomies ?? []
          }
          intitalTableState={tableState}
        />
      </ModulePage>
      {DeleteAlertDialog}
    </>
  );
};
export default Index;
