import gql from "graphql-tag";

export const userProfileUpdateMutationGQL = gql`
  mutation userProfileUpdate(
    $scope: String!
    $userId: Int!
    $data: UserProfileUpdateInput!
  ) {
    userProfileUpdate(scope: $scope, userId: $userId, data: $data) {
      id
      firstName
      lastName
      email
    }
  }
`;

export default userProfileUpdateMutationGQL;
