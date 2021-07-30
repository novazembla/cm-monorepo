import gql from "graphql-tag";

export const userProfileUpdateMutationGQL = gql`
  mutation userProfileUpdate(
    $scope: String!
    $userId: Int!
    $firstName: String!
    $lastName: String!
    $email: String!
  ) {
    userProfileUpdate(
      scope: $scope
      userId: $userId
      data: { firstName: $firstName, lastName: $lastName, email: $email }
    ) {
      User
    }
  }
`;

export default userProfileUpdateMutationGQL;
