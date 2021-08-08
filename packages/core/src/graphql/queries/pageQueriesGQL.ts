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
        title
        slug
        content
      }
      totalCount
    }
  }
`;

export default pagesQueryGQL;
