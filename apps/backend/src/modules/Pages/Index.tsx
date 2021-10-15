import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { pagesQueryGQL, pageDeleteMutationGQL, PublishStatus} from "@culturemap/core";
import { useQuery } from "@apollo/client";
import { useForm, FormProvider } from "react-hook-form";

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

const statusFilter = [
  PublishStatus.DRAFT,
  PublishStatus.FORREVIEW,
  PublishStatus.PUBLISHED,
  PublishStatus.REJECTED,
  PublishStatus.TRASHED,
];

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

  const previousRoute = useTypedSelector(
    ({ router }) => router.router.previous
  );

  const formMethods = useForm<any>({
    mode: "onTouched",
    defaultValues: {
      ...tableState.statusFilter.reduce((acc: any, s: PublishStatus) => {
        return {
          ...acc,
          [`filter_status_${s}`]: true,
        };
      }, {}),
      ...tableState.taxFilter.reduce((acc: any, t: number) => {
        return {
          ...acc,
          [`tax_${t}`]: true,
        };
      }, {}),
      and: !!tableState.and,
    },
  });

  const { getValues, reset } = formMethods;

  const [isTableStateReset, setIsTableStateReset] = useState(false);
  useEffect(() => {
    if (previousRoute?.indexOf(moduleRootPath) === -1 && !isTableStateReset) {
      setTableState(intitalTableState);
      reset({
        ...intitalTableState.statusFilter.reduce(
          (acc: any, s: PublishStatus) => {
            return {
              ...acc,
              [`filter_status_${s}`]: true,
            };
          },
          {}
        ),
        ...intitalTableState.taxFilter.reduce((acc: any, t: number) => {
          return {
            ...acc,
            [`tax_${t}`]: true,
          };
        }, {}),
        and: !!intitalTableState.and,
      });
      setIsTableStateReset(true);
    }
  }, [
    previousRoute,
    setTableState,
    setIsTableStateReset,
    isTableStateReset,
    reset,
  ]);

  const { loading, error, data, refetch } = useQuery(pagesQueryGQL, {
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
      userCan: "pageCreate",
    },
  ];

  // columns need to be a ref!
  const { current: AdminTableColumns } = useRef([
    {
      Header: t("table.label.id", "Id"),
      accessor: "id",
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
        appUser?.can("pageUpdate") ||
        (appUser.can("pageUpdateOwn") &&
          appUser.id === (cell?.row?.original as any)?.ownerId),
      editPath: `${moduleRootPath}/update/:id`,
      editButtonLabel: t("module.pages.button.edit", "Edit page"),
      // editButtonComponent: undefined,

      showDelete: true,
      canDelete: (cell, appUser) =>
        appUser?.can("pageDelete") ||
        (appUser.can("pageDeleteOwn") &&
          appUser.id === (cell?.row?.original as any)?.ownerId),

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
        filterKeyword,
        getValues()
      );

    if (doRefetch) {
      refetchPageIndex = pageIndex !== newPageIndex ? newPageIndex : undefined;
      refetchDataCache = data?.pages?.pages ?? [];
      refetchTotalCount = data?.pages?.totalCount ?? 0;

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
        <FormProvider {...formMethods}>
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
            }}
          ><AdminTable
          columns={AdminTableColumns}
          isLoading={loading}
          showFilter={true}
          statusFilter={statusFilter}
          showKeywordSearch={true}
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
        </form>
        </FormProvider>
      </ModulePage>
      {DeleteAlertDialog}
    </>
  );
};
export default Index;
