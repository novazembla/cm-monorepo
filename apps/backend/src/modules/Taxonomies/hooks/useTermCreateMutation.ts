import { termCreateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useTermCreateMutation = () => {
  const [mutation, mutationResults] = useMutation(termCreateMutationGQL, {
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
