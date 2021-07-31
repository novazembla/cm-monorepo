import { userProfilePasswordUpdateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

import { useConfig } from "~/hooks";

export const useUserProfilePasswordUpdateMutation = () => {
  const config = useConfig();
  const [mutation, mutationResults] = useMutation(userProfilePasswordUpdateMutationGQL, {
    // onCompleted: (data) => {},
  });

  const execute = (userId: number, password: string) => {
    return mutation({
      variables: {
        scope: config.scope,
        userId, 
        password,
      }
    });
  };
  return [execute, mutationResults] as const;
};
