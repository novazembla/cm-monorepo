import { user } from "../dao";

const resolvers = {
  Query: {
    /* parent, args, context, info */
    users: (...args) => user.queryUsers(args[1]),
  },
};

export default resolvers;
