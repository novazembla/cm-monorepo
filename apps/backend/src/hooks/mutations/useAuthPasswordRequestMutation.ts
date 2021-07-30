import { authPasswordRequestMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

import { CMConfig } from "~/config";

export const useAuthPasswordRequestMutation = () => {
  const [mutation, mutationResults] = useMutation(authPasswordRequestMutationGQL);

  const execute = (email: string) => {
    return mutation({
      variables: {
        scope: CMConfig.scope,
        email,
      },
    });
  };
  return [execute, mutationResults] as const;
};
