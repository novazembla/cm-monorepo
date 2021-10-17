import { pageUpdateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const usePageUpdateMutation = () => {
  const [mutation, mutationResults] = useMutation(pageUpdateMutationGQL, {
    // onCompleted: (data) => {},
  });

  const execute = (id: number, data: any) => {
    return mutation({
      variables: {
        id,
        data,
      },
    });
  };
  return [execute, mutationResults] as const;
};
