import React from 'react';
import {
  TokenEntry,
  getAllTokensGenerator,
  PROGRAM_ID,
} from 'solana-token-registry';
import { Connection } from '@solana/web3.js';

import {
  Flex,
  Box,
  Checkbox,
  FormControl,
  FormLabel,
  FormHelperText,
  Image,
  Input,
  LinkBox,
  LinkOverlay,
  Text,
} from '@chakra-ui/react';

import { Header } from './Common';

interface ReadWriteBoxProps {
  conn: Connection;
}
interface ReadBoxState {
  allTokens: Set<TokenEntry>;
}

class ReadBox extends React.Component<ReadWriteBoxProps, ReadBoxState> {

  constructor(props: ReadWriteBoxProps) {
    super(props);
    this.state = {
      allTokens: new Set<TokenEntry>(),
    }
  }

  componentDidMount() {
    getAllTokensGenerator(this.props.conn, PROGRAM_ID).then(async (allTokensGenerator) => {
      const allTokens = new Set<TokenEntry>()
      for await (const token of allTokensGenerator) {
        allTokens.add(token)
        if (allTokens.size >= 8) {
          this.setState({ allTokens })
        }
      }
    })
  }

  render() {
    let readBoxBody;
    if (this.state.allTokens.size === 0) {
      readBoxBody = <Text h="70vh" p="5%">Loading...</Text>;
    } else {
      const allTokensProcessed: React.CElement<any, any>[] = [];
      this.state.allTokens.forEach((token) => {
        let link: string = ""
        for (const [key, val] of token.extensions) {
          if (key === "website") {
            link = val;
          }
        }
        if (link === "") {
          link = `https://explorer.solana.com/address/${token.mint}?cluster=devnet`
        }
        allTokensProcessed.push(
          <LinkBox>
            <Flex
              key={token.mint.toString()}
              alignItems="center"
              p="2%"
            >
              <Image
                w={["30px", "50px"]}
                h={["30px", "50px"]}
                src={token.logoURL}
                ml="2%"
                mr="3%"
              />
              <Text
                fontWeight="bold"
                pr="3%"
              >
                <LinkOverlay href={link} target="_blank">${token.symbol}</LinkOverlay>
              </Text>
              <Text color="gray.100">{token.name}</Text>
            </Flex>
          </LinkBox>
        );
      });
      readBoxBody = <Box h={["auto", "70vh"]} overflow={["auto", "scroll"]}>{allTokensProcessed}</Box>
    }
    return (
      <Box
        w={["90%", "30%"]}
        bg="gray.700"
        borderRadius="10px"
        mr={["0", "5%"]}
        mb={["5%", "0"]}
      >
        <Text
          fontFamily="Orbitron"
          fontWeight="bold"
          fontSize="1.3em"
          borderRadius="8px 8px 0 0"
          bg="sol.purple"
          p="2%"
        >
          Read All Tokens
        </Text>
        {readBoxBody}
      </Box>
    );
  }
}

class WriteBox extends React.Component<ReadWriteBoxProps> {
  render() {
    return (
      <Box
        w={["90%", "30%"]}
        bg="gray.700"
        borderRadius="10px"
        ml={["0", "5%"]}
      >
        <Text
          fontFamily="Orbitron"
          fontWeight="bold"
          fontSize="1.3em"
          borderRadius="8px 8px 0 0"
          bg="sol.green"
          color="#293D35"
          p="2%"
        >
          Register a Token
        </Text>
        <Box h={["auto", "70vh"]} overflow={["auto", "scroll"]} p="5% 5% 0 5%">
          <FormControl id="token-mint" pb="5%" isRequired>
            <FormLabel>Token Mint</FormLabel>
            <Input type="text" placeholder="e.g. EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" />
            <FormHelperText>The mint address of your token.</FormHelperText>
          </FormControl>
          <FormControl id="token-symbol" pb="5%" isRequired>
            <FormLabel>Symbol</FormLabel>
            <Input type="text" placeholder="e.g. USDC" />
          </FormControl>
          <FormControl id="token-name" pb="5%" isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input type="text" placeholder="e.g. USD Coin" />
          </FormControl>
          <FormControl id="token-logo-url" pb="5%" isRequired>
            <FormLabel>Logo URL</FormLabel>
            <Input type="text" placeholder="e.g. https://bit.ly/USDC.svg" />
            <FormHelperText>Can be HTTP, IPFS, Arweave, etc.</FormHelperText>
          </FormControl>
          <FormControl id="token-tags" pb="5%">
            <FormLabel>Token Tags</FormLabel>
            <Flex flexWrap="wrap">
              <Checkbox mr="5%">Stablecoin</Checkbox>
              <Checkbox mr="5%">LP Token</Checkbox>
              <Checkbox mr="5%">Wrapped via Sollet</Checkbox>
              <Checkbox mr="5%">Wrapped via Wormhole</Checkbox>
              <Checkbox mr="5%">Leveraged</Checkbox>
              <Checkbox mr="5%">NFT</Checkbox>
              <Checkbox mr="5%">Tokenized Stock</Checkbox>
            </Flex>
          </FormControl>
          <Flex flexWrap="wrap">
            <FormControl id="token-extensions-website" w="50%" p="0 3% 3% 3%">
              <FormLabel>Website</FormLabel>
              <Input type="text" />
            </FormControl>
            <FormControl id="token-extensions-twitter" w="50%" p="0 3% 3% 3%">
              <FormLabel>Twitter</FormLabel>
              <Input type="text" />
            </FormControl>
            <FormControl id="token-extensions-discord" w="50%" p="0 3% 3% 3%">
              <FormLabel>Discord</FormLabel>
              <Input type="text" />
            </FormControl>
            <FormControl id="token-extensions-coingecko-id" w="50%" p="0 3% 3% 3%">
              <FormLabel>CoinGecko ID</FormLabel>
              <Input type="text" />
            </FormControl>
          </Flex>
        </Box>
      </Box>
    );
  }
}

class ReadAndWriteBoxes extends React.Component<{}, ReadWriteBoxProps> {
  constructor(props: any) {
    super(props);
    this.state = {
      conn: new Connection('https://api.devnet.solana.com', 'confirmed')
    };
  }
  render() {
    return (
      <Flex
        w="100%"
        pt={["5%", "5%"]}
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
      >
        <ReadBox conn={this.state.conn} />
        <WriteBox conn={this.state.conn} />
      </Flex>
    );
  }
}

class Application extends React.Component {
  render() {
    return (
      <Box>
        <Header onlyGitHub />
        <Box pt={["10vh", "7vh"]}>
          <ReadAndWriteBoxes />
        </Box>
      </Box>
    );
  }
}

export default Application;

