import gql from "graphql-tag";

export const importsQueryGQL = gql`
  query dataImports(
    $where: JSON
    $orderBy: JSON
    $pageIndex: Int
    $pageSize: Int
  ) {
    dataImports(
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      dataImports {
        id
        title
        status
        warnings
        errors
        updatedAt
      }
      totalCount
    }
  }
`;

export const dataImportReadQueryGQL = gql`
  query dataImportRead($id: Int!, $type: String!) {
    dataImportRead(id: $id, type: $type) {
      id
      title
      log
      errors
      status
      warnings
      mapping
      file {
        id
        status
        meta
      }
      createdAt
      updatedAt
    }
  }
`;

export default importsQueryGQL;
