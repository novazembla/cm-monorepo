export type RoleNames = "administrator" | "editor" | "contributor";

export interface Role {
  name: RoleNames;
}

export interface Roles {
  roles: Array<Role>;
  add: (name: string) => void;
}
export const roles: Roles = {
  roles: [],
  add(name: string) {
    this.roles.push(name);
  },
};
roles.add("administrator");
roles.add("editor");
roles.add("contributor");

export default roles;
