import gql from "graphql-tag";

export const userDeleteMutationGQL = gql`
  mutation userDelete($scope: String!, $id: Int!) {
    userDelete(scope: $scope, id: $id) {
      result
    }
  }
`;

export default userDeleteMutationGQL;
