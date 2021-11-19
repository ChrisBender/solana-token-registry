import React from 'react';
import {
  TokenEntry,
  getAllTokens,
  PROGRAM_ID,
} from 'solana-token-registry';
import { Connection } from '@solana/web3.js';

import {
  Flex,
  Box,
  //Button,
  FormControl,
  FormLabel,
  //FormErrorMessage,
  FormHelperText,
  Image,
  Input,
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
      allTokens: new Set(),
    }
  }

  componentDidMount() {
    getAllTokens(this.props.conn, PROGRAM_ID).then((allTokens) => {
      this.setState({ allTokens })
    });
  }

  render() {
    console.log(this.state.allTokens)
    let readBoxBody;
    if (this.state.allTokens.size === 0) {
      readBoxBody = <Text p="5%">Loading...</Text>;
    } else {
      const allTokensProcessed: React.CElement<any, any>[] = [];
      this.state.allTokens.forEach((token) => {
        console.log(token.extensions)
        allTokensProcessed.push(
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
              ${token.symbol}
            </Text>
            <Text color="gray.100">{token.name}</Text>
          </Flex>
        );
      });
      readBoxBody = <Box h="70vh" overflow="scroll">{allTokensProcessed}</Box>
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
        maxHeight="75vh"
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
        <Text display="none">
          Hello, world!
        </Text>
        <FormControl id="new-token" display="none">
          <FormLabel>Email address</FormLabel>
          <Input type="email" />
          <FormHelperText>We'll never share your email.</FormHelperText>
        </FormControl>
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

