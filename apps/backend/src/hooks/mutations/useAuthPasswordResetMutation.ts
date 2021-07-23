import { authPasswordResetMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useAuthPasswordResetMutation = () => {
  const [mutation, mutationResults] = useMutation(authPasswordResetMutationGQL);

  const execute = (password: string, token: string) => {
    return mutation({
      variables: {
        password,
        token
      },
    });
  };
  return [execute, mutationResults] as const;
};
