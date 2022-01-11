export const reactSelectTheme = (theme: any) => {
  // console.log(theme);
  return {
    ...theme,
    borderRadius: 4,
    colors: {
      ...theme.colors,
      primary: "var(--chakra-colors-gray-400)",
      primary25: "var(--chakra-colors-wine-100)",
      primary50: "var(--chakra-colors-wine-200)",
      primary75: "var(--chakra-colors-wine-300)",
    },
  };
};
