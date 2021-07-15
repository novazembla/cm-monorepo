import gql from "graphql-tag";

export const userRefreshMutationGQL = gql`
  mutation userRefresh {
    userRefresh {
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

export default userRefreshMutationGQL;
