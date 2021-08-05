import { userUpdateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

import { useConfig } from "~/hooks";

export const useUserUpdateMutation = () => {
  const config = useConfig();
  const [mutation, mutationResults] = useMutation(userUpdateMutationGQL, {
    // onCompleted: (data) => {},
  });

  const execute = (userId: number, data: any) => {
    return mutation({
      variables: {
        userId, 
        scope: config.scope,
        data,
      }
    });
  };
  return [execute, mutationResults] as const;
};
