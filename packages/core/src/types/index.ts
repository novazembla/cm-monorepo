export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export type AppScopes = "frontend" | "backend" | "api";
