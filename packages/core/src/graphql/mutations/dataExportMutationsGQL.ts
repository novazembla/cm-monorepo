import gql from "graphql-tag";

export const dataExportCreateMutationGQL = gql`
  mutation dataExportCreate($data: DataExportUpsertInput!) {
    dataExportCreate(data: $data) {
      id
      title
      log
      errors
      meta
      status
    }
  }
`;

export const dataExportUpdateMutationGQL = gql`
  mutation dataExportUpdate($id: Int!, $data: DataExportUpsertInput!) {
    dataExportUpdate(id: $id, data: $data) {
      id
      title
      log
      errors
      meta
      status
    }
  }
`;

export const dataExportDeleteMutationGQL = gql`
  mutation dataExportDelete($id: Int!, $type: String!) {
    dataExportDelete(id: $id, type: $type) {
      result
    }
  }
`;
