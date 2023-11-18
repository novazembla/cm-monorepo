import gql from "graphql-tag";

export const taxonomyCreateMutationGQL = gql`
  mutation taxonomyCreate($data: TaxonomyUpsertInput!) {
    taxonomyCreate(data: $data) {
      id
      name
      slug
      hasColor
      collectPrimaryTerm
      isRequired
    }
  }
`;

export const taxonomyUpdateMutationGQL = gql`
  mutation taxonomyUpdate($id: Int!, $data: TaxonomyUpsertInput!) {
    taxonomyUpdate(id: $id, data: $data) {
      id
      name
      slug
      hasColor
      collectPrimaryTerm
      isRequired
    }
  }
`;

export const taxonomyDeleteMutationGQL = gql`
  mutation taxonomyDelete($id: Int!) {
    taxonomyDelete(id: $id) {
      result
    }
  }
`;

export const termCreateMutationGQL = gql`
  mutation termCreate($data: TermCreateInput!) {
    termCreate(data: $data) {
      id
      name
      slug
      iconKey
      berlinDeKey
      hasReducedVisibility
      color
      colorDark
      taxonomyId
    }
  }
`;

export const termUpdateMutationGQL = gql`
  mutation termUpdate($id: Int!, $data: TermUpdateInput!) {
    termUpdate(id: $id, data: $data) {
      id
      name
      slug
      iconKey
      berlinDeKey
      hasReducedVisibility
      color
      colorDark
    }
  }
`;

export const termDeleteMutationGQL = gql`
  mutation termDelete($id: Int!) {
    termDelete(id: $id) {
      result
    }
  }
`;
