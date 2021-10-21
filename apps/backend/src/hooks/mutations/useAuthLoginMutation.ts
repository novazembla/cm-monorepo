import { authLoginMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";
import { useAuthentication, useConfig } from "~/hooks";
import { authentication } from "~/services";

export const useAuthLoginMutation = () => {
  const config = useConfig();
  const [, { login, logout }] = useAuthentication();

  const [mutation, mutationResults] = useMutation(authLoginMutationGQL, {
    onCompleted: (data) => {
      if (
        data?.authLogin?.tokens?.access &&
        data?.authLogin?.tokens?.preview &&
        data?.authLogin?.tokens?.refresh
      ) {
        const payload = authentication.getTokenPayload(
          data.authLogin.tokens.access
        );
        const payloadPreview = authentication.getTokenPayload(
          data.authLogin.tokens.preview
        );
        if (payload && payloadPreview) {
          authentication.setAuthToken(data.authLogin.tokens.access);
          authentication.setPreviewToken(data.authLogin.tokens.preview);
          authentication.setRefreshCookie(data.authLogin.tokens.refresh);
          login(payload.user);
        }
      }
    },
  });

  // full login function
  const execute = async (email: string, password: string) => {
    console.log("logout() useAuthLoginMutation");
    await logout();

    return mutation({
      variables: {
        scope: config.scope,
        email,
        password,
      },
    });
  };
  return [execute, mutationResults] as const;
};
