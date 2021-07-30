import gql from "graphql-tag";

export const authVerifyEmailMutationGQL = gql`
  mutation authVerifyEmail($token: String!) {
    authVerifyEmail(token: $token) {
      result
    }
  }
`;

export default authVerifyEmailMutationGQL;
