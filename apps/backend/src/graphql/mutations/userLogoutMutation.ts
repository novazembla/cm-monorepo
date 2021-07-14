import gql from "graphql-tag";
import { useMutation } from "@apollo/client";
import { useAuthentication } from "../../hooks";

export const userLogoutMutationGQL = gql`
  mutation userLogout($userId: Int!) {
    userLogout(data: { userId: $userId })
  }
`;

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
