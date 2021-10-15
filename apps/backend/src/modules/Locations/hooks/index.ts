import {
  locationUpdateMutationGQL,
  locationCreateMutationGQL,
  importCreateMutationGQL,
  importUpdateMutationGQL,
  locationExportCreateMutationGQL,
} from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useLocationCreateMutation = () => {
  const [mutation, mutationResults] = useMutation(locationCreateMutationGQL, {
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

export const useLocationUpdateMutation = () => {
  const [mutation, mutationResults] = useMutation(locationUpdateMutationGQL, {
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

export const useImportCreateMutation = () => {
  const [mutation, mutationResults] = useMutation(importCreateMutationGQL, {
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

export const useImportUpdateMutation = () => {
  const [mutation, mutationResults] = useMutation(importUpdateMutationGQL, {
    // onCompleted: (data) => {},
  });

  const execute = (id: number, data: any) => {
    return mutation({
      variables: {
        id,
        data,
      },
    });
  };
  return [execute, mutationResults] as const;
};


export const useLocationExportCreateMutation = () => {
  const [mutation, mutationResults] = useMutation(locationExportCreateMutationGQL, {
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
