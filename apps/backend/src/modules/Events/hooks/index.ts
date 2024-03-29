import {
  eventCreateMutationGQL,
  dataExportCreateMutationGQL,
  eventUpdateMutationGQL,
  dataImportCreateMutationGQL,
  dataImportUpdateMutationGQL,
} from "@culturemap/core";
import { useMutation } from "@apollo/client";

export const useEventCreateMutation = () => {
  const [mutation, mutationResults] = useMutation(eventCreateMutationGQL, {
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

export const useEventUpdateMutation = () => {
  const [mutation, mutationResults] = useMutation(eventUpdateMutationGQL, {
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
