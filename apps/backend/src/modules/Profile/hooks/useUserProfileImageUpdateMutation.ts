import { userProfileImageUpdateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

import { useConfig } from "~/hooks";

export const useUserProfileImageUpdateMutation = () => {
  const config = useConfig();
  const [mutation, mutationResults] = useMutation(userProfileImageUpdateMutationGQL, {
    // onCompleted: (data) => {},
  });

  const execute = (id: number, data: any) => {
    return mutation({
      variables: {
        id, 
        scope: config.scope,
        data,
      }
    });
  };
  return [execute, mutationResults] as const;
};
