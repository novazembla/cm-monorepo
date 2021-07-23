import gql from "graphql-tag";

export const authLogoutMutationGQL = gql`
  mutation authLogout($userId: Int!) {
    authLogout(userId: $userId) {
      result
    }
  }
`;

export default authLogoutMutationGQL;
