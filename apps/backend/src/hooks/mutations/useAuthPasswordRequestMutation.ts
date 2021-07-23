import { authPasswordRequestMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useAuthPasswordRequestMutation = () => {
  const [mutation, mutationResults] = useMutation(authPasswordRequestMutationGQL);

  const execute = (email: string) => {
    return mutation({
      variables: {
        scope: "backend",
        email,
      },
    });
  };
  return [execute, mutationResults] as const;
};
