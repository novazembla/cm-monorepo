import gql from "graphql-tag";

export const importCreateMutationGQL = gql`
  mutation importCreate($data: ImportUpsertInput!) {
    importCreate(data: $data) {
      id
      title
      log
      errors
      mapping
      status
    }
  }
`;

export const importUpdateMutationGQL = gql`
  mutation importUpdate($id: Int!, $data: ImportUpsertInput!) {
    importUpdate(id: $id, data: $data) {
      id
      title
      log
      errors
      mapping
      status
    }
  }
`;

export const importDeleteMutationGQL = gql`
  mutation importDelete($id: Int!) {
    importDelete(id: $id) {
      result
    }
  }
`;
