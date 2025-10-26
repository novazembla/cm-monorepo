import type { AuthenticatedAppUser } from "@culturemap/core";

import { PublishStatus } from "@culturemap/core";

import {
  SortingRule,
  Cell,
} from "react-table";

export type AdminTableColumn = {
  Header: string;
  accessor?: string;
  isNumeric?: boolean;
  isCentered?: boolean;
  isStickyToTheRight?: boolean;

  isDate?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showView?: boolean;
  editPath?: string;
  viewPath?: string;
  editButtonLabel?: string;
  viewButtonLabel?: string;
  editButtonComponent?: React.FC<any>;
  viewButtonComponent?: React.FC<any>;

  canEdit?: boolean | ((cell: Cell, appUser: AuthenticatedAppUser) => boolean);
  canView?: boolean | ((cell: Cell, appUser: AuthenticatedAppUser) => boolean);

  canDelete?:
    | boolean
    | ((cell: Cell, appUser: AuthenticatedAppUser) => boolean);
  deleteButtonLabel?: string;
  deleteButtonComponent?: React.FC<any>;
  deleteButtonOnClick?: (cell: Cell) => void;

  appUser?: AuthenticatedAppUser;
  Cell?: React.FC<any>;
};

export type AdminTableState = {
  pageIndex: number;
  pageSize: number;
  sortBy: SortingRule<Record<string, unknown>>[];
  filterKeyword: string;
  statusFilter: PublishStatus[];
  taxFilter: number[];
  and: boolean;
};

export type AdminTableQueryVariables = {
  pageSize?: number | undefined;
  pageIndex?: number | undefined;
  orderBy?: Record<string, "asc" | "desc"> | undefined;
  where?: any;
};

export const adminTableCreateQueryVariables = (
  tState: AdminTableState,
  multilangColumns?: string[],
  activeLanguage?: string,
  activeLanguages?: string[],
  additionalWhere?: any
) => {
  let variables: AdminTableQueryVariables = {
    pageIndex: tState.pageIndex,
    pageSize: tState.pageSize,
  };

  if (tState.sortBy && Array.isArray(tState.sortBy) && tState.sortBy.length) {
    let key = tState.sortBy[0].id;
    if (multilangColumns?.includes(tState.sortBy[0].id)) {
      key = `${key}_${activeLanguage}`;
    }

    variables = {
      ...variables,
      orderBy: {
        [key]: tState.sortBy[0].desc ? "desc" : "asc",
      },
    };
  }
  let where: any[] = [];
  if (tState.filterKeyword && tState.filterKeyword.length > 2) {
    where.push({
      fullText: {
        contains: tState.filterKeyword,
        mode: "insensitive",
      },
    });
  }

  if (tState.statusFilter.length > 0)
    where.push({
      status: {
        in: tState.statusFilter,
      },
    });

  if (tState.taxFilter.length > 0) {
    if (tState.and) {
      where = [
        ...where,
        ...tState.taxFilter.map((id: number) => ({
          terms: {
            some: {
              id: {
                equals: id,
              },
            },
          },
        })),
      ];
    } else {
      where.push({
        terms: {
          some: {
            id: { in: tState.taxFilter },
          },
        },
      });
    }
  }

  if (additionalWhere) where.push(additionalWhere);

  if (where.length > 0) {
    variables = {
      ...variables,
      where:
        where.length > 1
          ? {
              AND: where,
            }
          : where[0],
    };
  }

  return variables;
};

export const adminTableCreateNewTableState = (
  tableState: AdminTableState,
  pageIndex: number,
  pageSize: number,
  sortBy: SortingRule<Record<string, unknown>>[],
  filterKeyword: string,
  values?: any
): [AdminTableState, boolean, number] => {
  let newTableState = {
    ...tableState,
    filterKeyword,
  };

  let doRefetch = false;

  let newPageIndex = pageIndex;

  const statusFilter: PublishStatus[] =
    values && Object.keys(values).length > 0
      ? Object.keys(values).reduce((status: PublishStatus[], key: string) => {
          if (values[key] && key.indexOf("filter_status") > -1) {
            const parts = key.split("_");
            if (parts.length === 3) status.push(parseInt(parts[2]));
          }
          return status;
        }, [])
      : [];

  const taxFilter: number[] =
    values && Object.keys(values).length > 0
      ? Object.keys(values).reduce((terms: number[], key: string) => {
          if (values[key] && key.indexOf("tax_") > -1) {
            const parts = key.split("_");
            if (parts.length === 2) terms.push(parseInt(parts[1]));
          }
          return terms;
        }, [])
      : [];

  if (
    (!sortBy || (Array.isArray(sortBy) && sortBy.length === 0)) &&
    tableState.sortBy.length > 0
  ) {
    newTableState = {
      ...newTableState,
      sortBy: [],
    };
    newPageIndex = 0;
    doRefetch = true;
  }

  if (Array.isArray(sortBy) && sortBy.length > 0) {
    if (
      tableState.sortBy.length === 0 ||
      tableState?.sortBy[0]?.id !== sortBy[0].id ||
      tableState?.sortBy[0]?.desc !== sortBy[0].desc
    ) {
      newTableState = {
        ...newTableState,
        sortBy: [sortBy[0]],
      };
      newPageIndex = 0;
      doRefetch = true;
    }
  }

  if (
    statusFilter &&
    JSON.stringify(statusFilter) !== JSON.stringify(tableState.statusFilter)
  ) {
    newTableState = {
      ...newTableState,
      statusFilter,
    };
    doRefetch = true;
  }

  if (
    values &&
    typeof values?.and === "boolean" &&
    !!values.and !== !!tableState.and
  ) {
    newTableState = {
      ...newTableState,
      and: !!values.and,
    };
    doRefetch = true;
  }

  if (
    taxFilter &&
    JSON.stringify(taxFilter) !== JSON.stringify(tableState.taxFilter)
  ) {
    newTableState = {
      ...newTableState,
      taxFilter,
    };
    doRefetch = true;
  }

  if (tableState.pageSize !== pageSize) {
    newTableState = {
      ...newTableState,
      pageSize,
    };
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
  }

  if (tableState.pageIndex !== newPageIndex) {
    newTableState = {
      ...newTableState,
      pageIndex: newPageIndex,
    };
    doRefetch = true;
  }

  return [newTableState, doRefetch, newPageIndex];
};