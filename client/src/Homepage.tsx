import React from 'react';
import { Link as RouterLink } from "react-router-dom";

import solanaLogo from './logos/solana-logo-color-white.svg';
import usdcLogo from './logos/usd-coin-usdc-logo.svg';
import wethLogo from './logos/ethereum-eth-logo.svg';
import quesLogo from './logos/question-logo.svg';

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
        <ButtonGroup ml={["0", "auto"]} mr={["0", "50px"]} display={["none", "inline"]}>
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

function RegistryIllustrationToken(props: any) {
  return (
    <Flex padding="4%" fontSize={["1.1em", "1.5em"]} alignItems="center">
      <Image src={props.logo} float="left" height={["30px", "50px"]} pl="2%" pr="3%" />
      <Box>
        {"{key: " + props.ticker + ", ...}"}
      </Box>
    </Flex>
  );
  
}

class MainTextAndIllustration extends React.Component {
  render() {
    return (
      <Flex w="100%" alignItems="center" justifyContent="center" pt="10%" flexWrap="wrap">
        <Box w={["100%", "30%"]} m={["0 5% 0 5%", "0 8% 0 0"]}>
          <Text fontFamily="Orbitron" fontWeight="bold" fontSize={["2em", "3.8em"]}>
            All Solana tokens.<br />In one place.
          </Text>
          <Text color="gray.100" fontSize={["1.0em", "1.2em"]} pt="5%">
            Register your SPL token metadata on-chain. Stop submitting PRs to the token-list repository. 
          </Text>
        </Box>
        <Box w={["100%", "30%"]}>
          <Box w={["65%", "70%"]} fontFamily="Courier New" bg="gray.700" borderRadius="10px" m="auto" mt={["15%", 0]}>
            <Box bg="gray.600" borderRadius="10px 10px 0 0" p="3%" pl="5%" fontSize="1.3em">
              0xregistry
            </Box>
            <RegistryIllustrationToken ticker="USDC" logo={usdcLogo} />
            <RegistryIllustrationToken ticker="wETH" logo={wethLogo} />
            <RegistryIllustrationToken ticker="????" logo={quesLogo} />
          </Box>
        </Box>
      </Flex>
    )
  }
}

class Explainer extends React.Component {
  render() {
    return (
      null
    );
  }
}

class CallToAction extends React.Component {
  render() {
    return (
      null
    );
  }
}

class Homepage extends React.Component {
  render() {
    return (
      <Box>
        <Header />
        <Flex pt={["10vh", "7vh"]}>
          <MainTextAndIllustration />
          <Explainer />
          <CallToAction />
        </Flex>
      </Box>
    )
  }
  //render() {
  //  return (
  //    <div className="registry">
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

