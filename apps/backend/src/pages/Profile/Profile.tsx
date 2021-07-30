import React from 'react'
import { gql, useQuery } from "@apollo/client";

import { Box } from "@chakra-ui/react";
import { AlertBox } from '~/components/ui';

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

  console.log(data);
  

  return (
    <>
      <AlertBox status="warning" hasClose>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
        sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
        tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque in
        ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero eu
        facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar sit
        amet lectus. Quisque molestie dapibus libero non pellentesque. Vivamus
        quam arcu</AlertBox>

        <AlertBox status="info">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a
        sodales nulla, sed semper nisi. Cras lobortis volutpat nunc. Proin
        tincidunt enim in felis aliquet, a ultricies purus bibendum. Quisque in
        ultrices lectus. Nulla at urna diam. Proin sodales lobortis libero eu
        facilisis. In sem urna, aliquam vel consectetur sit amet, pulvinar sit
        amet lectus. Quisque molestie dapibus libero non pellentesque. Vivamus
        quam arcu</AlertBox>
    <AlertBox status="success" twoCol title="xxxx" description="asfdsda"/>
    <AlertBox status="info" title="xxxx" description="asfdsda" hasClose/>
    <AlertBox status="warning" title="xxxx" description="asfdsda"/>
    <AlertBox status="error" title="ivamus
        quam arcu" description="In sem urna, aliquam vel consectetur sit amet, pulvinar sit
        amet lectus. Quisque molestie dapibus libero non pellentesque. Vivamus
        quam arcu" hasClose/>
    <AlertBox status="error" twoCol title="ivamus
        quam arcu" description="In sem urna, aliquam vel consectetur sit amet, pulvinar sit
        amet lectus. Quisque molestie dapibus libero non pellentesque. Vivamus
        quam arcu" hasClose/>
    <Box layerStyle="pageContainerWhite">
        <h2> s</h2>
        <p>{JSON.stringify({ ...data }, null, 2)}</p>
      </Box>      
    </>
  )
}
export default Profile;