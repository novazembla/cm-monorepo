import { useTypedSelector } from ".";

export const useModules = (): Record<string, {
  key: string;
  withTaxonomies: boolean;
}> => {
  const { modules } = useTypedSelector(({ modules }) => modules);

  return modules;
};
