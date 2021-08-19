import { eventUpdateMutationGQL } from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useEventUpdateMutation = () => {
  const [mutation, mutationResults] = useMutation(eventUpdateMutationGQL, {
    // onCompleted: (data) => {},
  });

  const execute = (id: number, data: any, imagesTranslations: any) => {
    return mutation({
      variables: {
        id, 
        data,
        imagesTranslations,
      }
    });
  };
  return [execute, mutationResults] as const;
};
