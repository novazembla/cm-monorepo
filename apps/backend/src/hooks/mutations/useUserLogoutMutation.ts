import { userLogoutMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";
import { useAuthentication } from "..";


export const useUserLogoutMutation = () => {
  const [, { logout }] = useAuthentication();

  const [mutation, mutationResults] = useMutation(userLogoutMutationGQL, {
    onCompleted: (data) => {
      console.log("logout completed");
      console.log("about to trigger logout");
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