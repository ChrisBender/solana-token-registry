import React from 'react';

import {
  Connection,
  PublicKey,
  Transaction
} from '@solana/web3.js';

import {
  TokenEntry,
  getAllTokensGenerator,
  createInstructionCreateEntry,
  PROGRAM_ID,
} from 'solana-token-registry';

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
  isConnectedToPhantom: boolean;
  userPublicKey: PublicKey;
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

  function validateMint(value: string) {
    if (!value) {
      return "Mint is required."
    } else if (value.length !== 44) {
      return "Mint must be 44 characters."
    }
    return null
  }
  function validateSymbol(value: string) {
    if (!value) {
      return "Symbol is required."
    } else {
      return null
    }
  }
  function validateName(value: string) {
    if (!value) {
      return "Name is required."
    } else {
      return null
    }
  }
  function validateLogoURL(value: string) {
    if (!value) {
      return "Logo URL is required."
    } else {
      return null
    }
  }

  function onSubmit(values: any, actions: any) {
    console.log(values)
    console.log(props)
    if (props.userPublicKey === PublicKey.default) {
      alert("Please connect your wallet first.")
      actions.setSubmitting(false)
      return
    }
    createInstructionCreateEntry(
      props.conn,
      PROGRAM_ID,
      props.userPublicKey,
      new PublicKey(values.mint),
      values.symbol,
      values.name,
      values.logoURL,
      ["tag1", "tag2"],
      [["key1", "val1"], ["key2", "val2"]],
    ).then((ix) => {
      const tx = new Transaction().add(ix);
      props.conn.getRecentBlockhash().then((blockhashObj) => {
        tx.recentBlockhash = blockhashObj.blockhash;
        tx.feePayer = props.userPublicKey;
        // @ts-ignore
        window.solana.signTransaction(tx).then((signedTx) => {
          props.conn.sendRawTransaction(signedTx.serialize()).then((signature) => {
            console.log("Signature for CreateEntry:", signature)
            actions.setSubmitting(false)
          }, (error) => {
            actions.setErrors({submitButton: error.logs})
            actions.setSubmitting(false)
          })
        })
      })
    })
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
          initialValues={{
            mint: "",
            symbol: "",
            name: "",
            logoURL: "",
            tagsStablecoin: false,
            tagsLPToken: false,
            tagsWrappedSollet: false,
            tagsWrappedWormhole: false,
            tagsLeveraged: false,
            tagsNFT: false,
            tagsTokenizedStock: false,
            extensionsWebsite: "",
            extensionsTwitter: "",
            extensionsDiscord: "",
            extensionsCoingeckoID: "",
          }}
          onSubmit={onSubmit}
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
              <FormControl p="2%">
                <FormLabel htmlFor="tags">Token Tags</FormLabel>
                <Flex flexWrap="wrap">
                  <Field name="tagsStablecoin">
                    { // @ts-ignore
                    ({ field, form }) => <Checkbox {...field} mr="5%">Stablecoin</Checkbox>}
                  </Field>
                  <Field name="tagsLPToken">
                    { // @ts-ignore
                    ({ field, form }) => <Checkbox {...field} mr="5%">LP Token</Checkbox>}
                  </Field>
                  <Field name="tagsWrappedSollet">
                    { // @ts-ignore
                    ({ field, form }) => <Checkbox {...field} mr="5%">Wrapped via Sollet</Checkbox>}
                  </Field>
                  <Field name="tagsWrappedWormhole">
                    { // @ts-ignore
                    ({ field, form }) => <Checkbox {...field} mr="5%">Wrapped via Wormhole</Checkbox>}
                  </Field>
                  <Field name="tagsLeveraged">
                    { // @ts-ignore
                    ({ field, form }) => <Checkbox {...field} mr="5%">Leveraged</Checkbox>}
                  </Field>
                  <Field name="tagsNFT">
                    { // @ts-ignore
                    ({ field, form }) => <Checkbox {...field} mr="5%">NFT</Checkbox>}
                  </Field>
                  <Field name="tagsTokenizedStock">
                    { // @ts-ignore
                    ({ field, form }) => <Checkbox {...field} mr="5%">Tokenized Stock</Checkbox>}
                  </Field>
                </Flex>
              </FormControl>
              <Flex flexWrap="wrap">
                <Field name="extensionsWebsite">
                  { // @ts-ignore
                  ({ field, form }) => (
                    <FormControl p="2%" w={["auto", "50%"]}>
                      <FormLabel htmlFor="extensionsWebsite">Website</FormLabel>
                      <Input {...field} id="extensionsWebsite" />
                    </FormControl>
                  )}
                </Field>
                <Field name="extensionsTwitter">
                  { // @ts-ignore
                  ({ field, form }) => (
                    <FormControl p="2%" w={["auto", "50%"]}>
                      <FormLabel htmlFor="extensionsTwitter">Twitter</FormLabel>
                      <Input {...field} id="extensionsTwitter" />
                    </FormControl>
                  )}
                </Field>
                <Field name="extensionsDiscord">
                  { // @ts-ignore
                  ({ field, form }) => (
                    <FormControl p="2%" w={["auto", "50%"]}>
                      <FormLabel htmlFor="extensionsDiscord">Discord</FormLabel>
                      <Input {...field} id="extensionsDiscord" />
                    </FormControl>
                  )}
                </Field>
                <Field name="extensionsCoingeckoID">
                  { // @ts-ignore
                  ({ field, form }) => (
                    <FormControl p="2%" w={["auto", "50%"]}>
                      <FormLabel htmlFor="extensionsCoingeckoID">CoinGecko ID</FormLabel>
                      <Input {...field} id="extensionsCoingeckoID" />
                    </FormControl>
                  )}
                </Field>
              </Flex>
              <Box>
                {// @ts-ignore
                props.errors.submitButton}
              </Box>
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

function ReadAndWriteBoxes(props: ReadWriteBoxProps) {
  return (
    <Flex
      w="100%"
      pt={["5%", "5%"]}
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
    >
      <WriteBox {...props} />
      <ReadBox {...props} />
    </Flex>
  );
}

class Application extends React.Component<{}, ReadWriteBoxProps> {

  constructor(props: any) {
    super(props);
    this.state = {
      conn: new Connection('https://api.devnet.solana.com', 'confirmed'),
      isConnectedToPhantom: false,
      userPublicKey: PublicKey.default,
    };
  }

  componentDidMount() {
    // @ts-ignore
    window.solana.on("connect", async () => {
      this.setState({
        isConnectedToPhantom: true,
        // @ts-ignore
        userPublicKey: window.solana._publicKey,
      });
    });
    // @ts-ignore
    window.solana.on("disconnect", async () => {
      this.setState({
        isConnectedToPhantom: false,
        userPublicKey: PublicKey.default,
      });
    });
  }

  render() {
    return (
      <Box>
        <Header suppressLaunchApp isConnectedToPhantom={this.state.isConnectedToPhantom} />
        <Box pt={["10vh", "7vh"]}>
          <ReadAndWriteBoxes {...this.state} />
        </Box>
      </Box>
    );
  }

}

export default Application;

