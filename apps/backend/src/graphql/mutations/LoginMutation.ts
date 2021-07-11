import gql from "graphql-tag";
import { useMutation } from "@apollo/client";
//import { useAuthToken } from "../config/auth";

export const loginMutationGQL = gql`
  mutation userLogin($email: String!, $password: String!) {
    userLogin(data: { email: $email, password: $password }) {
      user {
        id
        firstName
        lastName 
        email
      }
    }
  }
`;

export const useLoginMutation = () => {
  // /const [_, setAuthToken, removeAuthtoken] = useAuthToken();

  const [mutation, mutationResults] = useMutation(loginMutationGQL, {
    onCompleted: (data) => {
      // xxx setAuthToken(data.login.jwt);
    },
  });

  // full login function
  const login = (email: string, password: string) => {
    // removeAuthtoken();
    return mutation({
      variables: {
        email,
        password,
      },
    });
  };
  return [login, mutationResults] as const;
};
