import gql from "graphql-tag";

export const usersQueryGQL = gql`
  query users($where: JSON, $orderBy: JSON, $page: Int, $pageSize: Int) {
    users(where: $where, orderBy: $orderBy, page: $page, pageSize: $pageSize) {
      users {
        id
        firstName
        lastName
        email
        emailVerified
        role
        userBanned
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

export default usersQueryGQL;
