
export type Complete<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>> ? T[P] : (T[P] | undefined);
}

export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export type MutationProgressInfo = {
  total: number;
  loaded: number;
  percent: string;
}

export type AppModule = {
  key: string;
  name: Record<string, string>
  withTaxonomies: boolean;
}

