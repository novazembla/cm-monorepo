import gql from "graphql-tag";
import { useMutation } from "@apollo/client";
import { useAuthToken, useAuthUser } from "../../hooks";

export const loginMutationGQL = gql`
  mutation userLogin($email: String!, $password: String!) {
    userLogin(data: { email: $email, password: $password }) {
      user {
        id
        firstName
        lastName
        email
      }
      tokens {
        access {
          token
          expires
        }
        refresh {
          token
          expires
        }
      }
    }
  }
`;

export const useLoginMutation = () => {
  const [, setAuthToken, , setRefreshToken, removeAuthToken, removeRefreshToken] = useAuthToken();
  const [, , login, logout] = useAuthUser();

  const [mutation, mutationResults] = useMutation(loginMutationGQL, {
    onCompleted: (data) => {
      // TODO: xxx find out if data sanity check is needed? 
      if (
        data?.userLogin?.user &&
        data?.userLogin?.tokens?.access &&
        data?.userLogin?.tokens?.refresh
      ) {
        login({
          id: data.userLogin.user.id,
          roles: data.userLogin.user.roles,
          permissions: data.userLogin.user.permissions,
        });
        setAuthToken({
          token: data.userLogin.tokens.access.token,
          expires: data.userLogin.tokens.access.expires,
        });

        setRefreshToken({
          token: data.userLogin.tokens.refresh.token,
          expires: data.userLogin.tokens.refresh.expires,
        });
      }
    },
  });

  // full login function
  const execute = (email: string, password: string) => {
    removeAuthToken();
    removeRefreshToken();
    logout();
    return mutation({
      variables: {
        email,
        password,
      },
    });
  };
  return [execute, mutationResults] as const;
};
