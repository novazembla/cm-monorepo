import { taxonomyCreateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useTaxonomyCreateMutation = () => {
  const [mutation, mutationResults] = useMutation(taxonomyCreateMutationGQL, {
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
