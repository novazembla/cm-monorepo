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
        termCount
      }
      totalCount
    }
  }
`;

export default taxonomiesQueryGQL;
