import gql from "graphql-tag";

export const userProfileUpdateMutationGQL = gql`
  mutation userProfileUpdate(
    $scope: String!
    $id: Int!
    $data: UserProfileUpdateInput!
  ) {
    userProfileUpdate(scope: $scope, id: $id, data: $data) {
      id
      firstName
      lastName
      email
    }
  }
`;

export default userProfileUpdateMutationGQL;
