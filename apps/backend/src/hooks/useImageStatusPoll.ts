import { useEffect, useState } from "react";
import { imageStatusGQL, ImageStatus } from "@culturemap/core";
import { useLazyQuery } from "@apollo/client";
import type { ApiImageMetaInformation } from "@culturemap/core";

type PollingState = {
  status: undefined | ImageStatus;
  meta: ApiImageMetaInformation | undefined;
};

const defaultState: PollingState = {
  status: undefined,
  meta: undefined,
};

const pollingIntervalMs = 5000;

export const useImageStatusPoll = (
  id: number | undefined,
  status: ImageStatus | undefined
): [undefined | ImageStatus, undefined | ApiImageMetaInformation] => {
  const [statusInformation, setStatusInformation] = useState(defaultState);

  const [triggerPoll, { data, loading, error }] = useLazyQuery(imageStatusGQL, {
    variables: {
      id,
    },
  });

  let runPoll = true;

  const pollData = data?.imageStatus;

  if (
    !id ||
    status === ImageStatus.READY ||
    status === ImageStatus.ERROR ||
    (pollData &&
      (pollData?.status === ImageStatus.READY ||
        pollData?.status === ImageStatus.ERROR))
  )
    runPoll = false;

  if (error) {
    if (statusInformation.status !== ImageStatus.ERROR) {
      setStatusInformation({
        status: ImageStatus.ERROR,
        meta: undefined,
      });
    }

    runPoll = false;
  } else if (!loading && pollData) {
    if (
      pollData?.id &&
      pollData?.status &&
      pollData?.status !== status
    ) {
      if (pollData?.status !== statusInformation.status) {
        setStatusInformation({
          status: pollData?.status,
          meta: pollData?.meta,
        });
      }

      if (
        pollData?.status === ImageStatus.READY ||
        pollData?.status === ImageStatus.ERROR
      ) {
        runPoll = false;
      }
    }
  }

  useEffect(() => {
    let intervalTimeout: ReturnType<typeof setInterval>;

    if (runPoll)
      intervalTimeout = setInterval(() => {
        triggerPoll();
      }, pollingIntervalMs);

    return () => {
      if (intervalTimeout) {
        clearInterval(intervalTimeout);
      }
        
    };
  }, [runPoll, triggerPoll]);

  return [statusInformation.status, statusInformation.meta];
};
