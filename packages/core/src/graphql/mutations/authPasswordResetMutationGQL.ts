import gql from "graphql-tag";

export const authPasswordResetMutationGQL = gql`
  mutation authPasswordReset($password: String!, $token: String!) {
    authPasswordReset(password: $password, token: $token) {
      result
    }
  }
`;

export default authPasswordResetMutationGQL;
