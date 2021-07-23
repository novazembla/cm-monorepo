import gql from "graphql-tag";

export const authLoginMutationGQL = gql`
  mutation authLogin($email: String!, $password: String!) {
    authLogin(email: $email, password: $password) {
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
