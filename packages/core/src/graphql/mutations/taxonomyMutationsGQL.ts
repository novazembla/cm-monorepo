import gql from "graphql-tag";

export const taxonomyCreateMutationGQL = gql`
  mutation taxonomyCreate($data: TaxonomyCreateInput!) {
    taxonomyCreate(data: $data) {
      id
      name
      slug
    }
  }
`;

export const taxonomyUpdateMutationGQL = gql`
  mutation taxonomyUpdate($id: Int!, $data: TaxonomyUpdateInput!) {
    taxonomyUpdate(id: $id, data: $data) {
      id
      name
      slug
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
