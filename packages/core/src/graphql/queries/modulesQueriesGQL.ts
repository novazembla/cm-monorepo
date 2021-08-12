import gql from "graphql-tag";

export const modulesQueryGQL = gql`
  query modules {
    modules {
      id
      key
      name
      createdAt
      updatedAt
    }
  }
`;

export default modulesQueryGQL;
