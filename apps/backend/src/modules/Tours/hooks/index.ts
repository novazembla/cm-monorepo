import {
  tourStopUpdateMutationGQL,
  tourUpdateMutationGQL,
  tourCreateMutationGQL,
  tourStopCreateMutationGQL,
  tourReorderTourStopsMutationGQL,
} from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useTourCreateMutation = () => {
  const [mutation, mutationResults] = useMutation(tourCreateMutationGQL, {
    // onCompleted: (data) => {},
  });

  const execute = (data: any) => {
    return mutation({
      variables: {
        data,
      },
    });
  };
  return [execute, mutationResults] as const;
};

export const useTourUpdateMutation = () => {
  const [mutation, mutationResults] = useMutation(tourUpdateMutationGQL, {
    // onCompleted: (data) => {},
  });

  const execute = (id: number, data: any, imagesTranslations: any) => {
    return mutation({
      variables: {
        id,
        data,
        imagesTranslations,
      },
    });
  };
  return [execute, mutationResults] as const;
};

export const useTourReorderTourStopsMutation =() => {
  const [mutation, mutationResults] = useMutation(
    tourReorderTourStopsMutationGQL,
    {
      // onCompleted: (data) => {},
    }
  );

  const execute = (id: number, data: any[]) => {
    return mutation({
      variables: {
        id,
        data
      },
    });
  };
  return [execute, mutationResults] as const;
};

export const useTourStopCreateMutation = () => {
  const [mutation, mutationResults] = useMutation(tourStopCreateMutationGQL, {
    // onCompleted: (data) => {},
  });

  const execute = (data: any) => {
    return mutation({
      variables: {
        data,
      },
    });
  };
  return [execute, mutationResults] as const;
};

export const useTourStopUpdateMutation = () => {
  const [mutation, mutationResults] = useMutation(tourStopUpdateMutationGQL, {
    // onCompleted: (data) => {},
  });

  const execute = (id: number, data: any, imagesTranslations: any) => {
    return mutation({
      variables: {
        id,
        data,
        imagesTranslations,
      },
    });
  };
  return [execute, mutationResults] as const;
};
