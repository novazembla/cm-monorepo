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
        isRequired
        collectPrimaryTerm
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
      isRequired
      collectPrimaryTerm
      termCount
      modules {
        id
        key
      }
      createdAt
      updatedAt
    }
  }
`;

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
      hasColor
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
        color
        colorDark
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
      colorDark
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
