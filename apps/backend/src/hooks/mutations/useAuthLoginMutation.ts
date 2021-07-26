import { authLoginMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";
import { useAuthentication } from "..";
import { authentication } from "~/services";


export const useAuthLoginMutation = () => {
  const [, { login, logout }] = useAuthentication();

  const [mutation, mutationResults] = useMutation(authLoginMutationGQL, {
    onCompleted: (data) => {

      console.log("authLoginMutationGQL completed");
      // TODO: xxx find out if data sanity check is needed?
       
      if (data?.authLogin?.tokens?.access && data?.authLogin?.tokens?.refresh) {
        const payload = authentication.getTokenPayload(data.authLogin.tokens.access);

        if (payload) {
          authentication.setAuthToken(data.authLogin.tokens.access);
          authentication.setRefreshCookie(data.authLogin.tokens.refresh);
          console.log("aboutToTrigger Login");
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
