import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { usersQueryGQL, userDeleteMutationGQL } from "@culturemap/core";
import { useQuery } from "@apollo/client";
import { Badge } from "@chakra-ui/react";

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

import {
  AdminTable,
  AdminTableColumn,
  AdminTableState,
  adminTableCreateQueryVariables,
  adminTableCreateNewTableState,
  AdminTableActionCell,
} from "~/components/ui";
import { config } from "~/config";
import { SortingRule } from "react-table";

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

const Index = () => {
  const { t } = useTranslation();
  const [appUser] = useAuthentication();
  const [tableState, setTableState] = useLocalStorage(
    `table${moduleRootPath}/Index`,
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

  const { loading, error, data, refetch } = useQuery(usersQueryGQL, {
    onCompleted: () => {
      setIsRefetching(false);
    },
    onError: () => {
      setIsRefetching(false);
    },
    notifyOnNetworkStatusChange: true,
    variables: adminTableCreateQueryVariables(tableState),
  });

  const [adminTableDeleteButtonOnClick, DeleteAlertDialog, isDeleteError] =
    useDeleteByIdButton(
      userDeleteMutationGQL,
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
      title: t("module.users.title", "Users"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "navigation",
      to: "/users/create",
      label: t("module.users.button.create", "Add user"),
      userCan: "userCreate",
    },
  ];

  // columns need to be a ref!
  const { current: AdminTableColumns } = useRef([
    {
      Header: t("table.label.id", "Id"),
      accessor: "id",
    } as AdminTableColumn,
    {
      Header: t("users.fields.label.firstName", "First Name"),
      accessor: "firstName",
    } as AdminTableColumn,
    {
      Header: t("users.fields.label.lastName", "Last name"),
      accessor: "lastName",
    } as AdminTableColumn,
    {
      Header: t("users.fields.label.email", "Email"),
      accessor: "email",
    } as AdminTableColumn,
    {
      Header: t("users.fields.label.email verified", "Email verified"),
      accessor: "emailVerified",
      Cell: (cell) => {
        const color = cell.value ? "green" : "orange";
        const text = cell.value
          ? t("users.field.emailverification.verified", "Verified")
          : t("users.field.emailverification.notverified", "Not verified");
        return (
          <Badge
            minW="8rem"
            variant="subtle"
            textAlign="center"
            colorScheme={color}
            p="2"
            borderRadius="lg"
          >
            {text}
          </Badge>
        );
      },
    } as AdminTableColumn,
    {
      Header: t("users.fields.label.role", "Role"),
      accessor: "role",
      Cell: (cell) => {
        let color = "gray";
        let value = cell.value;
        const variant = "subtle";

        switch (cell.value) {
          case "administrator":
            color = "green";
            break;
          case "editor":
            color = "orange";
            break;
          case "contributor":
            color = "blue";
            break;
        }

        if ((cell.row.original as any).userBanned) {
          color = "red";
          value = "Banned";
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
            {value}
          </Badge>
        );
      },
    } as AdminTableColumn,
    {
      Cell: AdminTableActionCell,
      Header: t("table.label.actions", "Actions"),
      isStickyToTheRight: true,

      isCentered: true,
      showEdit: true,

      canEdit: (cell, appUser) =>
        appUser?.can("userUpdate") && appUser?.has(cell.row.values.role),
      editPath: `${moduleRootPath}/update/:id`,
      editButtonLabel: t("module.users.button.edit", "Edit user"),
      // editButtonComponent: undefined,
      appUser,
      showDelete: true,
      canDelete: (cell, appUser) => {
        return (
          appUser?.can("userDelete") &&
          appUser?.has(cell.row.values.role) &&
          appUser.id !== cell.row.values.id
        );
      },

      deleteButtonLabel: t("module.users.button.delete", "Delete user"),
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
      refetchDataCache = data?.users?.users ?? [];
      refetchTotalCount = data?.users?.totalCount ?? 0;

      setIsRefetching(true);

      refetch(adminTableCreateQueryVariables(newTableState));

      setTableState(newTableState);
    }

    return doRefetch;
  };

  const tableTotalCount = data?.users?.totalCount ?? refetchTotalCount;

  const tablePageCount =
    tableTotalCount > 0
      ? Math.ceil(
          (data?.users?.totalCount ?? refetchTotalCount) / tableState.pageSize
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
          data={isRefetching ? refetchDataCache : data?.users?.users ?? []}
          intitalTableState={tableState}
        />
      </ModulePage>
      {DeleteAlertDialog}
    </>
  );
};
export default Index;
