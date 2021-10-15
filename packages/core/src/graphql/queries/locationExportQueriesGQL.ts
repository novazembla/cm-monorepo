import gql from "graphql-tag";

export const locationExportsQueryGQL = gql`
  query locationExports(
    $where: JSON
    $orderBy: JSON
    $pageIndex: Int
    $pageSize: Int
  ) {
    locationExports(
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      locationExports {
        id
        title
        status
        updatedAt
      }
      totalCount
    }
  }
`;

export const locationExportReadQueryGQL = gql`
  query locationExportRead($id: Int!) {
    locationExportRead(id: $id) {
      id
      title
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

export default locationExportsQueryGQL;
