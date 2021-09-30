import gql from "graphql-tag";

export const tourCreateMutationGQL = gql`
  mutation tourCreate($data: TaxonomyUpsertInput!) {
    tourCreate(data: $data) {
      id
      name
      slug
      hasColor
    }
  }
`;

export const tourUpdateMutationGQL = gql`
  mutation tourUpdate($id: Int!, $data: TaxonomyUpsertInput!) {
    tourUpdate(id: $id, data: $data) {
      id
      name
      slug
      hasColor
    }
  }
`;

export const tourDeleteMutationGQL = gql`
  mutation tourDelete($id: Int!) {
    tourDelete(id: $id) {
      result
    }
  }
`;

export const tourStopCreateMutationGQL = gql`
  mutation tourStopCreate($data: TermCreateInput!) {
    tourStopCreate(data: $data) {
      id
      name
      slug
      color
      colorDark
      tourId
    }
  }
`;

export const tourStopUpdateMutationGQL = gql`
  mutation tourStopUpdate($id: Int!, $data: TermUpdateInput!) {
    tourStopUpdate(id: $id, data: $data) {
      id
      name
      slug
      color
      colorDark
    }
  }
`;

export const tourStopDeleteMutationGQL = gql`
  mutation tourStopDelete($id: Int!) {
    tourStopDelete(id: $id) {
      result
    }
  }
`;
