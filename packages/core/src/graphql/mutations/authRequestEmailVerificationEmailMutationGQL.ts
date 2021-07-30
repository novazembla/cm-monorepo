import gql from "graphql-tag";

export const authRequestEmailVerificationEmailMutationGQL = gql`
  mutation authRequestEmailVerificationEmail($scope: String!, $userId: Int!) {
    authRequestEmailVerificationEmail(scope: $scope, userId: $userId) {
      result
    }
  }
`;

export default authRequestEmailVerificationEmailMutationGQL;
