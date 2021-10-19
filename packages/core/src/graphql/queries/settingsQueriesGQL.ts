import gql from "graphql-tag";

export const settingsQueryGQL = gql`
  query settings($scope: String!) {
    settings(scope: $scope) {
      id
      key
      value
      createdAt
      updatedAt
    }
    modules {
      key
      withTaxonomies
    }
  }
`;

export default settingsQueryGQL;
