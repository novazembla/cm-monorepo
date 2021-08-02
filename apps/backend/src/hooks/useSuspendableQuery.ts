import { ApolloQueryResult } from "@apollo/client";
import { useApolloClient } from ".";

const suspend = <TData = any>(promise: Promise<ApolloQueryResult<TData>>) => {
  let status = "pending";
  let response: ApolloQueryResult<TData>;

  const suspender = promise.then(
    (res) => {
      status = "success";
      response = res;
    },
    (err) => {
      status = "error";
      response = err;
    }
  );

  const read = () => {
    switch (status) {
      case "pending":
        throw suspender;
      case "error":
        throw response;
      default:
        return response;
    }
  };
  return { read };
};

export const useSuspendableQuery = ({
  query,
  options,
}: {
  query: any;
  options?: any;
}) => {
  const client = useApolloClient();
  const gqlQuery = client.query({ query, ...options });

  return suspend(gqlQuery).read().data;
};
