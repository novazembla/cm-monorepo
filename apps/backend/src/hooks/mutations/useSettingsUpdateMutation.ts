import { settingsUpdateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useSettingsUpdateMutation = () => {
  const [mutation, mutationResults] = useMutation(settingsUpdateMutationGQL, {
    // onCompleted: (data) => {},
  });

  const execute = (data: any) => {
    return mutation({
      variables: {
        data,
      }
    });
  };
  return [execute, mutationResults] as const;
};
