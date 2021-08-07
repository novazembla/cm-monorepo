/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { NexusResolverContext } from "./../nexus-graphql/context"
import type { FieldAuthorizeResolver } from "nexus/dist/plugins/fieldAuthorizePlugin"
import type { core } from "nexus"
declare global {
  interface NexusGenCustomInputMethods<TypeName extends string> {
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    date<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "DateTime";
    /**
     * A field whose value conforms to the standard internet email address format as specified in RFC822: https://www.w3.org/Protocols/rfc822/.
     */
    email<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "EmailAddress";
    /**
     * The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
     */
    json<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "JSON";
    /**
     * A field whose value is a JSON Web Token (JWT): https://jwt.io/introduction.
     */
    jwt<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "JWT";
  }
}
declare global {
  interface NexusGenCustomOutputMethods<TypeName extends string> {
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    date<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "DateTime";
    /**
     * A field whose value conforms to the standard internet email address format as specified in RFC822: https://www.w3.org/Protocols/rfc822/.
     */
    email<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "EmailAddress";
    /**
     * The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf).
     */
    json<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "JSON";
    /**
     * A field whose value is a JSON Web Token (JWT): https://jwt.io/introduction.
     */
    jwt<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "JWT";
  }
}


declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  SettingsUpdateInput: { // input type
    key: string; // String!
    value: NexusGenScalars['JSON']; // JSON!
  }
  TaxonomyCreateInput: { // input type
    name: NexusGenScalars['JSON']; // JSON!
    slug: NexusGenScalars['JSON']; // JSON!
  }
  TaxonomyUpdateInput: { // input type
    name: NexusGenScalars['JSON']; // JSON!
    slug: NexusGenScalars['JSON']; // JSON!
  }
  TermCreateInput: { // input type
    name: NexusGenScalars['JSON']; // JSON!
    slug: NexusGenScalars['JSON']; // JSON!
    taxonomyId: number; // Int!
  }
  TermUpdateInput: { // input type
    name: NexusGenScalars['JSON']; // JSON!
    slug: NexusGenScalars['JSON']; // JSON!
  }
  UniqueSlugInput: { // input type
    slug: NexusGenScalars['JSON']; // JSON!
  }
  UserCreateInput: { // input type
    acceptedTerms: boolean; // Boolean!
    email: string; // String!
    firstName: string; // String!
    lastName: string; // String!
    password: string; // String!
    role: string; // String!
    userBanned: boolean; // Boolean!
  }
  UserProfileUpdateInput: { // input type
    email: NexusGenScalars['EmailAddress']; // EmailAddress!
    firstName: string; // String!
    lastName: string; // String!
  }
  UserSignupInput: { // input type
    acceptedTerms: boolean; // Boolean!
    email: NexusGenScalars['EmailAddress']; // EmailAddress!
    firstName: string; // String!
    lastName: string; // String!
    password: string; // String!
  }
  UserUpdateInput: { // input type
    email: string; // String!
    firstName: string; // String!
    lastName: string; // String!
    role: string; // String!
    userBanned: boolean; // Boolean!
  }
}

export interface NexusGenEnums {
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  DateTime: any
  EmailAddress: any
  JSON: any
  JWT: any
}

export interface NexusGenObjects {
  AuthPayload: { // root type
    tokens?: NexusGenRootTypes['AuthPayloadTokens'] | null; // AuthPayloadTokens
    user?: NexusGenRootTypes['AuthUser'] | null; // AuthUser
  }
  AuthPayloadToken: { // root type
    expires: string; // String!
    token?: NexusGenScalars['JWT'] | null; // JWT
  }
  AuthPayloadTokens: { // root type
    access?: NexusGenRootTypes['AuthPayloadToken'] | null; // AuthPayloadToken
    refresh?: NexusGenRootTypes['AuthPayloadToken'] | null; // AuthPayloadToken
  }
  AuthUser: { // root type
    id: number; // Int!
    permissions?: Array<string | null> | null; // [String]
    roles?: Array<string | null> | null; // [String]
  }
  BooleanResult: { // root type
    result: boolean; // Boolean!
  }
  Mutation: {};
  ProfileUser: { // root type
    email?: NexusGenScalars['EmailAddress'] | null; // EmailAddress
    emailVerified?: boolean | null; // Boolean
    firstName?: string | null; // String
    id: number; // Int!
    lastName?: string | null; // String
  }
  Query: {};
  Setting: { // root type
    createdAt?: NexusGenScalars['DateTime'] | null; // DateTime
    id: number; // Int!
    key?: string | null; // String
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
    value?: NexusGenScalars['JSON'] | null; // JSON
  }
  Taxonomy: { // root type
    createdAt?: NexusGenScalars['DateTime'] | null; // DateTime
    id: number; // Int!
    name?: NexusGenScalars['JSON'] | null; // JSON
    slug?: NexusGenScalars['JSON'] | null; // JSON
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  TaxonomyQueryResult: { // root type
    taxonomies?: Array<NexusGenRootTypes['Taxonomy'] | null> | null; // [Taxonomy]
    totalCount?: number | null; // Int
  }
  Term: { // root type
    createdAt?: NexusGenScalars['DateTime'] | null; // DateTime
    id: number; // Int!
    name?: NexusGenScalars['JSON'] | null; // JSON
    slug?: NexusGenScalars['JSON'] | null; // JSON
    taxonomyId: number; // Int!
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
  }
  TermQueryResult: { // root type
    terms?: Array<NexusGenRootTypes['Term'] | null> | null; // [Term]
    totalCount?: number | null; // Int
  }
  UniqueSlugResult: { // root type
    errors?: NexusGenScalars['JSON'] | null; // JSON
    ok: boolean; // Boolean!
  }
  User: { // root type
    createdAt?: NexusGenScalars['DateTime'] | null; // DateTime
    email?: NexusGenScalars['EmailAddress'] | null; // EmailAddress
    emailVerified?: boolean | null; // Boolean
    firstName?: string | null; // String
    id: number; // Int!
    lastName?: string | null; // String
    role?: string | null; // String
    updatedAt?: NexusGenScalars['DateTime'] | null; // DateTime
    userBanned?: boolean | null; // Boolean
  }
  UsersQueryResult: { // root type
    totalCount?: number | null; // Int
    users?: Array<NexusGenRootTypes['User'] | null> | null; // [User]
  }
}

export interface NexusGenInterfaces {
  UserBaseNode: NexusGenRootTypes['ProfileUser'] | NexusGenRootTypes['User'];
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenInterfaces & NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars

export interface NexusGenFieldTypes {
  AuthPayload: { // field return type
    tokens: NexusGenRootTypes['AuthPayloadTokens'] | null; // AuthPayloadTokens
    user: NexusGenRootTypes['AuthUser'] | null; // AuthUser
  }
  AuthPayloadToken: { // field return type
    expires: string; // String!
    token: NexusGenScalars['JWT'] | null; // JWT
  }
  AuthPayloadTokens: { // field return type
    access: NexusGenRootTypes['AuthPayloadToken'] | null; // AuthPayloadToken
    refresh: NexusGenRootTypes['AuthPayloadToken'] | null; // AuthPayloadToken
  }
  AuthUser: { // field return type
    id: number; // Int!
    permissions: Array<string | null> | null; // [String]
    roles: Array<string | null> | null; // [String]
  }
  BooleanResult: { // field return type
    result: boolean; // Boolean!
  }
  Mutation: { // field return type
    authLogin: NexusGenRootTypes['AuthPayload']; // AuthPayload!
    authLogout: NexusGenRootTypes['BooleanResult']; // BooleanResult!
    authPasswordRequest: NexusGenRootTypes['BooleanResult']; // BooleanResult!
    authPasswordReset: NexusGenRootTypes['BooleanResult']; // BooleanResult!
    authRefresh: NexusGenRootTypes['AuthPayload']; // AuthPayload!
    authRequestEmailVerificationEmail: NexusGenRootTypes['BooleanResult']; // BooleanResult!
    authVerifyEmail: NexusGenRootTypes['BooleanResult']; // BooleanResult!
    settingsUpdate: NexusGenRootTypes['BooleanResult']; // BooleanResult!
    taxonomyCreate: NexusGenRootTypes['Taxonomy']; // Taxonomy!
    taxonomyDelete: NexusGenRootTypes['BooleanResult']; // BooleanResult!
    taxonomyUpdate: NexusGenRootTypes['Taxonomy']; // Taxonomy!
    termCreate: NexusGenRootTypes['Term']; // Term!
    termDelete: NexusGenRootTypes['BooleanResult']; // BooleanResult!
    termUpdate: NexusGenRootTypes['BooleanResult']; // BooleanResult!
    userCreate: NexusGenRootTypes['User']; // User!
    userDelete: NexusGenRootTypes['BooleanResult']; // BooleanResult!
    userProfilePasswordUpdate: NexusGenRootTypes['User']; // User!
    userProfileUpdate: NexusGenRootTypes['User']; // User!
    userSignup: NexusGenRootTypes['AuthPayload']; // AuthPayload!
    userUpdate: NexusGenRootTypes['BooleanResult']; // BooleanResult!
  }
  ProfileUser: { // field return type
    email: NexusGenScalars['EmailAddress'] | null; // EmailAddress
    emailVerified: boolean | null; // Boolean
    firstName: string | null; // String
    id: number; // Int!
    lastName: string | null; // String
  }
  Query: { // field return type
    setting: Array<NexusGenRootTypes['Setting'] | null> | null; // [Setting]
    settings: Array<NexusGenRootTypes['Setting'] | null> | null; // [Setting]
    taxonomies: NexusGenRootTypes['TaxonomyQueryResult'] | null; // TaxonomyQueryResult
    taxonomyRead: NexusGenRootTypes['Taxonomy']; // Taxonomy!
    termRead: NexusGenRootTypes['Term']; // Term!
    terms: NexusGenRootTypes['TermQueryResult'] | null; // TermQueryResult
    uniqueSlug: NexusGenRootTypes['UniqueSlugResult'] | null; // UniqueSlugResult
    userProfileRead: NexusGenRootTypes['ProfileUser']; // ProfileUser!
    userRead: NexusGenRootTypes['User']; // User!
    users: NexusGenRootTypes['UsersQueryResult'] | null; // UsersQueryResult
  }
  Setting: { // field return type
    createdAt: NexusGenScalars['DateTime'] | null; // DateTime
    id: number; // Int!
    key: string | null; // String
    updatedAt: NexusGenScalars['DateTime'] | null; // DateTime
    value: NexusGenScalars['JSON'] | null; // JSON
  }
  Taxonomy: { // field return type
    createdAt: NexusGenScalars['DateTime'] | null; // DateTime
    id: number; // Int!
    name: NexusGenScalars['JSON'] | null; // JSON
    slug: NexusGenScalars['JSON'] | null; // JSON
    termCount: number | null; // Int
    terms: Array<NexusGenRootTypes['Term'] | null> | null; // [Term]
    updatedAt: NexusGenScalars['DateTime'] | null; // DateTime
  }
  TaxonomyQueryResult: { // field return type
    taxonomies: Array<NexusGenRootTypes['Taxonomy'] | null> | null; // [Taxonomy]
    totalCount: number | null; // Int
  }
  Term: { // field return type
    createdAt: NexusGenScalars['DateTime'] | null; // DateTime
    id: number; // Int!
    name: NexusGenScalars['JSON'] | null; // JSON
    slug: NexusGenScalars['JSON'] | null; // JSON
    taxonomy: NexusGenRootTypes['Taxonomy'] | null; // Taxonomy
    taxonomyId: number; // Int!
    updatedAt: NexusGenScalars['DateTime'] | null; // DateTime
  }
  TermQueryResult: { // field return type
    terms: Array<NexusGenRootTypes['Term'] | null> | null; // [Term]
    totalCount: number | null; // Int
  }
  UniqueSlugResult: { // field return type
    errors: NexusGenScalars['JSON'] | null; // JSON
    ok: boolean; // Boolean!
  }
  User: { // field return type
    createdAt: NexusGenScalars['DateTime'] | null; // DateTime
    email: NexusGenScalars['EmailAddress'] | null; // EmailAddress
    emailVerified: boolean | null; // Boolean
    firstName: string | null; // String
    id: number; // Int!
    lastName: string | null; // String
    role: string | null; // String
    updatedAt: NexusGenScalars['DateTime'] | null; // DateTime
    userBanned: boolean | null; // Boolean
  }
  UsersQueryResult: { // field return type
    totalCount: number | null; // Int
    users: Array<NexusGenRootTypes['User'] | null> | null; // [User]
  }
  UserBaseNode: { // field return type
    email: NexusGenScalars['EmailAddress'] | null; // EmailAddress
    emailVerified: boolean | null; // Boolean
    firstName: string | null; // String
    id: number; // Int!
    lastName: string | null; // String
  }
}

export interface NexusGenFieldTypeNames {
  AuthPayload: { // field return type name
    tokens: 'AuthPayloadTokens'
    user: 'AuthUser'
  }
  AuthPayloadToken: { // field return type name
    expires: 'String'
    token: 'JWT'
  }
  AuthPayloadTokens: { // field return type name
    access: 'AuthPayloadToken'
    refresh: 'AuthPayloadToken'
  }
  AuthUser: { // field return type name
    id: 'Int'
    permissions: 'String'
    roles: 'String'
  }
  BooleanResult: { // field return type name
    result: 'Boolean'
  }
  Mutation: { // field return type name
    authLogin: 'AuthPayload'
    authLogout: 'BooleanResult'
    authPasswordRequest: 'BooleanResult'
    authPasswordReset: 'BooleanResult'
    authRefresh: 'AuthPayload'
    authRequestEmailVerificationEmail: 'BooleanResult'
    authVerifyEmail: 'BooleanResult'
    settingsUpdate: 'BooleanResult'
    taxonomyCreate: 'Taxonomy'
    taxonomyDelete: 'BooleanResult'
    taxonomyUpdate: 'Taxonomy'
    termCreate: 'Term'
    termDelete: 'BooleanResult'
    termUpdate: 'BooleanResult'
    userCreate: 'User'
    userDelete: 'BooleanResult'
    userProfilePasswordUpdate: 'User'
    userProfileUpdate: 'User'
    userSignup: 'AuthPayload'
    userUpdate: 'BooleanResult'
  }
  ProfileUser: { // field return type name
    email: 'EmailAddress'
    emailVerified: 'Boolean'
    firstName: 'String'
    id: 'Int'
    lastName: 'String'
  }
  Query: { // field return type name
    setting: 'Setting'
    settings: 'Setting'
    taxonomies: 'TaxonomyQueryResult'
    taxonomyRead: 'Taxonomy'
    termRead: 'Term'
    terms: 'TermQueryResult'
    uniqueSlug: 'UniqueSlugResult'
    userProfileRead: 'ProfileUser'
    userRead: 'User'
    users: 'UsersQueryResult'
  }
  Setting: { // field return type name
    createdAt: 'DateTime'
    id: 'Int'
    key: 'String'
    updatedAt: 'DateTime'
    value: 'JSON'
  }
  Taxonomy: { // field return type name
    createdAt: 'DateTime'
    id: 'Int'
    name: 'JSON'
    slug: 'JSON'
    termCount: 'Int'
    terms: 'Term'
    updatedAt: 'DateTime'
  }
  TaxonomyQueryResult: { // field return type name
    taxonomies: 'Taxonomy'
    totalCount: 'Int'
  }
  Term: { // field return type name
    createdAt: 'DateTime'
    id: 'Int'
    name: 'JSON'
    slug: 'JSON'
    taxonomy: 'Taxonomy'
    taxonomyId: 'Int'
    updatedAt: 'DateTime'
  }
  TermQueryResult: { // field return type name
    terms: 'Term'
    totalCount: 'Int'
  }
  UniqueSlugResult: { // field return type name
    errors: 'JSON'
    ok: 'Boolean'
  }
  User: { // field return type name
    createdAt: 'DateTime'
    email: 'EmailAddress'
    emailVerified: 'Boolean'
    firstName: 'String'
    id: 'Int'
    lastName: 'String'
    role: 'String'
    updatedAt: 'DateTime'
    userBanned: 'Boolean'
  }
  UsersQueryResult: { // field return type name
    totalCount: 'Int'
    users: 'User'
  }
  UserBaseNode: { // field return type name
    email: 'EmailAddress'
    emailVerified: 'Boolean'
    firstName: 'String'
    id: 'Int'
    lastName: 'String'
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    authLogin: { // args
      email: NexusGenScalars['EmailAddress']; // EmailAddress!
      password: string; // String!
      scope: string; // String!
    }
    authLogout: { // args
      userId: number; // Int!
    }
    authPasswordRequest: { // args
      email: NexusGenScalars['EmailAddress']; // EmailAddress!
      scope: string; // String!
    }
    authPasswordReset: { // args
      password: string; // String!
      token: string; // String!
    }
    authRefresh: { // args
      scope: string; // String!
    }
    authRequestEmailVerificationEmail: { // args
      scope: string; // String!
      userId: number; // Int!
    }
    authVerifyEmail: { // args
      token: string; // String!
    }
    settingsUpdate: { // args
      data?: NexusGenInputs['SettingsUpdateInput'][] | null; // [SettingsUpdateInput!]
    }
    taxonomyCreate: { // args
      data: NexusGenInputs['TaxonomyCreateInput']; // TaxonomyCreateInput!
    }
    taxonomyDelete: { // args
      id: number; // Int!
    }
    taxonomyUpdate: { // args
      data: NexusGenInputs['TaxonomyUpdateInput']; // TaxonomyUpdateInput!
      id: number; // Int!
    }
    termCreate: { // args
      data: NexusGenInputs['TermCreateInput']; // TermCreateInput!
    }
    termDelete: { // args
      id: number; // Int!
    }
    termUpdate: { // args
      data: NexusGenInputs['TermUpdateInput']; // TermUpdateInput!
      id: number; // Int!
    }
    userCreate: { // args
      data: NexusGenInputs['UserCreateInput']; // UserCreateInput!
      scope: string; // String!
    }
    userDelete: { // args
      id: number; // Int!
      scope: string; // String!
    }
    userProfilePasswordUpdate: { // args
      id: number; // Int!
      password: string; // String!
      scope: string; // String!
    }
    userProfileUpdate: { // args
      data: NexusGenInputs['UserProfileUpdateInput']; // UserProfileUpdateInput!
      id: number; // Int!
      scope: string; // String!
    }
    userSignup: { // args
      data: NexusGenInputs['UserSignupInput']; // UserSignupInput!
      scope: string; // String!
    }
    userUpdate: { // args
      data: NexusGenInputs['UserUpdateInput']; // UserUpdateInput!
      id: number; // Int!
      scope: string; // String!
    }
  }
  Query: {
    setting: { // args
      id: number; // Int!
    }
    taxonomies: { // args
      orderBy?: NexusGenScalars['JSON'] | null; // JSON
      pageIndex?: number | null; // Int
      pageSize: number | null; // Int
      where?: NexusGenScalars['JSON'] | null; // JSON
    }
    taxonomyRead: { // args
      id: number; // Int!
    }
    termRead: { // args
      id: number; // Int!
    }
    terms: { // args
      orderBy?: NexusGenScalars['JSON'] | null; // JSON
      pageIndex?: number | null; // Int
      pageSize: number | null; // Int
      taxonomyId: number; // Int!
      where?: NexusGenScalars['JSON'] | null; // JSON
    }
    uniqueSlug: { // args
      data: NexusGenInputs['UniqueSlugInput']; // UniqueSlugInput!
      id: number; // Int!
      type: string; // String!
    }
    userProfileRead: { // args
      id: number; // Int!
      scope: string; // String!
    }
    userRead: { // args
      id: number; // Int!
      scope: string; // String!
    }
    users: { // args
      orderBy?: NexusGenScalars['JSON'] | null; // JSON
      pageIndex?: number | null; // Int
      pageSize: number | null; // Int
      where?: NexusGenScalars['JSON'] | null; // JSON
    }
  }
}

export interface NexusGenAbstractTypeMembers {
  UserBaseNode: "ProfileUser" | "User"
}

export interface NexusGenTypeInterfaces {
  ProfileUser: "UserBaseNode"
  User: "UserBaseNode"
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = keyof NexusGenInputs;

export type NexusGenEnumNames = never;

export type NexusGenInterfaceNames = keyof NexusGenInterfaces;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = "UserBaseNode";

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: NexusResolverContext;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
    /**
     * Authorization for an individual field. Returning "true"
     * or "Promise<true>" means the field can be accessed.
     * Returning "false" or "Promise<false>" will respond
     * with a "Not Authorized" error for the field.
     * Returning or throwing an error will also prevent the
     * resolver from executing.
     */
    authorize?: FieldAuthorizeResolver<TypeName, FieldName>
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}