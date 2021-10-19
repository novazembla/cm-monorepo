import {
  locationUpdateMutationGQL,
  locationCreateMutationGQL,
  dataImportCreateMutationGQL,
  dataImportUpdateMutationGQL,
  dataExportCreateMutationGQL,
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

  const execute = (id: number, data: any) => {
    return mutation({
      variables: {
        id,
        data
      },
    });
  };
  return [execute, mutationResults] as const;
};

export const useImportCreateMutation = () => {
  const [mutation, mutationResults] = useMutation(dataImportCreateMutationGQL, {
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
  const [mutation, mutationResults] = useMutation(dataImportUpdateMutationGQL, {
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


export const useDataExportCreateMutation = () => {
  const [mutation, mutationResults] = useMutation(dataExportCreateMutationGQL, {
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
