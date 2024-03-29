import { userSignupMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";
import { useAuthentication } from "..";
import { authentication } from "~/services";

import { useConfig } from "~/hooks";

export const useUserSignupMutation = () => {
  const config = useConfig();
  const [appUser, { login }] = useAuthentication();

  const [mutation, mutationResults] = useMutation(userSignupMutationGQL, {
    onCompleted: (data) => {
      if (
        data?.userSignup?.tokens?.access &&
        data?.userSignup?.tokens?.preview &&
        data?.userSignup?.tokens?.refresh
      ) {
        const payload = authentication.getTokenPayload(
          data.userSignup.tokens.access
        );
        const payloadPreview = authentication.getTokenPayload(
          data.userSignup.tokens.preview
        );

        if (payload && payloadPreview) {
          authentication.setAuthToken(data.userSignup.tokens.access);
          authentication.setPreviewToken(data.userSignup.tokens.preview);
          authentication.setRefreshCookie(data.userSignup.tokens.refresh);
          login(payload.user);
        }
      }
    },
  });

  const execute = (data: any) => {
    if (appUser) throw Error("You're already logged in");

    return mutation({
      variables: {
        scope: config.scope,
        ...data,
      },
    });
  };
  return [execute, mutationResults] as const;
};
