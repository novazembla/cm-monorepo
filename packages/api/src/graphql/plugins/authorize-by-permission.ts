import { plugin } from "nexus";
import { AuthenticationError } from "apollo-server-express";

// eslint-disable-next-line import/extensions
import { printedGenTyping } from "nexus/dist/utils.js"; // deep linking into other modules need extensions

const fieldDefTypes = printedGenTyping({
  optional: true,
  name: "permissions",
  description: `Does the object require certain access permissios? If permissions are set the server 
checks if the current request is being done by an authenticated user holding one of the configured 
permissions. Use https://nexusjs.org/docs/plugins/field-authorize to provide field level access 
restrictions.`,
  type: "[string]",
});

const rootNames = ["Query", "Mutation", "Subscription"];

export const AuthorizeByPermissionsPlugin = () => {
  return plugin({
    name: "AuthorizeByPermissionsPlugin",
    objectTypeDefTypes: fieldDefTypes,
    fieldDefTypes,
    onCreateFieldResolver(config) {
      const isConnectedToRoot = rootNames.includes(
        config.parentTypeConfig.name
      );

      const permissions: string[] | null =
        config.fieldConfig.extensions?.nexus?.config?.permissions;

      // TODO: remove plugin .... console.log(config.fieldConfig.extensions?.nexus);

      if (
        !isConnectedToRoot ||
        !Array.isArray(permissions) ||
        permissions.length === 0
      ) {
        return undefined;
      }

      return async (root, args, ctx, info, next) => {
        const isAuth =
          ctx.apiUser &&
          typeof ctx.apiUser.can === "function" &&
          ctx.apiUser.can(permissions);

        if (!isAuth) throw new AuthenticationError("Object access denied");

        return next(root, args, ctx, info);
      };
    },
  });
};

export default AuthorizeByPermissionsPlugin;
