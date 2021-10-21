import gql from "graphql-tag";

export const pagesQueryGQL = gql`
  query pages($where: JSON, $orderBy: JSON, $pageIndex: Int, $pageSize: Int) {
    pages(
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      pages {
        id
        ownerId
        title
        slug
        status
        intro
        content
      }
      totalCount
    }
  }
`;

export const pagesSearchGQL = gql`
  query pages($where: JSON) {
    pages(where: $where, orderBy: { id: "asc" }, pageIndex: 0, pageSize: 50) {
      pages {
        id
        title
      }
      totalCount
    }
  }
`;

export default pagesQueryGQL;
