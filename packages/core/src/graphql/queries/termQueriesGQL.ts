import gql from "graphql-tag";

export const termsQueryGQL = gql`
  query terms(
    $taxonomyId: Int!
    $where: JSON
    $orderBy: JSON
    $pageIndex: Int
    $pageSize: Int
  ) {
    taxonomyRead(id: $taxonomyId) {
      id
      name
      slug
    }
    terms(
      taxonomyId: $taxonomyId
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      terms {
        id
        name
        slug
      }
      totalCount
    }
  }
`;

export const termReadQueryGQL = gql`
  query termRead($id: Int!) {
    termRead(id: $id) {
      id
      name
      slug
      color
      createdAt
      updatedAt

      taxonomy {
        id
        name
        slug
        hasColor
        createdAt
        updatedAt
      }
    }
  }
`;

export default termsQueryGQL;
