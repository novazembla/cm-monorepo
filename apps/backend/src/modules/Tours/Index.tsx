import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  toursQueryGQL,
  tourDeleteMutationGQL,
  PublishStatus,
} from "@culturemap/core";
import { useQuery } from "@apollo/client";
import { useForm, FormProvider } from "react-hook-form";

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
  AdminTablePublishStatusCell,
} from "~/components/ui";
import { config } from "~/config";
import { SortingRule } from "react-table";

const intitalTableState: AdminTableState = {
  pageIndex: 0,
  pageSize: config.defaultPageSize ?? 30,
  sortBy: [
    {
      id: "orderNumber",
      desc: false,
    },
  ],
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

  const resetFilter = useCallback(() => {
    reset({
      ...statusFilter.reduce((acc: any, s: PublishStatus) => {
        return {
          ...acc,
          [`filter_status_${s}`]: intitalTableState.statusFilter.includes(s),
        };
      }, {}),
      ...intitalTableState.taxFilter.reduce((acc: any, t: number) => {
        return {
          ...acc,
          [`tax_${t}`]: true,
        };
      }, {}),
      and: !!intitalTableState.and,
    });
  }, [reset]);

  const [isTableStateReset, setIsTableStateReset] = useState(false);
  useEffect(() => {
    if (previousRoute?.indexOf(moduleRootPath) === -1 && !isTableStateReset) {
      setTableState(intitalTableState);
      resetFilter();
      setIsTableStateReset(true);
    }
  }, [
    previousRoute,
    setTableState,
    setIsTableStateReset,
    isTableStateReset,
    resetFilter,
  ]);

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
      Cell: AdminTablePublishStatusCell,
      Header: t("table.label.status", "status"),
      accessor: "status",
    } as AdminTableColumn,
    {
      isNumeric: true,
      Header: t("table.label.orderNumber", "Order number"),
      accessor: "orderNumber",
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
        filterKeyword,
        getValues()
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
        <FormProvider {...formMethods}>
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <AdminTable
              columns={AdminTableColumns}
              isLoading={loading}
              showFilter={true}
              resetFilter={resetFilter}
              showKeywordSearch={true}
              statusFilter={statusFilter}
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
          </form>
        </FormProvider>
      </ModulePage>
      {DeleteAlertDialog}
    </>
  );
};
export default Index;
