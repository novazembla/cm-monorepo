import gql from "graphql-tag";

export const authRefreshMutationGQL = gql`
  mutation authRefresh {
    authRefresh {
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

export default authRefreshMutationGQL;
