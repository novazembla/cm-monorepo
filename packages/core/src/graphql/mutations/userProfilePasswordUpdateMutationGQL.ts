import gql from "graphql-tag";

export const userProfilePasswordUpdateMutationGQL = gql`
  mutation userProfilePasswordUpdate(
    $scope: String!
    $userId: Int!
    $password: String!
  ) {
    userProfilePasswordUpdate(
      scope: $scope
      userId: $userId
      password: $password
    ) {
      id
      firstName
      lastName
    }
  }
`;

export default userProfilePasswordUpdateMutationGQL;
