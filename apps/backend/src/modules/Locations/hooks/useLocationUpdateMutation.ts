import { locationUpdateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useLocationUpdateMutation = () => {
  const [mutation, mutationResults] = useMutation(locationUpdateMutationGQL, {
    // onCompleted: (data) => {},
  });

  const execute = (id: number, data: any) => {
    return mutation({
      variables: {
        id, 
        data,
      }
    });
  };
  return [execute, mutationResults] as const;
};
