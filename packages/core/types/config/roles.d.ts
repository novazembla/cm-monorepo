export declare type RoleNames = "administrator" | "editor" | "contributor";
export interface Role {
    name: RoleNames;
}
export interface Roles {
    roles: Array<Role>;
    add: (name: string) => void;
}
export declare const roles: Roles;
export default roles;
