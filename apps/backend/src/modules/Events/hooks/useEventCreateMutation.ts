import { eventCreateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useEventCreateMutation = () => {
  const [mutation, mutationResults] = useMutation(eventCreateMutationGQL, {
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
