import React from 'react'
import { Box } from "@chakra-ui/react";
import { InlineLanguageButtons } from ".";

export const FixedLanguageButtons = () => {
  return (
    <Box position="fixed" bottom={{base:4, t:5, d:6}} left={{base:2, t:4, d:6}} >
      <InlineLanguageButtons/>
    </Box>
  )
}

