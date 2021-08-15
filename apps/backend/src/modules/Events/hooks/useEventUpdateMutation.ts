import { eventUpdateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useEventUpdateMutation = () => {
  const [mutation, mutationResults] = useMutation(eventUpdateMutationGQL, {
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
