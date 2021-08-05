import gql from "graphql-tag";

export const userReadQueryGQL = gql`
  query userRead($scope: String!, $userId: Int!) {
    userRead(scope: $scope, userId: $userId) {
      id
      firstName
      lastName
      email
      emailVerified
      role
      userBanned
      createdAt
      updatedAt
    }
  }
`;

export default userReadQueryGQL;
