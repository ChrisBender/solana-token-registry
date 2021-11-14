import React from 'react';
import { Link as RouterLink } from "react-router-dom";

import solanaLogo from './solana-logo-color-white.svg';

import {
  Flex,
  Box,
  Image,
  Link,
  Button,
  ButtonGroup,
  Text,
} from '@chakra-ui/react';

class Header extends React.Component {
  render() {
    return (
      <Flex
        w="100%"
        h={["14vh", "7vh"]}
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
        <ButtonGroup ml={["0", "auto"]} mr={["0", "50px"]}>
          <Link href="https://github.com/ChrisBender/solana-token-registry" isExternal>
            <Button variant="github">
              GitHub
            </Button>
          </Link>
          <RouterLink to="/app">
            <Button variant="launch-app">
              Launch App
            </Button>
          </RouterLink>
        </ButtonGroup>
      </Flex>
    );
  }
}

class Body extends React.Component {
  render() {
    return (
      <Flex pt="7vh">
      </Flex>
    )
  }
}

class Homepage extends React.Component {
  render() {
    return (
      <Box>
        <Header />
        <Body />
      </Box>
    )
  }
  //render() {
  //  return (
  //    <div className="registry">
  //      <header className="header">
  //        <div className="logo">
  //          <div className="logo-img">
  //            <img src={solanaLogo} alt="" />
  //          </div>
  //          <div className="logo-text">
  //            Token Registry
  //          </div>
  //        </div>
  //        <a className="link link-github" href="https://github.com/ChrisBender/solana-token-registry">
  //          GitHub
  //        </a>
  //        <div className="link link-launch-app">
  //          Launch App
  //        </div>
  //      </header>
  //      <div className="main-text-and-registry-illustration">
  //        <div className="main-text">
  //          <div className="main-text-title">
  //            All Solana tokens.<br />In one place.
  //          </div>
  //          <div className="main-text-subtitle">
  //            Register your SPL token metadata on-chain. Stop submitting PRs to the token-list repository. 
  //          </div>
  //        </div>
  //        <div className="registry-illustration">
  //          <div className="registry-illustration-content">
  //            <div className="registry-illustration-header">
  //              0xregistry
  //            </div>
  //            <RegistryIllustrationToken ticker="USDC" />
  //            <RegistryIllustrationToken ticker="wETH" />
  //            <RegistryIllustrationToken ticker="????" />
  //          </div>
  //        </div>
  //      </div>
  //      <div className="learn-more">
  //        <div className="learn-more-text">
  //          Learn More
  //        </div>
  //        <div className="learn-more-symbol">
  //          \/
  //        </div>
  //      </div>
  //      <div className="explainer">
  //        <div className="explainer-pr-illustration">
  //        </div>
  //        <div className="explainer-text">
  //          Currently, Solana uses a manual GitHub repository to keep track of registered SPL token metadata (the name of the token, the ticker, and URL of the logo).<br /><br />Instead, this on-chain token registry allows <strong>anyone to register this metadata, permissionlessly</strong>. No more manual PR reviews to get your token onto Phantom.
  //        </div>
  //      </div>
  //      <div className="call-to-action">
  //      </div>
  //    </div>
  //  );
  //}
}

export default Homepage;

