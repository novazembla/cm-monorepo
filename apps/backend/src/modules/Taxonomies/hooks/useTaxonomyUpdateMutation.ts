import { taxonomyUpdateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useTaxonomyUpdateMutation = () => {
  const [mutation, mutationResults] = useMutation(taxonomyUpdateMutationGQL, {
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
