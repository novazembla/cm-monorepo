import gql from "graphql-tag";

export const pageCreateMutationGQL = gql`
  mutation pageCreate($data: PageUpsertInput!) {
    pageCreate(data: $data) {
      id
      title
      slug
      intro
      content
    }
  }
`;

export const pageUpdateMutationGQL = gql`
  mutation pageUpdate($id: Int!, $data: PageUpsertInput!) {
    pageUpdate(id: $id, data: $data) {
      id
      title
      intro
      slug
      content
    }
  }
`;

export const pageDeleteMutationGQL = gql`
  mutation pageDelete($id: Int!) {
    pageDelete(id: $id) {
      result
    }
  }
`;
