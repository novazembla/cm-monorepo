import { authConfirmationEmailRequestMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useAuthConfirmationEmailRequest = () => {
  const [mutation, mutationResults] = useMutation(authConfirmationEmailRequestMutationGQL);

  const execute = (userId: number) => {
    return mutation({
      variables: {
        scope: "backend",
        userId,
      },
    });
  };
  return [execute, mutationResults] as const;
};
