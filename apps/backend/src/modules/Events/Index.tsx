import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { eventDeleteMutationGQL, PublishStatus } from "@culturemap/core";
import { useQuery, gql } from "@apollo/client";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import type * as yup from "yup";

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
  useSuccessfullySavedToast,
} from "~/hooks";

import { useDataExportCreateMutation } from "./hooks";
import { ModuleDataExportCreateSchema } from "./forms";
import { FieldInput, FieldRow, TextErrorMessage } from "~/components/forms";
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
import { Divider, chakra, Button, Box, Flex } from "@chakra-ui/react";

export const eventsQueryGQL = gql`
  query events($where: JSON, $orderBy: JSON, $pageIndex: Int, $pageSize: Int) {
    events(
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      events {
        id
        ownerId
        title
        slug
        status
        description
        isFree
        isImported
        meta
        updatedAt
        dates {
          id
          date
          begin
          end
        }
      }
      totalCount
    }
    moduleTaxonomies(key: "event") {
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
  const [hasFormError, setHasFormError] = useState(false);
  const successToast = useSuccessfullySavedToast();
  
  const [tableState, setTableState] = useLocalStorage(
    `${moduleRootPath}/Index`,
    intitalTableState
  );

  const [isRefetching, setIsRefetching] = useState(false);

  const [firstMutation] = useDataExportCreateMutation();

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
    resolver: yupResolver(ModuleDataExportCreateSchema),
  });

  const { getValues, reset, handleSubmit } = formMethods;

  const resetFilter = useCallback(() => {
    reset({
      ...statusFilter.reduce(
        (acc: any, s: PublishStatus) => {
          return {
            ...acc,
            [`filter_status_${s}`]: intitalTableState.statusFilter.includes(s),
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

  const { loading, error, data, refetch } = useQuery(eventsQueryGQL, {
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
      eventDeleteMutationGQL,
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
      title: t("module.events.title", "Events"),
    },
  ];

  const buttonList: ButtonListElement[] = [
    {
      type: "navigation",
      to: `${moduleRootPath}/create`,
      label: t("module.events.button.create", "Add new event"),
      userCan: "eventCreate",
    },
    {
      type: "navigation",
      to: `${moduleRootPath}/import`,
      label: t("module.locations.menuitem.imports", "Imports"),
      userCan: "eventRead",
    },
    {
      type: "navigation",
      to: `${moduleRootPath}/exports`,
      label: t("module.locations.menuitem.exports", "Exports"),
      userCan: "locationCreate",
    },
  ];

  // columns need to be a ref!
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
        appUser?.can("eventUpdate") ||
        (appUser.can("eventUpdateOwn") &&
          appUser.id === (cell?.row?.original as any)?.ownerId),
      editPath: `${moduleRootPath}/update/:id`,
      editButtonLabel: t("module.events.button.edit", "Edit event"),
      // editButtonComponent: undefined,

      showDelete: true,
      canDelete: (cell, appUser) =>
        appUser?.can("eventDelete") ||
        (appUser.can("eventDeleteOwn") &&
          appUser.id === (cell?.row?.original as any)?.ownerId),

      deleteButtonLabel: t("module.events.button.delete", "Delete event"),
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
      refetchDataCache = data?.events?.events ?? [];
      refetchTotalCount = data?.events?.totalCount ?? 0;

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

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleDataExportCreateSchema>
  ) => {
    setHasFormError(false);

    try {
      if (appUser) {
        const mutationResults = await firstMutation({
          title: newData.title,
          lang: i18n.language,
          type: "event",
          meta: adminTableCreateQueryVariables(
            tableState,
            multiLangFields,
            i18n.language,
            config.activeLanguages
          ),
        });

        if (!mutationResults.errors) {
          successToast();
        } else {
          setHasFormError(true);
        }
      } else {
        setHasFormError(true);
      }
    } catch (err) {
      setHasFormError(true);
    }
  };

  const tableTotalCount = data?.events?.totalCount ?? refetchTotalCount;

  const tablePageCount =
    tableTotalCount > 0
      ? Math.ceil(
          (data?.events?.totalCount ?? refetchTotalCount) / tableState.pageSize
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
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
          {hasFormError && (
              <>
                <TextErrorMessage error="general.writeerror.desc" />
                <Divider />
              </>
            )}
            <AdminTable
              columns={AdminTableColumns}
              isLoading={loading}
              showFilter={true}
              resetFilter={resetFilter}
              showKeywordSearch={true}
              {...{
                tableTotalCount,
                tablePageCount,
                isRefetching,
                onFetchData,
                refetchPageIndex,
              }}
              data={
                isRefetching ? refetchDataCache : data?.events?.events ?? []
              }
              statusFilter={statusFilter}
              taxonomies={data}
              intitalTableState={tableState}
            />
            <Divider mt="3" />
            <chakra.fieldset
              border="1px solid"
              borderColor="gray.400"
              p="2"
              borderRadius="md"
            >
              <legend>
                <chakra.span px="2">
                  {t("module.locations.export.create.label", "Export")}
                </chakra.span>
              </legend>
              <Box p="2">
                <FieldRow>
                  <Box>
                    {t(
                      "module.locations.export.introduction",
                      "Export all {{num}} items as .xlsx file",
                      {
                        num: tableTotalCount,
                      }
                    )}
                  </Box>
                </FieldRow>
                <FieldRow>
                  <FieldInput
                    id="title"
                    type="text"
                    name="title"
                    label={t(
                      "module.locations.export.field.label.exportName",
                      "Export Name"
                    )}
                    isRequired={true}
                    isDisabled={tableTotalCount === 0}
                    settings={{
                      placeholder: t(
                        "module.locations.export.field.placeholder.title",
                        "Short name to find your export in the export listing"
                      ),
                    }}
                  />
                </FieldRow>
                <FieldRow>
                  <Flex w="100%" justifyContent="flex-end">
                    <Button type="submit" isDisabled={tableTotalCount === 0}>
                      {t(
                        "module.locations.export.button.label.scheduleExport",
                        "Schedule export"
                      )}
                    </Button>
                  </Flex>
                </FieldRow>
              </Box>
            </chakra.fieldset>
          </form>
        </FormProvider>
      </ModulePage>
      {DeleteAlertDialog}
    </>
  );
};
export default Index;
