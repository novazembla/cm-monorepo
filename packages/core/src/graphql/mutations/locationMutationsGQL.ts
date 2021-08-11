import gql from "graphql-tag";

export const locationCreateMutationGQL = gql`
  mutation locationCreate($data: LocationUpsertInput!) {
    locationCreate(data: $data) {
      id
      title
      slug
      status
      description
    }
  }
`;

// TODO::more rows in return.

export const locationUpdateMutationGQL = gql`
  mutation locationUpdate($id: Int!, $data: LocationUpsertInput!) {
    locationUpdate(id: $id, data: $data) {
      id
      title
      slug
      status
      description
    }
  }
`;

export const locationDeleteMutationGQL = gql`
  mutation locationDelete($id: Int!) {
    locationDelete(id: $id) {
      result
    }
  }
`;
