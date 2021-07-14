import gql from "graphql-tag";
import { useMutation } from "@apollo/client";
import { useAuthentication } from "../../hooks";
import { authentication } from "../../services";
export const userLoginMutationGQL = gql`
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

export const useUserLoginMutation = () => {
  const [, { login, logout }] = useAuthentication();

  const [mutation, mutationResults] = useMutation(userLoginMutationGQL, {
    onCompleted: (data) => {
      // TODO: xxx find out if data sanity check is needed?

      if (data?.userLogin?.tokens?.access && data?.userLogin?.tokens?.refresh) {
        const payload = authentication.getTokenPayload(data.userLogin.tokens.access);

        if (payload) {
          authentication.setAuthToken(data.userLogin.tokens.access);
          authentication.setRefreshCookie(data.userLogin.tokens.refresh);
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
