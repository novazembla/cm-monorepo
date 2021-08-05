import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { usersQueryGQL } from "@culturemap/core";
import { useQuery } from "@apollo/client";

import {
  ModuleSubNav,
  ButtonListElement,
  ModulePage,
} from "~/components/modules";

import { moduleRootPath } from "./moduleConfig";
import { useLocalStorage } from "~/hooks";

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
  const [tableState, setTableState] = useLocalStorage(
    `table${moduleRootPath}`,
    intitalTableState
  );

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
    {
      type: "navigation",
      to: "/users/update/123",
      label: t("module.users.button.update", "Edit user"),
      userCan: "userUpdate",
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
      isNumeric: true,
    } as AdminTableColumn,
    {
      Header: t("users.fields.label.role", "Role"),
      accessor: "role",
    } as AdminTableColumn,
    {
      Cell: AdminTableActionCell,
      Header: t("users.fields.label.actions", "Actions"),
      isCentered: true,
      showEdit: true,
      allowEdit: true,
      editPath: `${moduleRootPath}/edit/:id`,
      editButtonLabel: t("module.users.button.edit", "Edit user"),
      // editButtonComponent: undefined,

      showDelete: true,
      allowDelete: true,
      deleteButtonLabel: t("module.users.button.delete", "Delete user"),
      // deleteButtonComponent?: React.FC<any>;
      deleteButtonOnClick: () => {console.log("delete")},
      
    } as AdminTableColumn,
  ];

  const onFetchData = (
    pageIndex: number,
    pageSize: number,
    sortBy: SortingRule<Object>[],
    filterKeyword: string
  ) => {
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

    if (tableState.pageIndex !== pageIndex) {
      variables = {
        ...variables,
        pageIndex,
      };
      newTableState = {
        ...newTableState,
        pageIndex,
      };
      doRefetch = true;
    }

    if (tableState.pageSize !== pageSize) {
      variables = {
        ...variables,
        pageSize,
      };
      newTableState = {
        ...newTableState,
        pageSize,
      };
      doRefetch = true;
    }

    if (!filterKeyword || filterKeyword.length < 3) {
      // we need to clear the where clause
      if (tableState.filterKeyword.length >= 3) doRefetch = true;
    } else {
      // a change happened ensure that the refetch is being triggerd
      if (tableState.filterKeyword !== filterKeyword) doRefetch = true;

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

    if (tableState.filterKeyword !== filterKeyword) {
      if (filterKeyword) {
        if (filterKeyword.length > 3) {
        }
      } else if (tableState.filterKeyword.length > 3) {
        doRefetch = true;
      }

      if (
        (filterKeyword && filterKeyword.length > 3) ||
        (tableState.filterKeyword.length > 3 &&
          (!filterKeyword || filterKeyword.length < 3))
      ) {
      }
    }
    if (filterKeyword && filterKeyword.length > 3) {
    } else {
    }

    if (doRefetch) {
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
    </>
  );
};
export default Index;
