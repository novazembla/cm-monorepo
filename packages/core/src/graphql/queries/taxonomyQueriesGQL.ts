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
        hasIcons
        hasStolperstein
        hasColor
        isRequired
        collectPrimaryTerm
        termCount
      }
      totalCount
    }
  }
`;

export const taxonomyQueryGQL = gql`
  query taxonomy($id: Int!) {
    taxonomy(id: $id) {
      id
      name
      slug
      hasIcons
      hasStolperstein
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
    taxonomy(id: $taxonomyId) {
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
        iconKey
        isStolperstein
        color
        colorDark
      }
      totalCount
    }
  }
`;

export const termQueryGQL = gql`
  query term($id: Int!) {
    term(id: $id) {
      id
      name
      slug
      iconKey
      isStolperstein
      color
      colorDark
      createdAt
      updatedAt

      taxonomy {
        id
        name
        slug
        hasIcons
        hasStolperstein
        hasColor
        createdAt
        updatedAt
      }
    }
  }
`;
