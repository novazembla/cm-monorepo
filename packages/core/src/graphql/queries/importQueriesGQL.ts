import gql from "graphql-tag";

export const importsQueryGQL = gql`
  query imports($where: JSON, $orderBy: JSON, $pageIndex: Int, $pageSize: Int) {
    imports(
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      imports {
        id
        title
        status
        updatedAt
      }
      totalCount
    }
  }
`;

export const importReadQueryGQL = gql`
  query importRead($id: Int!) {
    importRead(id: $id) {
      id
      title
      log
      errors
      status
      warnings
      mapping
      file
      createdAt
      updatedAt
    }
  }
`;

export default importsQueryGQL;
