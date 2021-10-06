import gql from "graphql-tag";

export const locationCreateMutationGQL = gql`
  mutation locationCreate($data: LocationUpsertInput!) {
    locationCreate(data: $data) {
      id
      ownerId
      title
      slug
      status
      description
    }
  }
`;

export const locationUpdateMutationGQL = gql`
  mutation locationUpdate(
    $id: Int!
    $data: LocationUpsertInput!
    $imagesTranslations: [ImageTranslationInput]
  ) {
    locationUpdate(
      id: $id
      data: $data
      imagesTranslations: $imagesTranslations
    ) {
      id
      ownerId
      title
      slug
      status
      description
    }
  }
`;

export const locationDeleteMutationGQL = gql`
  mutation locationDelete($id: Int!) {
    locationDelete(id: $id) {
      result
    }
  }
`;
