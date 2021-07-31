import gql from "graphql-tag";

export const userProfileReadQueryGQL = gql`
  query userProfileRead($scope: String!, $userId: Int!) {
    userProfileRead(scope: $scope, userId: $userId) {
      id
      firstName
      lastName
      email
      emailVerified
    }
  }
`;

export default userProfileReadQueryGQL;
