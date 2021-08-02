import { Box } from "@chakra-ui/react";

export const Map = ({ lat, lng }: { lat: number; lng: number }) => {
  return (
    <Box w="100%" height={200}>
      <b>{lat}</b>/<b>{lng}</b>
    </Box>
  );
};
