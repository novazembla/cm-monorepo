import gql from "graphql-tag";

export const imageDeleteMutationGQL = gql`
  mutation imageDelete($id: Int!) {
    imageDelete(id: $id) {
      result
    }
  }
`;
