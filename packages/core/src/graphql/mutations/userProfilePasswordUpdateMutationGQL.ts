import gql from "graphql-tag";

export const userProfilePasswordUpdateMutationGQL = gql`
  mutation userProfilePasswordUpdate(
    $scope: String!
    $id: Int!
    $password: String!
  ) {
    userProfilePasswordUpdate(scope: $scope, id: $id, password: $password) {
      id
      firstName
      lastName
    }
  }
`;

export default userProfilePasswordUpdateMutationGQL;
