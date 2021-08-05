import gql from "graphql-tag";

export const userCreateMutationGQL = gql`
  mutation userCreate($scope: String!, $data: UserInsertInput!) {
    userCreate(scope: $scope, data: $data) {
      id
      firstName
      lastName
      email
    }
  }
`;

export default userCreateMutationGQL;
