import gql from "graphql-tag";

export const dataImportCreateMutationGQL = gql`
  mutation dataImportCreate($data: DataImportUpsertInput!) {
    dataImportCreate(data: $data) {
      id
      title
      log
      errors
      mapping
      status
    }
  }
`;

export const dataImportUpdateMutationGQL = gql`
  mutation dataImportUpdate($id: Int!, $data: DataImportUpsertInput!) {
    dataImportUpdate(id: $id, data: $data) {
      id
      title
      log
      errors
      mapping
      status
    }
  }
`;

export const dataImportDeleteMutationGQL = gql`
  mutation dataImportDelete($id: Int!, $type: String!) {
    dataImportDelete(id: $id, type: $type) {
      result
    }
  }
`;

export const dataImportFileDeleteMutationGQL = gql`
  mutation dataImportFileDelete($id: Int!, $type: String!) {
    dataImportFileDelete(id: $id, type: $type) {
      result
    }
  }
`;
