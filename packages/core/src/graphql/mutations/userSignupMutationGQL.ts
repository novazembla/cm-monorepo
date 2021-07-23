import gql from "graphql-tag";

export const userSignupMutationGQL = gql`
  mutation userSignup(
    $scope: String!
    $firstName: String!
    $lastName: String!
    $email: String!
    $password: String!
    $acceptedTerms: Boolean!
  ) {
    userSignup(
      scope: $scope
      data: {
        firstName: $firstName
        lastName: $lastName
        email: $email
        password: $password
        acceptedTerms: $acceptedTerms
      }
    ) {
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

export default userSignupMutationGQL;
