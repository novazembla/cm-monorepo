import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { termsQueryGQL, termDeleteMutationGQL } from "@culturemap/core";
import { useQuery } from "@apollo/client";
import { BeatLoader } from "react-spinners";

import {
  ModuleSubNav,
  ButtonListElement,
  ModulePage,
} from "~/components/modules";

import { moduleRootPath, multiLangFields } from "./moduleConfig";
import {
  useAdminTableDeleteButton,
  useAuthentication,
  useLocalStorage,
  useRouter,
} from "~/hooks";

import {
  AdminTable,
  AdminTableColumn,
  AdminTableState,
  adminTableCreateQueryVariables,
  adminTableCreateNewTableState,
  AdminTableActionCell,
  AdminTableMultiLangCell,
  MultiLangValue
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

const Terms = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [appUser] = useAuthentication();
  const [tableState, setTableState] = useLocalStorage(
    `${moduleRootPath}/Terms/${router.query.taxId}`,
    intitalTableState
  );

  const [isRefetching, setIsRefetching] = useState(false);

  const { loading, error, data, refetch } = useQuery(termsQueryGQL, {
    onCompleted: () => {
      setIsRefetching(false);
    },
    onError: () => {
      setIsRefetching(false);
    },
    notifyOnNetworkStatusChange: true,
    variables: {
      taxonomyId: parseInt(router.query.taxId, 10),
      ...adminTableCreateQueryVariables(tableState, filterColumnKeys, multiLangFields, config.activeLanguages),
    },
  });

  const [adminTableDeleteButtonOnClick, DeleteAlertDialog, isDeleteError] =
    useAdminTableDeleteButton(
      termDeleteMutationGQL,
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
      title: t("module.terms.title", "Taxonomies"),
    },
    {
      title: data && data.taxonomyRead ? <MultiLangValue json={data.taxonomyRead.name} /> : <BeatLoader size="10px" color="#666"/>,
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "back",
      to: moduleRootPath,
      label: t("module.button.back", "Go back"),
      userCan: "taxRead",
    },
    {
      type: "navigation",
      to: `${moduleRootPath}/${router.query.taxId}/create`,
      label: t("module.terms.button.create", "Add new term"),
      userCan: "userCreate",
    },
  ];

  // columns need to be a ref!
  const { current: AdminTableColumns } = useRef([
    {
      Header: t("terms.fields.label.id", "Id"),
      accessor: "id",
    } as AdminTableColumn,
    {
      Cell: AdminTableMultiLangCell,
      Header: t("terms.fields.label.name", "Name"),
      accessor: "name",
    } as AdminTableColumn,
    {
      Cell: AdminTableMultiLangCell,
      Header: t("terms.fields.label.slug", "Slug"),
      accessor: "slug",
    } as AdminTableColumn,
    {
      Cell: AdminTableActionCell,
      Header: t("terms.fields.label.actions", "Actions"),
      isStickyToTheRight: true,

      isCentered: true,
      appUser,

      showEdit: true,
      canEdit: (cell, appUser) => appUser?.can("taxUpdate"),
      editPath: `${moduleRootPath}/${router.query.taxId}/update/:id`,
      editButtonLabel: t("module.terms.button.edit", "Edit term"),
      // editButtonComponent: undefined,

      showDelete: true,
      canDelete: (cell, appUser) => appUser?.can("taxDelete"),

      deleteButtonLabel: t("module.terms.button.delete", "Delete term"),
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
      refetchDataCache = data?.terms?.terms ?? [];
      refetchTotalCount = data?.terms?.totalCount ?? 0;

      setIsRefetching(true);
      
      refetch(adminTableCreateQueryVariables(newTableState, filterColumnKeys, multiLangFields, config.activeLanguages));

      setTableState(newTableState);
    }

    return doRefetch;
  };

  const tableTotalCount = data?.terms?.totalCount ?? refetchTotalCount;

  const tablePageCount =
    tableTotalCount > 0
      ? Math.ceil(
          (data?.terms?.totalCount ?? refetchTotalCount) / tableState.pageSize
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
          data={isRefetching ? refetchDataCache : data?.terms?.terms ?? []}
          intitalTableState={tableState}
        />
      </ModulePage>
      {DeleteAlertDialog}
    </>
  );
};
export default Terms;
