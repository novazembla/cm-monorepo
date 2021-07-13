import gql from "graphql-tag";
import { useMutation } from "@apollo/client";
import { useAuthUser } from "../../hooks";

export const logoutMutationGQL = gql`
  mutation userLogout($userId: Int!) {
    userLogout(data: { userId: $userId })
  }
`;

export const useLogoutMutation = () => {
  const [, , , logout] = useAuthUser();

  const [mutation, mutationResults] = useMutation(logoutMutationGQL, {
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
