import gql from "graphql-tag";

export const settingsUpdateMutationGQL = gql`
  mutation settingsUpdate($data: [SettingsUpdateInput!]) {
    settingsUpdate(data: $data) {
      result
    }
  }
`;

export default settingsUpdateMutationGQL;
