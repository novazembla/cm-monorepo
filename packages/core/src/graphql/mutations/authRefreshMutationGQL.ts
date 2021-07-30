import gql from "graphql-tag";

export const authRefreshMutationGQL = gql`
  mutation authRefresh($scope: String!) {
    authRefresh(scope: $scope) {
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
