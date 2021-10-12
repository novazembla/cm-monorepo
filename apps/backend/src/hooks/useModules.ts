import { useTypedSelector } from ".";

export const useModules = (): Record<string, {
  id: number,
  key: string;
  withTaxonomies: boolean;
}> => {
  const { modules } = useTypedSelector(({ modules }) => modules);

  return modules;
};
