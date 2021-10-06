import gql from "graphql-tag";

export const fileDeleteMutationGQL = gql`
  mutation fileDelete($id: Int!) {
    fileDelete(id: $id) {
      result
    }
  }
`;
