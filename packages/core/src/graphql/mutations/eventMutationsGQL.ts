import gql from "graphql-tag";

export const eventCreateMutationGQL = gql`
  mutation eventCreate($data: EventUpsertInput!) {
    eventCreate(data: $data) {
      id
      ownerId
      title
      slug
      status
      description
      socialMedia
    }
  }
`;

export const eventUpdateMutationGQL = gql`
  mutation eventUpdate($id: Int!, $data: EventUpsertInput!) {
    eventUpdate(id: $id, data: $data) {
      id
      ownerId
      title
      slug
      status
      description
      socialMedia
    }
  }
`;

export const eventDeleteMutationGQL = gql`
  mutation eventDelete($id: Int!) {
    eventDelete(id: $id) {
      result
    }
  }
`;
