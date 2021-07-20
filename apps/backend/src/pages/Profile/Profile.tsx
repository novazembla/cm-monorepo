import React from 'react'
import { gql, useQuery } from "@apollo/client";

const QUERY_USERS = gql`
  query {
    users {
      id
      firstName
      lastName
    }
  }
`;


const Profile = () => {
  const {
    loading,
    error,
    data,
    /* , fetchMore, networkStatus */
  } = useQuery(QUERY_USERS, {
    variables: {},
    // Setting this value to true will make the component rerender when
    // the "networkStatus" changes, so we are able to know if it is fetching
    // more data
    notifyOnNetworkStatusChange: true,
  });

  if (error) return <div className={`primary no-secondary`}><p>Error!</p></div>;
  if (loading) return <div className={`primary no-secondary`}><p>Loading ... !</p></div>;

  return (
    <>
      <div className={`primary no-secondary`}>
        <h2> s</h2>
        <p>{JSON.stringify({ ...data }, null, 2)}</p>
      </div>      
    </>
  )
}
export default Profile;