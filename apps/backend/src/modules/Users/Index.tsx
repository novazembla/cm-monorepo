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
import { AdminTable, AdminTableColumn, AdminTableState } from "~/components/ui";
import { config } from "~/config";

const intitalTableState: AdminTableState = {
  pageIndex: 0,
  pageSize: config.defaultPageSize ?? 30
} 

const Index = () => {
  const [tableState, setTableState] = useState(intitalTableState);
  const [isRefetching, setIsRefetching] = useState(false);
  console.log("Index");

  const { t } = useTranslation();
  const { loading, error, data, refetch } = useQuery(usersQueryGQL, {
    onCompleted: () => {
      setIsRefetching(false);
    },
    onError: () => {
      setIsRefetching(false);
    },
    variables: {
      page: intitalTableState.pageIndex,
      pageSize: intitalTableState.pageSize,
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
      isNumedric: false,
    } as AdminTableColumn,
    {
      Header: t("users.fields.label.firstName", "First Name"),
      accessor: "firstName",
      isNumedric: false,
    } as AdminTableColumn,
    {
      Header: t("users.fields.label.lastName", "Last name"),
      accessor: "lastName",
      isNumeric: false,
    } as AdminTableColumn,
    {
      Header: t("users.fields.label.email", "Email"),
      accessor: "email",
      isNumeric: true,
    } as AdminTableColumn,
    {
      Header: t("users.fields.label.role", "Role"),
      accessor: "role",
      isNumeric: true,
    } as AdminTableColumn,
    {
      Header: t("users.fields.label.actions", "Actions"),
      allowEdit: true,
      allowDelete: true,
    } as AdminTableColumn,
  ];
  
  

  const onFetchData = (pageIndex: number, pageSize: number) => {
    if (tableState.pageIndex !== pageIndex || tableState.pageSize !== pageSize) {
      console.log("on fetch data", pageIndex, pageSize);
      setIsRefetching(true);
      refetch({
        page: pageIndex,
        pageSize,
        
      });

      setTableState({
        pageIndex,
        pageSize,
      })
    }
    
  };

  const queryPageCount = (data?.users?.totalCount ?? 0) > 0 ? Math.ceil((data?.users?.totalCount ?? 0) / tableState.pageSize) : 0;

  console.log(queryPageCount);

  return (
    <>
      <ModuleSubNav breadcrumb={breadcrumb} buttonList={buttonList} />
      <ModulePage isLoading={loading && !isRefetching} isError={!!error}>
        <AdminTable
          columns={AdminTableColumns}
          queryPageCount={queryPageCount}
          data={data?.users?.users ?? []}
          intitalTableState={intitalTableState}
          onFetchData={onFetchData}
        />
      </ModulePage>
    </>
  );
};
export default Index;
