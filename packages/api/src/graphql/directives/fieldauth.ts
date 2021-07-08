import {
  AuthenticationError,
  SchemaDirectiveVisitor,
} from "apollo-server-express";
import { defaultFieldResolver, GraphQLField } from "graphql";

export class DirectiveFieldAuth extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<any, any>) {
    const requiredRole = this.args.requires;
    const originalResolve = field.resolve || defaultFieldResolver;

    // eslint-disable-next-line no-param-reassign
    field.resolve = function (...args) {
      const context = args[2];
      const user = context.getUser() || {};
      const isAuthorized = user.role === requiredRole;
      if (!isAuthorized) {
        throw new AuthenticationError(`Field access denied!`);
      }
      return originalResolve.apply(this, args);
    };
  }
}
export default DirectiveFieldAuth;
