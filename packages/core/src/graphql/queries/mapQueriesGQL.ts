import gql from "graphql-tag";

export const geocodeQueryGQL = gql`
  query geocode($q: String!) {
    geocode(q: $q) {
      geojson
      count
    }
  }
`;

export default geocodeQueryGQL;
