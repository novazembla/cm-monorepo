import gql from "graphql-tag";

export const userUpdateMutationGQL = gql`
  mutation userUpdate($scope: String!, $userId: Int!, $data: UserUpdateInput!) {
    userUpdate(scope: $scope, userId: $userId, data: $data) {
      result
    }
  }
`;

export default userUpdateMutationGQL;
