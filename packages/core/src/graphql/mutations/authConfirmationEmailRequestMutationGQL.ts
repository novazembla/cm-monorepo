import gql from "graphql-tag";

export const authConfirmationEmailRequestMutationGQL = gql`
  mutation authConfirmationEmailRequest($scope: String!, $userId: Int!) {
    authConfirmationEmailRequest(scope: $scope, userId: $userId) {
      result
    }
  }
`;

export default authConfirmationEmailRequestMutationGQL;
