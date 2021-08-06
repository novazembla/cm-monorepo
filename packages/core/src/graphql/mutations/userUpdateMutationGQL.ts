import gql from "graphql-tag";

export const userUpdateMutationGQL = gql`
  mutation userUpdate($scope: String!, $id: Int!, $data: UserUpdateInput!) {
    userUpdate(scope: $scope, id: $id, data: $data) {
      result
    }
  }
`;

export default userUpdateMutationGQL;
