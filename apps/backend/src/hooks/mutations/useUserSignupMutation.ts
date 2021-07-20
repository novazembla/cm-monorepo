import { userSignupMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";
import { useAuthentication } from "..";
import { authentication } from "../../services";


export const useUserSignupMutation = () => {
  const [, { login, logout }] = useAuthentication();

  const [mutation, mutationResults] = useMutation(userSignupMutationGQL, {
    onCompleted: (data) => {

      console.log("Signup payload", data);
      // TODO: xxx find out if data sanity check is needed?

      if (data?.userSignup?.tokens?.access && data?.userSignup?.tokens?.refresh) {
        const payload = authentication.getTokenPayload(data.userSignup.tokens.access);

        if (payload) {
          authentication.setAuthToken(data.userSignup.tokens.access);
          authentication.setRefreshCookie(data.userSignup.tokens.refresh);
          login(payload.user);
        }
      }
    },
  });

  // full login function
  const execute = (data: any) => {
    logout();
    return mutation({
      variables: data,
    });
  };
  return [execute, mutationResults] as const;
};
