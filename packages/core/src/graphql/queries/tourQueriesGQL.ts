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
        status
        orderNumber
        tourStopCount
      }
      totalCount
    }
  }
`;

export const tourQueryGQL = gql`
  query tour($id: Int!) {
    tour(id: $id) {
      id
      title
      slug
      distance
      duration
      teaser
      description
      orderNumber
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
    taxonomy(id: $taxonomyId) {
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
        number
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
      number
      teaser
      description
      locationId
      createdAt
      updatedAt
      location {
        id
        title
      }
      tour {
        id
        title
      }
      heroImage {
        id
        meta
        status
        alt
        credits
      }
      images {
        id
        meta
        status
        alt
        credits
      }
    }
  }
`;
