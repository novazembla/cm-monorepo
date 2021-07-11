import { gql } from "apollo-server-express";
import { db } from "../config";

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  enum Role {
    ADMINISTRATOR
    EDITOR
    CONTRIBUTOR
    UNKNOWN
  }

  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  directive @auth(
    requires: [Role]
  ) on OBJECT | FIELD_DEFINITION

  # "Users" are given access to the backend. They can create, read, update, or delete
  # locations, events, tours, or other users.
  type User @auth(requires: [ADMINISTRATOR, EDITOR]) {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    locations: [Location!]
  }

  input UserCreateInput {
    email: String!
    firstName: String!
    lastName: String!
    password: String!
  }

  input UserLoginInput {
    email: String!
    password: String!
  }

  input UserLogoutInput {
    userId: Int!
  }

  type AuthPayloadToken {
    token: String!
    expires: String!
  }
  type AuthPayloadTokens {
    access: AuthPayloadToken!
    refresh: AuthPayloadToken!
  }
  type AuthPayload {
    user: User!
    tokens: AuthPayloadTokens!
  }

  # "Locations" represent the individual points listed on the map or the tours
  #  @auth(requires: ADMINISTRATOR | EDITOR | CONTRIBUTOR)
  type Location  {
    id: ID!
    title: String!
    creator: User!
  }

  # "Events" represent physical or online events organized by the locations
  type Event {
    id: ID!
    title: String!
    location: Location!
    secres: String  @auth(requires: EDITOR)
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    users(page: Int = 1, pageSize: Int = ${db.defaultPageSize}): [User!]!
  }

  type Mutation {
    userSignup(data: UserCreateInput!) : AuthPayload!
    userLogin(data: UserLoginInput!): AuthPayload!
    userLogout(data: UserLogoutInput!): Boolean!
  }
`;

export default typeDefs;
