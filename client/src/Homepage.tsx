import React from 'react';
import { Link as RouterLink } from "react-router-dom";

import solanaLogo from './logos/solana-logo-color-white.svg';
import usdcLogo from './logos/usd-coin-usdc-logo.svg';
import wethLogo from './logos/ethereum-eth-logo.svg';
import quesLogo from './logos/question-logo.svg';
import prSymbolGreen from './logos/pr-green.svg';
import prSymbolWhite from './logos/pr-white.svg';
import xSymbol from './logos/x.svg';

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
        <ButtonGroup ml={["0", "auto"]} mr={["0", "50px"]} display={["none", "block"]}>
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
      <Flex w="100%" alignItems="center" justifyContent="center" pt="12%" flexWrap="wrap">
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

class LearnMore extends React.Component {
  render() {
    return (
      <Box
        fontFamily="Orbitron"
        fontWeight="bold"
        fontSize="1.8em"
        mt="12%"
        display={["none", "block"]}
      >
        <Text>
          Learn More
        </Text>
        <Text>
          \/
        </Text>
      </Box>
    );
  }
}

function PullRequestIllustrationEntry(props: any) {
  return (
    <Flex padding="4%" fontSize={["0.9em", "1.3em"]} color="gray.100" alignItems="center">
      <Image src={prSymbolGreen} float="left" height={["10px", "15px"]} pl="2%" pr="4%" />
      <Text>
        {props.text}
      </Text>
      <Image src={xSymbol} height={["5px", "8px"]} pl="3%" />
    </Flex>
  );
  
}

class Explainer extends React.Component {
  render() {
    return (
      <Flex
        w="100%"
        alignItems="center"
        justifyContent="center"
        pt={["18%", "12%"]}
        flexDirection={["column-reverse", "row"]}
      >
        <Box w={["100%", "20%"]} mr={["0", "8%"]}>
          <Box
            w={["50%", "80%"]}
            fontFamily="Courier New"
            bg="gray.700"
            borderRadius="10px"
            m="auto"
            mt={["15%", 0]}
            pb="10%"
          >
            <Flex
              bg="gray.600"
              borderRadius="10px 10px 0 0"
              p="3%"
              pl="5%"
              alignItems="center"
            >
              <Image src={prSymbolWhite} float="left" height={["10px", "15px"]} pl="2%" pr="4%" />
              <Box fontSize="1.3em" fontWeight="bold">
                523 Open
              </Box>
            </Flex>
            <PullRequestIllustrationEntry text="Add HIPPO coin" />
            <PullRequestIllustrationEntry text="Fix SHIB logo" />
            <PullRequestIllustrationEntry text="SAFEMOON update" />
          </Box>
        </Box>
        <Text w={["80%", "40%"]} fontSize={["0.9em", "1.2em"]}>
          Currently, Solana uses a manual GitHub repository to keep track of registered SPL token metadata (the name of the token, the ticker, and URL of the logo).<br /><br />
          Instead, this on-chain token registry allows <strong>anyone to register this metadata, permissionlessly</strong>. No more manual PR reviews to get your token onto Phantom.
        </Text>
      </Flex>
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
        <Box pt={["10vh", "7vh"]} pb="30%">
          <MainTextAndIllustration />
          <LearnMore />
          <Explainer />
          <CallToAction />
        </Box>
      </Box>
    )
  }
  //render() {
  //  return (
  //    <div className="registry">
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

