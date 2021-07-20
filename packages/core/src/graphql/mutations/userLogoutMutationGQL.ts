import gql from "graphql-tag";

export const userLogoutMutationGQL = gql`
  mutation userLogout($userId: Int!) {
    userLogout(data: { userId: $userId }) {
      result
    }
  }
`;

export default userLogoutMutationGQL;
