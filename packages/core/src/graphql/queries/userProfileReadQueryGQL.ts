import gql from "graphql-tag";

export const userProfileReadQueryGQL = gql`
  query userProfileRead($scope: String!, $id: Int!) {
    userProfileRead(scope: $scope, id: $id) {
      id
      firstName
      lastName
      email
      emailVerified
    }
  }
`;

export default userProfileReadQueryGQL;
