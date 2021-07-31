import { userProfileUpdateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

import { useConfig } from "~/hooks";

export const useUserProfileUpdateMutation = () => {
  const config = useConfig();
  const [mutation, mutationResults] = useMutation(userProfileUpdateMutationGQL, {
    // onCompleted: (data) => {},
  });

  const execute = (userId: number, data: any) => {
    return mutation({
      variables: {
        userId, 
        scope: config.scope,
        ...data,
      }
    });
  };
  return [execute, mutationResults] as const;
};
