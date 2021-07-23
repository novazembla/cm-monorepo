import { authLogoutMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";
import { useAuthentication } from "..";


export const useAuthLogoutMutation = () => {
  const [, { logout }] = useAuthentication();

  const [mutation, mutationResults] = useMutation(authLogoutMutationGQL, {
    onCompleted: (data) => {
      logout();
    },
  });

  // full login function
  const execute = (userId: number) => {
    return mutation({
      variables: {
        userId,
      },
    });
  };
  return [execute, mutationResults] as const;
};
