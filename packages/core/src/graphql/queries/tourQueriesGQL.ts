import gql from "graphql-tag";

export const toursQueryGQL = gql`
  query tours($where: JSON, $orderBy: JSON, $pageIndex: Int, $pageSize: Int) {
    tours(
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      tours {
        id
        title
        slug
        tourStopCount
      }
      totalCount
    }
  }
`;

export const tourReadQueryGQL = gql`
  query tourRead($id: Int!) {
    tourRead(id: $id) {
      id
      title
      slug
      distance
      duration
      teaser
      description
      ownerId
      heroImage {
        id
        meta
        status
      }
      tourStopCount
      tourStops {
        id
        title
        number
      }
      createdAt
      updatedAt
    }
  }
`;

export const tourStopsQueryGQL = gql`
  query tourStops(
    $taxonomyId: Int!
    $where: JSON
    $orderBy: JSON
    $pageIndex: Int
    $pageSize: Int
  ) {
    taxonomyRead(id: $taxonomyId) {
      id
      title
      slug
      hasColor
    }
    tourStops(
      taxonomyId: $taxonomyId
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      tourStops {
        id
        title
        slug
        color
        colorDark
      }
      totalCount
    }
  }
`;

export const tourStopReadQueryGQL = gql`
  query tourStopRead($id: Int!) {
    tourStopRead(id: $id) {
      id
      title
      slug
      color
      colorDark
      createdAt
      updatedAt

      taxonomy {
        id
        title
        slug
        hasColor
        createdAt
        updatedAt
      }
    }
  }
`;
