// Defaults are defined here:
// https://github.com/chakra-ui/chakra-ui/tree/main/packages/theme/src/components

export const components = {
  Button: {
    baseStyle: {
      _focus: {
        boxShadow: "button-wine",
      },
    },
  },
  Checkbox: {
    baseStyle: {
      control: {
        borderColor:"gray.500",
      }
    }
  },
  Divider: {
    baseStyle: {
      borderColor: "gray.300",
      maxW: "80%",
      my: 6,
      mx: "auto"
    },
  },
  Input: {
    variants: {
      outline: {
        field: {
          bg: "#fff",
          borderColor: "gray.400",
          _hover: {
            borderColor: "gray.500",
          },
          _autofill: {
            bg: "#fefefe",
          },
        },
      },
    },
  },
  Link: {
    baseStyle: {
      color: "wine.400",
      _hover: {
        color: "wine.600"
      },
    },
  }
};
