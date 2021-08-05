import gql from "graphql-tag";

export const userDeleteMutationGQL = gql`
  mutation userDelete($scope: String!, $userId: Int!) {
    userDelete(scope: $scope, userId: $userId) {
      result
    }
  }
`;

export default userDeleteMutationGQL;
