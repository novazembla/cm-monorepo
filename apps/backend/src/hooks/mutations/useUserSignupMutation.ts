import { userSignupMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";
import { useAuthentication } from "..";
import { authentication } from "~/services";

import { useConfig } from "~/hooks";

export const useUserSignupMutation = () => {
  const config = useConfig();
  const [apiUser, { login }] = useAuthentication();

  const [mutation, mutationResults] = useMutation(userSignupMutationGQL, {
    onCompleted: (data) => {

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
  // data should probably not be "Any" TODO: 
  const execute = (data: any) => {
    if (apiUser)
      throw Error("You're already logged in");
  
    return mutation({
      variables: {
        scope: config.scope,
        ...data,
      }
    });
  };
  return [execute, mutationResults] as const;
};
