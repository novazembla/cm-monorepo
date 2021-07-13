import gql from "graphql-tag";
import { useMutation } from "@apollo/client";
import { useAuthToken, useAuthUser } from "../../hooks";

export const loginMutationGQL = gql`
  mutation userLogin($email: String!, $password: String!) {
    userLogin(data: { email: $email, password: $password }) {
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

export const useLoginMutation = () => {
  const [, getTokenPayload , setAuthToken, , setRefreshCookie] = useAuthToken();
  const [, , login, logout] = useAuthUser();

  const [mutation, mutationResults] = useMutation(loginMutationGQL, {
    onCompleted: (data) => {
      // TODO: xxx find out if data sanity check is needed? 

      console.log("Login 1");
      if (
        data?.userLogin?.tokens?.access &&
        data?.userLogin?.tokens?.refresh
      ) {

        
        const payload = getTokenPayload(data.userLogin.tokens.access);

        console.log("Login 2, check payload", payload);

        if (payload) {
          console.log("Login 3, set access token");
          setAuthToken(data.userLogin.tokens.access);
          setRefreshCookie(data.userLogin.tokens.refresh)
          login(payload.user);
        }
      }
    },
  });

  // full login function
  const execute = (email: string, password: string) => {
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
