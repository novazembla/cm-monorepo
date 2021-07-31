import { authRequestEmailVerificationEmailMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

import { useConfig } from "~/hooks";

export const useAuthRequestEmailVerificationEmail = () => {
  const config = useConfig();
  const [mutation, mutationResults] = useMutation(authRequestEmailVerificationEmailMutationGQL);

  const execute = (userId: number) => {
    return mutation({
      variables: {
        scope: config.scope,
        userId,
      },
    });
  };
  return [execute, mutationResults] as const;
};
