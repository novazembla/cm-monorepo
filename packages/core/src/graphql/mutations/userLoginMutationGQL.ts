import gql from "graphql-tag";

export const userLoginMutationGQL = gql`
  mutation userLogin($email: String!, $password: String!) {
    userLogin(data: { email: $email, password: $password }) {
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

export default userLoginMutationGQL;
