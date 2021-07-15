import { userLogoutMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";
import { useAuthentication } from "..";


export const useUserLogoutMutation = () => {
  const [, { logout }] = useAuthentication();

  const [mutation, mutationResults] = useMutation(userLogoutMutationGQL, {
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
