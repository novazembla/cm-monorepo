import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usersQueryGQL } from "@culturemap/core";
import { useQuery } from "@apollo/client";
import { Badge } from "@chakra-ui/react";

import {
  ModuleSubNav,
  ButtonListElement,
  ModulePage,
} from "~/components/modules";

import { DangerZoneAlertDialog } from "~/components/ui";

import { moduleRootPath } from "./moduleConfig";
import { useAuthentication, useLocalStorage, useSuccessfullyDeletedToast } from "~/hooks";
import { useUserDeleteMutation } from "./hooks";

import {
  AdminTable,
  AdminTableColumn,
  AdminTableState,
  AdminTableQueryVariables,
  AdminTableQueryStats,
  AdminTableActionCell,
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

const Index = () => {
  const [appUser] = useAuthentication();
  const [tableState, setTableState] = useLocalStorage(
    `table${moduleRootPath}`,
    intitalTableState
  );

  const [dZAD, setDZAD] = useState({
    open: false,
    id: undefined,
  });

  const [deleteMutation, deleteMutationResults] = useUserDeleteMutation();
  const successfullyDeletedToast = useSuccessfullyDeletedToast();
  const [isRefetching, setIsRefetching] = useState(false);

  const { t } = useTranslation();
  const { loading, error, data, refetch } = useQuery(usersQueryGQL, {
    onCompleted: () => {
      setIsRefetching(false);
    },
    onError: () => {
      setIsRefetching(false);
    },
    notifyOnNetworkStatusChange: true,
    variables: {
      pageIndex: tableState.pageIndex,
      pageSize: tableState.pageSize,
    },
  });

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

  const AdminTableColumns = [
    {
      Header: t("users.fields.label.id", "Id"),
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
        const { t } = useTranslation();
        const color = cell.value ? "green" : "orange";
        const text = cell.value
          ? t("users.field.emailverification.verified", "Verified")
          : t("users.field.emailverification.notverified", "Not verified");
        return (
          <Badge
            w="120px"
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
        let variant = "subtle";

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
            w="120px"
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
      Header: t("users.fields.label.actions", "Actions"),
      isCentered: true,
      showEdit: true,
      canEdit: (cell, appUser) =>
        appUser?.can("userUpdate") && appUser?.has(cell.row.values.role),
      editPath: `${moduleRootPath}/update/:id`,
      editButtonLabel: t("module.users.button.edit", "Edit user"),
      // editButtonComponent: undefined,
      appUser,
      showDelete: true,
      canDelete: (cell, appUser) =>
        appUser?.can("userDelete") &&
        appUser?.has(cell.row.values.role) &&
        appUser.id !== cell.row.values.id,
      deleteButtonLabel: t("module.users.button.delete", "Delete user"),
      // deleteButtonComponent?: React.FC<any>;
      deleteButtonOnClick: (cell) => {
        setDZAD({
          open: true,
          id: cell.row.values.id,
        });
      },
    } as AdminTableColumn,
  ];

  const onFetchData = (
    pageIndex: number,
    pageSize: number,
    sortBy: SortingRule<Object>[],
    filterKeyword: string
  ) => {
    console.log(pageIndex, pageSize, sortBy, filterKeyword);

    let newTableState = {
      ...tableState,
      filterKeyword,
    };

    let variables: AdminTableQueryVariables = {
      pageSize: tableState.pageSize,
      pageIndex: tableState.pageIndex,
      orderBy: undefined,
      where: undefined,
    };

    let doRefetch = false;

    if (
      (!sortBy || (Array.isArray(sortBy) && sortBy.length === 0)) &&
      tableState.sortBy.length > 0
    ) {
      newTableState = {
        ...newTableState,
        sortBy: [],
      };
      doRefetch = true;
    }

    if (Array.isArray(sortBy) && sortBy.length > 0) {
      if (
        tableState.sortBy.length === 0 ||
        tableState?.sortBy[0]?.id !== sortBy[0].id ||
        tableState?.sortBy[0]?.desc !== sortBy[0].desc
      ) {
        variables = {
          ...variables,
          orderBy: {
            [sortBy[0].id]: sortBy[0].desc ? "desc" : "asc",
          },
        };
        newTableState = {
          ...newTableState,
          sortBy: [sortBy[0]],
        };
        doRefetch = true;
      }
    }

    let newPageIndex = pageIndex;

    if (tableState.pageSize !== pageSize) {
      variables = {
        ...variables,
        pageSize,
      };
      newTableState = {
        ...newTableState,
        pageSize,
      };
      newPageIndex = 0;
      doRefetch = true;
    }

    if (!filterKeyword || filterKeyword.length < 3) {
      // we need to clear the where clause
      if (tableState.filterKeyword.length >= 3) {
        doRefetch = true;
        newPageIndex = 0;
      }
    } else {
      // a change happened ensure that the refetch is being triggerd
      if (tableState.filterKeyword !== filterKeyword) {
        doRefetch = true;
        newPageIndex = 0;
      }

      // however in any case we need to set the where clause
      variables = {
        ...variables,
        where: {
          OR: [
            {
              firstName: {
                contains: filterKeyword,
              },
            },
            {
              lastName: {
                contains: filterKeyword,
              },
            },
            {
              email: {
                contains: filterKeyword,
              },
            },
          ],
        },
      };
    }

    console.log(newPageIndex);

    if (tableState.pageIndex !== newPageIndex) {
      variables = {
        ...variables,
        pageIndex: newPageIndex,
      };
      newTableState = {
        ...newTableState,
        pageIndex: newPageIndex,
      };
      doRefetch = true;
    }

    if (doRefetch) {
      console.log("Refetch", newTableState);

      refetchDataCache = data?.users?.users ?? [];

      setIsRefetching(true);

      refetch(variables);

      setTableState(newTableState);
    }

    return doRefetch;
  };

  const queryStats: AdminTableQueryStats = {
    total: data?.users?.totalCount ?? 0,
    pageCount:
      (data?.users?.totalCount ?? 0) > 0
        ? Math.ceil((data?.users?.totalCount ?? 0) / tableState.pageSize)
        : 0,
  };

  const onDeleteNo = () => {
    setDZAD({
      open: false,
      id: undefined,
    });
  };

  const onDeleteYes = async () => {
    try {
      if (appUser) {
        const { errors } = await deleteMutation(dZAD.id ?? 0);

        if (!errors) {
          refetch(tableState);
          successfullyDeletedToast();
          setDZAD({
            open: false,
            id: undefined,
          });
        } else {
          // TODO: setIsFormError(true);
        }
      } else {
        // TODO: setIsFormError(true);
      }
    } catch (err) {
      // TODO: setIsFormError(true);
    }

  };
  return (
    <>
      <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
      <ModulePage isLoading={loading && !isRefetching} isError={!!error}>
        <AdminTable
          columns={AdminTableColumns}
          isLoading={loading || isRefetching}
          queryStats={queryStats}
          data={isRefetching ? refetchDataCache : data?.users?.users ?? []}
          intitalTableState={tableState}
          onFetchData={onFetchData}
        />
      </ModulePage>
      <DangerZoneAlertDialog
        title={t(
          "module.users.deletealter.title",
          "Please confirm"
        )}
        message={t(
          "module.users.deletealter.message",
          "Do you really want to delete the user? Once done we cannot revert this action!"
        )}
        requireTextualConfirmation={true}
        isOpen={dZAD.open}
        onNo={onDeleteNo}
        onYes={onDeleteYes}
      />
    </>
  );
};
export default Index;
