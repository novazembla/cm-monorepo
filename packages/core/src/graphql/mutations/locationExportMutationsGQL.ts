import gql from "graphql-tag";

export const locationExportCreateMutationGQL = gql`
  mutation locationExportCreate($data: LocationExportUpsertInput!) {
    locationExportCreate(data: $data) {
      id
      title
      log
      errors
      meta
      status
    }
  }
`;

export const locationExportUpdateMutationGQL = gql`
  mutation locationExportUpdate($id: Int!, $data: LocationExportUpsertInput!) {
    locationExportUpdate(id: $id, data: $data) {
      id
      title
      log
      errors
      meta
      status
    }
  }
`;

export const locationExportDeleteMutationGQL = gql`
  mutation locationExportDelete($id: Int!) {
    locationExportDelete(id: $id) {
      result
    }
  }
`;
