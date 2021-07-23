import gql from "graphql-tag";

export const authConfirmEmailMutationGQL = gql`
  mutation authConfirmEmail($token: String!) {
    authConfirmEmail(token: $token) {
      result
    }
  }
`;

export default authConfirmEmailMutationGQL;
