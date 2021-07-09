import { gql } from "apollo-server-express";
import { db } from "../config";

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  directive @authfield on FIELD_DEFINITION

  # "Users" are given access to the backend. They can create, read, update, or delete
  # locations, events, tours, or other users.
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    locations: [Location!]
  }

  # "Locations" represent the individual points listed on the map or the tours
  type Location {
    id: ID!
    title: String!
    creator: User!
  }

  # "Events" represent physical or online events organized by the locations
  type Event {
    id: ID!
    title: String!
    location: Location!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    users(page: Int = 1, pageSize: Int = ${db.defaultPageSize}): [User!]!
  }
`;

export default typeDefs;
