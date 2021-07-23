import { authConfirmEmailMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useAuthConfirmEmailMutation = () => {
  const [mutation, mutationResults] = useMutation(authConfirmEmailMutationGQL);

  // full login function
  const execute = (token: string) => {
    return mutation({
      variables: {
        token,
      },
    });
  };
  return [execute, mutationResults] as const;
};
