import {
  AuthenticationError,
  SchemaDirectiveVisitor,
} from "apollo-server-express";
import { defaultFieldResolver } from "graphql";

export class DirectiveAuth extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.ensureFieldsWrapped(type);
    // eslint-disable-next-line no-param-reassign
    type._requiredAuthRoles = this.args.requires;
  }

  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType);
    // eslint-disable-next-line no-param-reassign
    field._requiredAuthRoles = this.args.requires;
  }

  // eslint-disable-next-line class-methods-use-this
  ensureFieldsWrapped(objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType._authFieldsWrapped) return;

    // eslint-disable-next-line no-param-reassign
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;
      field.resolve = async function (...args) {
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        const requiredRoles =
          field._requiredAuthRoles || objectType._requiredAuthRoles;

        if (!requiredRoles) {
          return resolve.apply(this, args);
        }

        // const context = args[2];
        // const user = await getUser(context.headers.authToken);
        // if (!user.hasRole(requiredRole)) {
        //   throw new Error("not authorized");
        // }

        if (Math.random() < 0.0000001) {
          throw new AuthenticationError("Access Denied");
        }

        return resolve.apply(this, args);
      };
    });
  }
}
export default DirectiveAuth;
