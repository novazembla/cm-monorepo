import gql from "graphql-tag";

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
      }
      totalCount
    }
  }
`;

export const locationsSearchGQL = gql`
  query locations($where: JSON) {
    locations(
      where: $where
      orderBy: { id: "asc" }
      pageIndex: 0
      pageSize: 50
    ) {
      locations {
        id
        title
      }
      totalCount
    }
  }
`;

export default locationsQueryGQL;
