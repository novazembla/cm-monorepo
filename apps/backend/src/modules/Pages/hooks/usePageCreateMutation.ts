import { pageCreateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const usePageCreateMutation = () => {
  const [mutation, mutationResults] = useMutation(pageCreateMutationGQL, {
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
