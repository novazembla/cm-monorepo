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
        descriptionLocation
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

export const eventReadGQL = gql`
  query eventRead($id: Int!) {
    events(id: $id) {
      id
      ownerId
      title
      slug
      status
      description
      descriptionLocation
      dates {
        id
        date
        begin
        end
      }
      locations {
        id
        title
        description
        lat
        lng
      }
      totalCount
    }
  }
`;

export default eventsQueryGQL;
