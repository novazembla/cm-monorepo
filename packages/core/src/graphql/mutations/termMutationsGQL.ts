import gql from "graphql-tag";

export const termCreateMutationGQL = gql`
  mutation termCreate($data: TermCreateInput!) {
    termCreate(data: $data) {
      id
      name
      slug
      taxonomyId
    }
  }
`;

export const termUpdateMutationGQL = gql`
  mutation termUpdate($id: Int!, $data: TermUpdateInput!) {
    termUpdate(id: $id, data: $data) {
      id
      name
      slug
    }
  }
`;

export const termDeleteMutationGQL = gql`
  mutation termDelete($id: Int!) {
    termDelete(id: $id) {
      result
    }
  }
`;
