import { authRequestEmailVerificationEmailMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

import { CMConfig } from "~/config";

export const useAuthRequestEmailVerificationEmail = () => {
  const [mutation, mutationResults] = useMutation(authRequestEmailVerificationEmailMutationGQL);

  const execute = (userId: number) => {
    return mutation({
      variables: {
        scope: CMConfig.scope,
        userId,
      },
    });
  };
  return [execute, mutationResults] as const;
};
