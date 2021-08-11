import { locationCreateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useLocationCreateMutation = () => {
  const [mutation, mutationResults] = useMutation(locationCreateMutationGQL, {
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
