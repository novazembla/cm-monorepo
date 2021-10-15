// TODO: visibility
//

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { locationDeleteMutationGQL, PublishStatus } from "@culturemap/core";
import { useQuery, gql } from "@apollo/client";
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
  AdminTableDateCell,
} from "~/components/ui";
import { config } from "~/config";
import { SortingRule } from "react-table";

export const locationsQueryGQL = gql`
  query locations(
    $where: JSON
    $orderBy: JSON
    $pageIndex: Int
    $pageSize: Int
  ) {
    locations(
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      locations {
        id
        ownerId
        title
        slug
        status
        description
        updatedAt
      }
      totalCount
    }
    moduleTaxonomies(key: "location") {
      id
      name
      slug
      isRequired
      collectPrimaryTerm
      terms {
        id
        slug
        name
      }
    }
  }
`;

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

const statusFilter = [
  PublishStatus.DRAFT,
  PublishStatus.FORREVIEW,
  PublishStatus.IMPORTED,
  PublishStatus.IMPORTEDWARNINGS,
  PublishStatus.PUBLISHED,
  PublishStatus.REJECTED,
  PublishStatus.TRASHED,
];

const Index = () => {
  const { t, i18n } = useTranslation();

  const [appUser] = useAuthentication();
  const [tableState, setTableState] = useLocalStorage(
    `${moduleRootPath}/Index`,
    intitalTableState
  );

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

  const [isRefetching, setIsRefetching] = useState(false);

  const { loading, error, data, refetch } = useQuery(locationsQueryGQL, {
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
      locationDeleteMutationGQL,
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
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "navigation",
      to: `${moduleRootPath}/create`,
      label: t("module.locations.button.create", "Add new location"),
      userCan: "locationCreate",
    },
    {
      type: "navigation",
      to: `${moduleRootPath}/import`,
      label: t("module.locations.menuitem.imports", "Imports"),
      userCan: "locationCreate",
    },
  ];

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
        appUser?.can("locationUpdate") ||
        (appUser.can("locationUpdateOwn") &&
          appUser.id === (cell?.row?.original as any)?.ownerId),
      editPath: `${moduleRootPath}/update/:id`,
      editButtonLabel: t("module.locations.button.edit", "Edit location"),
      // editButtonComponent: undefined,

      showDelete: true,
      canDelete: (cell, appUser) =>
        appUser?.can("locationDelete") ||
        (appUser.can("locationDeleteOwn") &&
          appUser.id === (cell?.row?.original as any)?.ownerId),

      deleteButtonLabel: t("module.locations.button.delete", "Delete location"),
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
      refetchDataCache = data?.locations?.locations ?? [];
      refetchTotalCount = data?.locations?.totalCount ?? 0;

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

  const tableTotalCount = data?.locations?.totalCount ?? refetchTotalCount;

  const tablePageCount =
    tableTotalCount > 0
      ? Math.ceil(
          (data?.locations?.totalCount ?? refetchTotalCount) /
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
              showKeywordSearch={true}
              {...{
                tableTotalCount,
                tablePageCount,
                isRefetching,
                onFetchData,
                refetchPageIndex,
              }}
              statusFilter={statusFilter}
              data={
                isRefetching
                  ? refetchDataCache
                  : data?.locations?.locations ?? []
              }
              taxonomies={data}
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
