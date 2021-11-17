import React from 'react';
import { Link as RouterLink } from "react-router-dom";

import {
  Flex,
  Image,
  Link,
  Button,
  ButtonGroup,
  Text,
} from '@chakra-ui/react';

import solanaLogo from './logos/solana-logo-color-white.svg';

export function Header(props: any) {
  return (
    <Flex
      w="100%"
      h={["10vh", "7vh"]}
      bg="gray.800"
      position="fixed"
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
    >
      <Flex>
        <Image src={solanaLogo} ml={["0", "100px"]} width="150px" />
        <Text ml="10px" fontFamily="Orbitron" fontWeight="bold" color="gray.100">
          Token Registry
        </Text>
      </Flex>
      <ButtonGroup ml={["0", "auto"]} mr={["0", "50px"]} display={["none", "block"]}>
        <Link href="https://github.com/ChrisBender/solana-token-registry" isExternal>
          <Button variant="github">
            GitHub
          </Button>
        </Link>
        <RouterLink to="/app">
          <Button variant="launch-app" display={props.onlyGitHub ? "none" : "inline"}>
            Launch App
          </Button>
        </RouterLink>
      </ButtonGroup>
    </Flex>
  );
}

