import gql from "graphql-tag";

export const eventsQueryGQL = gql`
  query events($where: JSON, $orderBy: JSON, $pageIndex: Int, $pageSize: Int) {
    events(
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      events {
        id
        ownerId
        title
        slug
        status
        description
        isFree
        isImported
        meta
        updatedAt
        dates {
          id
          date
          begin
          end
        }
      }
      totalCount
    }
  }
`;

export const eventsSearchGQL = gql`
  query events($where: JSON) {
    events(where: $where, orderBy: { id: "asc" }, pageIndex: 0, pageSize: 50) {
      events {
        id
        title
      }
      totalCount
    }
  }
`;

export const eventGQL = gql`
  query event($id: Int!) {
    event(id: $id) {
      id
      ownerId
      title
      slug
      status
      description
      isFree
      isImported
      meta
      dates {
        id
        date
        begin
        end
      }
      terms {
        id
        name
        slug
      }
      primaryTerms {
        id
        name
        slug
      }
      locations {
        id
        title
        description
        lat
        lng
      }
    }
  }
`;

export const eventImportLogsQueryGQL = gql`
  query eventImportLogs(
    $where: JSON
    $orderBy: JSON
    $pageIndex: Int
    $pageSize: Int
  ) {
    eventImportLogs(
      where: $where
      orderBy: $orderBy
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      eventImportLogs {
        id
        warnings
        errors
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

export const eventImportLogReadGQL = gql`
  query eventImportLogRead($id: Int!) {
    eventImportLogs(id: $id) {
      id
      log
      warnings
      errors
      createdAt
      updatedAt
    }
  }
`;

export default eventsQueryGQL;
