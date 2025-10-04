import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { locationDeleteMutationGQL, PublishStatus } from "@culturemap/core";
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

import { FieldInput, FieldRow, TextErrorMessage } from "~/components/forms";

import { useDataExportCreateMutation } from "./hooks";
import { ModuleDataExportCreateSchema } from "./forms";

import { AlertEmailVerification } from "~/components/housekeeping";

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
  PublishStatus.SUGGESTION,
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
      title: undefined,
    },
    resolver: yupResolver(ModuleDataExportCreateSchema as any),
  });

  const { getValues, reset, handleSubmit } = formMethods;

  const [isTableStateReset, setIsTableStateReset] = useState(false);

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
    {
      type: "navigation",
      to: `${moduleRootPath}/exports`,
      label: t("module.locations.menuitem.exports", "Exports"),
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
    sortBy: SortingRule<Record<string, unknown>>[],
    filterKeyword: string,
    forceRefetch?: boolean
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

    if (doRefetch || forceRefetch) {
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

  const onSubmit = async (
    newData: yup.InferType<typeof ModuleDataExportCreateSchema>
  ) => {
    setHasFormError(false);

    try {
      if (appUser) {
        const mutationResults = await firstMutation({
          title: newData.title,
          lang: i18n.language,
          type: "location",
          meta: adminTableCreateQueryVariables(
            tableState,
            multiLangFields,
            i18n.language,
            config.activeLanguages
          ),
        });

        if (!mutationResults.errors) {
          reset({
            title: "",
          });
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

  const tablePageCount =
    tableTotalCount > 0
      ? Math.ceil(
          (data?.locations?.totalCount ?? refetchTotalCount) /
            tableState.pageSize
        )
      : 0;

  return (
    <>
      <AlertEmailVerification />
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
              showKeywordSearch={true}
              resetFilter={resetFilter}
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
