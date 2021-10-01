import gql from "graphql-tag";

export const tourCreateMutationGQL = gql`
  mutation tourCreate($data: TourUpsertInput!) {
    tourCreate(data: $data) {
      id
      title
      slug
    }
  }
`;

export const tourUpdateMutationGQL = gql`
  mutation tourUpdate(
    $id: Int!
    $data: TourUpsertInput!
    $imagesTranslations: [ImageTranslationInput]
  ) {
    tourUpdate(id: $id, data: $data, imagesTranslations: $imagesTranslations) {
      id
      title
      slug
    }
  }
`;

export const tourReorderTourStopsMutationGQL = gql`
  mutation tourReorderTourStops($id: Int!, $data: [TourStopOrderInput]!) {
    tourReorderTourStops(id: $id, data: $data) {
      id
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
  mutation tourStopCreate($data: TourStopCreateInput!) {
    tourStopCreate(data: $data) {
      id
      title
      tourId
    }
  }
`;

export const tourStopUpdateMutationGQL = gql`
  mutation tourStopUpdate(
    $id: Int!
    $data: TourStopUpdateInput!
    $imagesTranslations: [ImageTranslationInput]
  ) {
    tourStopUpdate(
      id: $id
      data: $data
      imagesTranslations: $imagesTranslations
    ) {
      id
      title
      number
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
