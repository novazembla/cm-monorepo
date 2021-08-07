import gql from "graphql-tag";

export const settingsQueryGQL = gql`
  query settings {
    settings {
      id
      key
      value
      createdAt
      updatedAt
    }
  }
`;

export default settingsQueryGQL;
