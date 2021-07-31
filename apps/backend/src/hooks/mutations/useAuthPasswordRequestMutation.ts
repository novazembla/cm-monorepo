import { authPasswordRequestMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

import { useConfig } from "~/hooks";

export const useAuthPasswordRequestMutation = () => {
  const config = useConfig();
  const [mutation, mutationResults] = useMutation(authPasswordRequestMutationGQL);

  const execute = (email: string) => {
    return mutation({
      variables: {
        scope: config.scope,
        email,
      },
    });
  };
  return [execute, mutationResults] as const;
};
