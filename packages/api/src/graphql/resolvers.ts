import { queryUsers } from "../dao/user";
import { registerNewUser } from "../services/user";
import { loginUserWithEmailAndPassword, logout } from "../services/auth";

const resolvers = {
  Query: {
    /* parent, args, context, info */
    users: (...args) => queryUsers(args[1]),
  },
  Mutation: {
    userSignup: async (...args) => {
      const { data } = args[1];
      return registerNewUser(data);
    },
    userLogin: async (...args) => {
      const {
        data: { email, password },
      } = args[1];

      return loginUserWithEmailAndPassword(email, password);
    },
    userLogout: async (...args) => {
      const {
        data: { userId },
      } = args[1];

      return logout(userId);
    },
  },
};

export default resolvers;
