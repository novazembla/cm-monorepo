import { termUpdateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useTermUpdateMutation = () => {
  const [mutation, mutationResults] = useMutation(termUpdateMutationGQL, {
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
