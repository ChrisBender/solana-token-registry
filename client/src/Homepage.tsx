import React from 'react'
import { Link as RouterLink } from 'react-router-dom'

import {
  Flex,
  Box,
  Image,
  Link,
  Button,
  Text
} from '@chakra-ui/react'

import usdcLogo from './logos/usd-coin-usdc-logo.svg'
import wethLogo from './logos/ethereum-eth-logo.svg'
import quesLogo from './logos/question-logo.svg'
import prSymbolGreen from './logos/pr-green.svg'
import prSymbolWhite from './logos/pr-white.svg'
import xSymbol from './logos/x.svg'

import { Header } from './Common'

interface RegistryIllustrationTokenProps {
  logo: string,
  ticker: string,
}
function RegistryIllustrationToken (props: RegistryIllustrationTokenProps) {
  return (
    <Flex padding="4%" fontSize={['1.1em', '1.5em']} alignItems="center">
      <Image src={props.logo} float="left" height={['30px', '50px']} pl="2%" pr="3%" />
      <Box>
        {'{key: ' + props.ticker + ', ...}'}
      </Box>
    </Flex>
  )
}

function MainTextAndIllustration (props: {[key: string]: never}) {
  return (
    <Flex
      w="100%"
      alignItems="center"
      justifyContent="center"
      mt={['10%', '12%']}
      flexWrap="wrap"
    >
      <Box w={['100%', '30%']} m={['0 5% 0 5%', '0 8% 0 0']}>
        <Text fontFamily="Orbitron" fontWeight="bold" fontSize={['2.5em', '3.8em']}>
          All Solana tokens.<br />In one place.
        </Text>
        <Text color="gray.100" fontSize={['1.1em', '1.2em']} mt="8%">
          Register your SPL token metadata on-chain. Stop submitting PRs to the token-list repository.
        </Text>
      </Box>
      <Box w={['100%', '30%']}>
        <Box w={['65%', '70%']} fontFamily="Courier New" bg="gray.700" borderRadius="10px" m="auto" mt={['15%', 0]}>
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

function LearnMore (props: {[key: string]: never}) {
  return (
    <Box
      fontFamily="Orbitron"
      fontWeight="bold"
      fontSize={['1.2em', '1.8em']}
      mt={['22%', '12%']}
    >
      <Text>
        Learn More
      </Text>
      <Text>
        \/
      </Text>
    </Box>
  )
}

interface PullRequestIllustrationEntryProps {
  text: string;
}
function PullRequestIllustrationEntry (props: PullRequestIllustrationEntryProps) {
  return (
    <Flex padding="4%" fontSize={['0.9em', '1.3em']} color="gray.100" alignItems="center">
      <Image src={prSymbolGreen} float="left" height={['10px', '15px']} pl="2%" pr="4%" />
      <Text>
        {props.text}
      </Text>
      <Image src={xSymbol} height={['5px', '8px']} pl="3%" />
    </Flex>
  )
}

function Explainer (props: {[key: string]: never}) {
  return (
    <Flex
      w="100%"
      alignItems="center"
      justifyContent="center"
      mt={['18%', '12%']}
      flexDirection={['column-reverse', 'row']}
    >
      <Box w={['100%', '20%']} mr={['0', '8%']}>
        <Box
          w={['50%', '80%']}
          fontFamily="Courier New"
          bg="gray.700"
          borderRadius="10px"
          m="auto"
          mt={['15%', 0]}
          pb="6%"
        >
          <Flex
            bg="gray.600"
            borderRadius="10px 10px 0 0"
            p="3%"
            pl="5%"
            alignItems="center"
          >
            <Image src={prSymbolWhite} float="left" height={['10px', '15px']} pl="2%" pr="4%" />
            <Box fontSize="1.3em" fontWeight="bold">
              523 Open
            </Box>
          </Flex>
          <PullRequestIllustrationEntry text="Add HIPPO coin" />
          <PullRequestIllustrationEntry text="Fix SHIB logo" />
          <PullRequestIllustrationEntry text="SAFEMOON update" />
        </Box>
      </Box>
      <Text w={['80%', '40%']} fontSize={['1.0em', '1.2em']}>
        Currently, Solana uses a GitHub repository to keep track of SPL token metadata, like the name of the token and a URL of the logo.<br /><br />
        Instead, this on-chain token registry lets you <strong>register this metadata permissionlessly</strong>. No more manual PR reviews to get your token onto Phantom.
      </Text>
    </Flex>
  )
}

interface CallToActionBoxProps {
  buttonWrapper: React.ElementType;
  buttonWrapperProps: {[key: string]: any};
  mainText: string;
  subText: string;
  buttonText: string;
  buttonTextMobile: string;
  buttonVariant: string;
  isFirst: boolean;
}
function CallToActionBox (props: CallToActionBoxProps) {
  const ButtonWrapper = props.buttonWrapper
  return (
      <Flex
        w={['80%', '25%']}
        m={['0 6% 0 6%', '0 6% 35% 6%']}
        mt={props.isFirst ? '25%' : '30%'}
        flexDirection="column"
        alignItems="center"
      >
        <Text fontFamily="Orbitron" fontWeight="bold" fontSize={['1.3em', '1.7em']}>
          {props.mainText}
        </Text>
        <Text mt="6%" mb="12%" fontSize={['1.0em', '1.2em']}>
          {props.subText}
        </Text>
        <ButtonWrapper {...props.buttonWrapperProps}>
          <Button
            variant={props.buttonVariant}
            fontSize="1.2em"
            w="200px"
            display={['none', 'block']}
          >
            {props.buttonText}
          </Button>
          <Button
            variant={props.buttonVariant}
            fontSize="1.0em"
            w="200px"
            display={['block', 'none']}
          >
            {props.buttonTextMobile}
          </Button>
        </ButtonWrapper>
      </Flex>
  )
}

function CallToAction (props: {[key: string]: never}) {
  return (
    <Flex
      w="100%"
      mt={['0', '18%']}
      mb={['45%', '0']}
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
    >
      <CallToActionBox
        buttonWrapper={Link}
        buttonWrapperProps={{
          href: 'https://github.com/ChrisBender/solana-token-registry/blob/master/js/src/index.ts#L279',
          isExternal: true
        }}
        mainText="For Developers"
        subText="Use the JavaScript API to read and write to the token registry."
        buttonText="Read Docs"
        buttonTextMobile="Read Docs on GitHub"
        buttonVariant="read-docs"
        isFirst={true}
      />
      <CallToActionBox
        buttonWrapper={RouterLink}
        buttonWrapperProps={{ to: '/app' }}
        mainText="For Token Creators"
        subText="Use the in-browser app to register your token on-chain."
        buttonText="Launch App"
        buttonTextMobile="Launch App"
        buttonVariant="launch-app"
        isFirst={false}
      />
    </Flex>
  )
}

function Homepage (props: {[key: string]: never}) {
  return (
    <Box>
      <Header suppressPhantom />
      <Box pt={['0', '7vh']}>
        <MainTextAndIllustration />
        <LearnMore />
        <Explainer />
        <CallToAction />
      </Box>
    </Box>
  )
}

export default Homepage
