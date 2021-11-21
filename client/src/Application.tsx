import React from 'react';
import {
  TokenEntry,
  getAllTokensGenerator,
  PROGRAM_ID,
} from 'solana-token-registry';
import { Connection } from '@solana/web3.js';
import {
  Formik,
  Form,
  Field
} from 'formik';

import {
  Flex,
  Box,
  Button,
  Center,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
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
        ml={["0", "5%"]}
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

function WriteBox(props: ReadWriteBoxProps) {

  function validateMint(value: any) {
    let error
    if (!value) {
      error = "Mint is required."
    }
    return error
  }
  function validateSymbol(value: any) {
    return null
  }
  function validateName(value: any) {
    return null
  }
  function validateLogoURL(value: any) {
    return null
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
        bg="sol.green"
        color="#293D35"
        p="2%"
      >
        Register a Token
      </Text>
      <Box h={["auto", "70vh"]} overflow={["auto", "scroll"]} p="5% 5% 0 5%">
        <Formik
          initialValues={{ mint: "" }}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              alert(JSON.stringify(values, null, 2))
              actions.setSubmitting(false)
            }, 1000)
          }}
        >
          {(props) => (
            <Form>
              <Field name="mint" validate={validateMint}>
                { // @ts-ignore
                ({ field, form }) => (
                  <FormControl pb="5%" isInvalid={form.errors.mint && form.touched.mint}>
                    <FormLabel htmlFor="mint">Mint</FormLabel>
                    <Input {...field} id="mint" placeholder="e.g. EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" />
                    <FormErrorMessage>{form.errors.mint}</FormErrorMessage>
                    <FormHelperText>The mint address to register.</FormHelperText>
                  </FormControl>
                )}
              </Field>
              <Field name="symbol" validate={validateSymbol}>
                { // @ts-ignore
                ({ field, form }) => (
                  <FormControl pb="5%" isInvalid={form.errors.symbol && form.touched.symbol}>
                    <FormLabel htmlFor="symbol">Symbol</FormLabel>
                    <Input {...field} id="symbol" placeholder="e.g. USDC" />
                    <FormErrorMessage>{form.errors.symbol}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="name" validate={validateName}>
                { // @ts-ignore
                ({ field, form }) => (
                  <FormControl pb="5%" isInvalid={form.errors.name && form.touched.name}>
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <Input {...field} id="name" placeholder="e.g. USD Coin" />
                    <FormErrorMessage>{form.errors.name}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="logoURL" validate={validateLogoURL}>
                { // @ts-ignore
                ({ field, form }) => (
                  <FormControl pb="5%" isInvalid={form.errors.logoURL && form.touched.logoURL}>
                    <FormLabel htmlFor="logoURL">Logo URL</FormLabel>
                    <Input {...field} id="logoURL" placeholder="e.g. https://bit.ly/USDC.svg" />
                    <FormErrorMessage>{form.errors.logoURL}</FormErrorMessage>
                    <FormHelperText>Can be HTTPS, IPFS, or Arweave.</FormHelperText>
                  </FormControl>
                )}
              </Field>
              <FormControl pb="5%">
                <FormLabel htmlFor="tags">Token Tags</FormLabel>
                <Flex flexWrap="wrap">
                  <Field name="tags-stablecoin">
                    { // @ts-ignore
                    ({ field, form }) => <Checkbox {...field} mr="5%">Stablecoin</Checkbox>}
                  </Field>
                  <Field name="tags-lp-token">
                    { // @ts-ignore
                    ({ field, form }) => <Checkbox {...field} mr="5%">LP Token</Checkbox>}
                  </Field>
                  <Field name="tags-wrapped-sollet">
                    { // @ts-ignore
                    ({ field, form }) => <Checkbox {...field} mr="5%">Wrapped via Sollet</Checkbox>}
                  </Field>
                  <Field name="tags-wrapped-wormhole">
                    { // @ts-ignore
                    ({ field, form }) => <Checkbox {...field} mr="5%">Wrapped via Wormhole</Checkbox>}
                  </Field>
                  <Field name="tags-leveraged">
                    { // @ts-ignore
                    ({ field, form }) => <Checkbox {...field} mr="5%">Leveraged</Checkbox>}
                  </Field>
                  <Field name="tags-nft">
                    { // @ts-ignore
                    ({ field, form }) => <Checkbox {...field} mr="5%">NFT</Checkbox>}
                  </Field>
                  <Field name="tags-tokenized-stock">
                    { // @ts-ignore
                    ({ field, form }) => <Checkbox {...field} mr="5%">Tokenized Stock</Checkbox>}
                  </Field>
                </Flex>
              </FormControl>
              <Flex flexWrap="wrap">
                <Field name="extensions-website">
                  { // @ts-ignore
                  ({ field, form }) => (
                    <FormControl pb="5%" w="50%">
                      <FormLabel htmlFor="extensions-website">Website</FormLabel>
                      <Input {...field} id="extensions-website" />
                    </FormControl>
                  )}
                </Field>
                <Field name="extensions-twitter">
                  { // @ts-ignore
                  ({ field, form }) => (
                    <FormControl pb="5%" w="50%">
                      <FormLabel htmlFor="extensions-twitter">Twitter</FormLabel>
                      <Input {...field} id="extensions-twitter" />
                    </FormControl>
                  )}
                </Field>
                <Field name="extensions-discord">
                  { // @ts-ignore
                  ({ field, form }) => (
                    <FormControl pb="5%" w="50%">
                      <FormLabel htmlFor="extensions-discord">Discord</FormLabel>
                      <Input {...field} id="extensions-discord" />
                    </FormControl>
                  )}
                </Field>
                <Field name="extensions-coingecko-id">
                  { // @ts-ignore
                  ({ field, form }) => (
                    <FormControl pb="5%" w="50%">
                      <FormLabel htmlFor="extensions-coingecko-id">CoinGecko ID</FormLabel>
                      <Input {...field} id="extensions-coingecko-id" />
                    </FormControl>
                  )}
                </Field>
              </Flex>
              <Center>
                <Button
                  variant="launch-app"
                  m="8% 0 10% 0"
                  p="0 8% 0 8%"
                  colorScheme="teal"
                  type="submit"
                  isLoading={props.isSubmitting}
                >
                  Submit
                </Button>
              </Center>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );

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
        <WriteBox conn={this.state.conn} />
        <ReadBox conn={this.state.conn} />
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

