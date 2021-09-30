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
        name
        slug
        hasColor
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
      name
      slug
      hasColor
      tourStopCount
      modules {
        key
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
      name
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
        name
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
