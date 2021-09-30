import gql from "graphql-tag";

export const taxonomyCreateMutationGQL = gql`
  mutation taxonomyCreate($data: TaxonomyUpsertInput!) {
    taxonomyCreate(data: $data) {
      id
      name
      slug
      hasColor
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
