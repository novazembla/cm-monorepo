import gql from "graphql-tag";

export const authLoginMutationGQL = gql`
  mutation authLogin($scope: String!, $email: String!, $password: String!) {
    authLogin(scope: $scope, email: $email, password: $password) {
      tokens {
        access {
          token
          expires
        }
        refresh {
          expires
        }
      }
    }
  }
`;

export default authLoginMutationGQL;
