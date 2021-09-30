import gql from "graphql-tag";

export const taxonomiesQueryGQL = gql`
  query taxonomies(
    $where: JSON
    $orderBy: JSON
    $pageIndex: Int
    $pageSize: Int
  ) {
    taxonomies(
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      taxonomies {
        id
        name
        slug
        hasColor
        termCount
      }
      totalCount
    }
  }
`;

export const taxonomyReadQueryGQL = gql`
  query taxonomyRead($id: Int!) {
    taxonomyRead(id: $id) {
      id
      name
      slug
      hasColor
      termCount
      modules {
        key
      }
      createdAt
      updatedAt
    }
  }
`;

export default taxonomiesQueryGQL;
