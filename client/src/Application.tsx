import React from 'react';

import {
  //Flex,
  Box,
  //Image,
  //Link,
  //Button,
  //Text,
} from '@chakra-ui/react';

import { Header } from './Common';

class Application extends React.Component {
  render() {
    return (
      <Box>
        <Header onlyGitHub />
        <Box pt={["10vh", "7vh"]}>
        </Box>
      </Box>
    );
  }
}

export default Application;

