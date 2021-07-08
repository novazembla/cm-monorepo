import argon2 from "argon2";
import httpStatus from "http-status";
import { config } from "@culturemap/core";
import { getPrismaClient } from "../db/client";
import { ApiError, restrictJSONOutput } from "../utils";

const prisma = getPrismaClient();

export const checkIsEmailTaken = async (email, userId) => {
  const user = await prisma.user.findUnique({
    where: { email, id: userId },
  });
  return !!user;
};

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Object<User>}
 */
export const createUser = async (userBody) => {
  if (checkIsEmailTaken(userBody.email, 0)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  // TODO: this needs to be
  const user = await prisma.user.upsert({
    where: { email: userBody.email },
    update: {},
    create: {
      email: userBody.email,
      firstName: userBody.firstName,
      lastName: userBody.lastName,
      password: await argon2.hash(userBody.password),
    },
  });

  return restrictJSONOutput(user, config.db.privateJSONDataKeys.user);
};

/**
 * Query for users
 * @param {number} page - The current page
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
export const queryUsers = async ({ page, pageSize }) => {
  const users = await prisma.user.findMany({
    skip: page > 1 ? page * pageSize : 0,
    take: pageSize,
  });

  return restrictJSONOutput(users, config.db.privateJSONDataKeys.user);
};

/**
 * Get user by id
 * @param {Int} id
 * @returns {Object<User>}
 */
export const getUserById = async (id) => {
  return restrictJSONOutput(
    await prisma.user.findUnique({ where: { id } }),
    config.db.privateJSONDataKeys.user
  );
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Object<User>}
 */
export const getUserByEmail = async (email) => {
  return restrictJSONOutput(
    await prisma.user.findUnique({ where: { email } }),
    config.db.privateJSONDataKeys.user
  );
};

/**
 * Get user by login (email & password combination)
 * @param {string} email
 * @param {string} password
 * @returns {Object<User>}
 */
export const getUserByLogin = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await argon2.verify(user.password, password))) return null;

  return restrictJSONOutput(user, config.db.privateJSONDataKeys.user);
};

/**
 * Update user by id
 * @param {Integer} userId
 * @param {Object} updateBody
 * @returns {Object<User>}
 */
export const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (updateBody.email && checkIsEmailTaken(updateBody.email, userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }
  Object.assign(user, updateBody);
  await user.save();
  return restrictJSONOutput(user, config.db.privateJSONDataKeys.user);
};

/**
 * Delete user by id
 * @param {Integer} userId
 * @returns {Object<User>}
 */
export const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  await user.remove();
  return restrictJSONOutput(user, config.db.privateJSONDataKeys.user);
};

export default {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  getUserByLogin,
  updateUserById,
  deleteUserById,
};
