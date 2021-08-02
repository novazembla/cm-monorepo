import gql from "graphql-tag";

export const authPasswordRequestMutationGQL = gql`
  mutation authPasswordRequest($scope: String!, $email: EmailAddress!) {
    authPasswordRequest(scope: $scope, email: $email) {
      result
    }
  }
`;

export default authPasswordRequestMutationGQL;
