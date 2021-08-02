import gql from "graphql-tag";

export const authLoginMutationGQL = gql`
  mutation authLogin(
    $scope: String!
    $email: EmailAddress!
    $password: String!
  ) {
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
