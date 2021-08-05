import { userDeleteMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

import { useConfig } from "~/hooks";

export const useUserDeleteMutation = () => {
  const config = useConfig();
  const [mutation, mutationResults] = useMutation(userDeleteMutationGQL, {
    // onCompleted: (data) => {},
  });

  const execute = (userId: number) => {
    return mutation({
      variables: {
        userId, 
        scope: config.scope,
      }
    });
  };
  return [execute, mutationResults] as const;
};
