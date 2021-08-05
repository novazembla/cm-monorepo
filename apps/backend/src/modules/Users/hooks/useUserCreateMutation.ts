import { userCreateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

import { useConfig } from "~/hooks";

export const useUserCreateMutation = () => {
  const config = useConfig();
  const [mutation, mutationResults] = useMutation(userCreateMutationGQL, {
    // onCompleted: (data) => {},
  });

  const execute = (data: any) => {
    return mutation({
      variables: {
        scope: config.scope,
        data,
      }
    });
  };
  return [execute, mutationResults] as const;
};
