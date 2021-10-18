import gql from "graphql-tag";

export const dataExportsQueryGQL = gql`
  query dataExports(
    $where: JSON
    $orderBy: JSON
    $pageIndex: Int
    $pageSize: Int
  ) {
    dataExports(
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      dataExports {
        id
        title
        status
        updatedAt
      }
      totalCount
    }
  }
`;

export const dataExportReadQueryGQL = gql`
  query dataExportRead($id: Int!, $type: String!) {
    dataExportRead(id: $id, type: $type) {
      id
      title
      exportType
      lang
      log
      errors
      status
      meta
      file
      createdAt
      updatedAt
    }
  }
`;

export default dataExportsQueryGQL;
