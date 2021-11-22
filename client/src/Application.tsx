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
import quesLogo from './logos/question-logo.svg';

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
      const allTokensProcessed: React.ReactElement[] = [];
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
          <LinkBox key={token.mint.toString()}>
            <Flex alignItems="center" p="2%">
              <Image
                w={["30px", "50px"]}
                h={["30px", "50px"]}
                src={token.logoURL}
                fallbackSrc={quesLogo}
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

    /* Process the selected tags into an array. */
    const tags: string[] = []
    if (values.tagsStablecoin) {
      tags.push("stablecoin")
    }
    if (values.tagsLPToken) {
      tags.push("lp-token")
    }
    if (values.tagsWrappedSollet) {
      tags.push("wrapped-sollet")
    }
    if (values.tagsWrappedWormhole) {
      tags.push("wrapped-wormhole")
    }
    if (values.tagsLeveraged) {
      tags.push("leveraged")
    }
    if (values.tagsNFT) {
      tags.push("nft")
    }
    if (values.tagsTokenizedStock) {
      tags.push("tokenized-stock")
    }

    /* Process the given extensions into an array. */
    const extensions: [string, string][] = []
    if (values.extensionsWebsite !== "") {
      extensions.push(["website", values.extensionsWebsite])
    }
    if (values.extensionsTwitter !== "") {
      extensions.push(["twitter", values.extensionsTwitter])
    }
    if (values.extensionsDiscord !== "") {
      extensions.push(["discord", values.extensionsDiscord])
    }
    if (values.extensionsCoingeckoID !== "") {
      extensions.push(["coingeckoId", values.extensionsCoingeckoID])
    }

    createInstructionCreateEntry(
      props.conn,
      PROGRAM_ID,
      props.userPublicKey,
      new PublicKey(values.mint),
      values.symbol,
      values.name,
      values.logoURL,
      tags,
      extensions,
    ).then((ix) => {
      const tx = new Transaction().add(ix);
      props.conn.getRecentBlockhash().then((blockhashObj) => {
        tx.recentBlockhash = blockhashObj.blockhash;
        tx.feePayer = props.userPublicKey;
        window.solana.signTransaction(tx).then((signedTx: any) => {
          props.conn.sendRawTransaction(signedTx.serialize()).then((signature) => {
            console.log("Signature for CreateEntry:", signature)
            actions.setSubmitting(false)
          }, (error) => {
            let logLine: string = ""
            for (const line of error.logs) {
              if (line.includes("Error")) {
                logLine = line.replace("Program log: ", "")
                break
              }
            }
            if (logLine === "") {
              logLine = error.logs.join('\n')
            }
            actions.setErrors({submitButton: logLine})
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
          {(props: {errors: {submitButton: string}, isSubmitting: boolean}) => (
            <Form>
              <Field name="mint" validate={validateMint}>
                {(fprops: {form: any, field: any}) => (
                  <FormControl
                    pb="5%"
                    isInvalid={fprops.form.errors.mint && fprops.form.touched.mint}
                  >
                    <FormLabel htmlFor="mint">Mint</FormLabel>
                    <Input {...fprops.field} id="mint" placeholder="e.g. EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" />
                    <FormErrorMessage>{fprops.form.errors.mint}</FormErrorMessage>
                    <FormHelperText>The mint address to register.</FormHelperText>
                  </FormControl>
                )}
              </Field>
              <Field name="symbol" validate={validateSymbol}>
                {(fprops: {form: any, field: any}) => (
                  <FormControl
                    pb="5%"
                    isInvalid={fprops.form.errors.symbol && fprops.form.touched.symbol}
                  >
                    <FormLabel htmlFor="symbol">Symbol</FormLabel>
                    <Input {...fprops.field} id="symbol" placeholder="e.g. USDC" />
                    <FormErrorMessage>{fprops.form.errors.symbol}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="name" validate={validateName}>
                {(fprops: {form: any, field: any}) => (
                  <FormControl
                    pb="5%"
                    isInvalid={fprops.form.errors.name && fprops.form.touched.name}
                  >
                    <FormLabel htmlFor="name">Name</FormLabel>
                    <Input {...fprops.field} id="name" placeholder="e.g. USD Coin" />
                    <FormErrorMessage>{fprops.form.errors.name}</FormErrorMessage>
                  </FormControl>
                )}
              </Field>
              <Field name="logoURL" validate={validateLogoURL}>
                {(fprops: {form: any, field: any}) => (
                  <FormControl
                    pb="5%"
                    isInvalid={fprops.form.errors.logoURL && fprops.form.touched.logoURL}
                  >
                    <FormLabel htmlFor="logoURL">Logo URL</FormLabel>
                    <Input {...fprops.field} id="logoURL" placeholder="e.g. https://bit.ly/USDC.svg" />
                    <FormErrorMessage>{fprops.form.errors.logoURL}</FormErrorMessage>
                    <FormHelperText>Can be HTTPS, IPFS, or Arweave.</FormHelperText>
                  </FormControl>
                )}
              </Field>
              <FormControl p="2%">
                <FormLabel htmlFor="tags">Token Tags</FormLabel>
                <Flex flexWrap="wrap">
                  <Field name="tagsStablecoin">
                    {(fprops: {field: any}) => (
                      <Checkbox {...fprops.field} mr="5%">Stablecoin</Checkbox>
                    )}
                  </Field>
                  <Field name="tagsLPToken">
                    {(fprops: {field: any}) => (
                      <Checkbox {...fprops.field} mr="5%">LP Token</Checkbox>
                    )}
                  </Field>
                  <Field name="tagsWrappedSollet">
                    {(fprops: {field: any}) => (
                      <Checkbox {...fprops.field} mr="5%">Wrapped via Sollet</Checkbox>
                    )}
                  </Field>
                  <Field name="tagsWrappedWormhole">
                    {(fprops: {field: any}) => (
                      <Checkbox {...fprops.field} mr="5%">Wrapped via Wormhole</Checkbox>
                    )}
                  </Field>
                  <Field name="tagsLeveraged">
                    {(fprops: {field: any}) => (
                      <Checkbox {...fprops.field} mr="5%">Leveraged</Checkbox>
                    )}
                  </Field>
                  <Field name="tagsNFT">
                    {(fprops: {field: any}) => (
                      <Checkbox {...fprops.field} mr="5%">NFT</Checkbox>
                    )}
                  </Field>
                  <Field name="tagsTokenizedStock">
                    {(fprops: {field: any}) => (
                      <Checkbox {...fprops.field} mr="5%">Tokenized Stock</Checkbox>
                    )}
                  </Field>
                </Flex>
              </FormControl>
              <Flex flexWrap="wrap">
                <Field name="extensionsWebsite">
                  {(fprops: {field: any}) => (
                    <FormControl p="2%" w={["auto", "50%"]}>
                      <FormLabel htmlFor="extensionsWebsite">Website</FormLabel>
                      <Input {...fprops.field} id="extensionsWebsite" />
                    </FormControl>
                  )}
                </Field>
                <Field name="extensionsTwitter">
                  {(fprops: {field: any}) => (
                    <FormControl p="2%" w={["auto", "50%"]}>
                      <FormLabel htmlFor="extensionsTwitter">Twitter</FormLabel>
                      <Input {...fprops.field} id="extensionsTwitter" />
                    </FormControl>
                  )}
                </Field>
                <Field name="extensionsDiscord">
                  {(fprops: {field: any}) => (
                    <FormControl p="2%" w={["auto", "50%"]}>
                      <FormLabel htmlFor="extensionsDiscord">Discord</FormLabel>
                      <Input {...fprops.field} id="extensionsDiscord" />
                    </FormControl>
                  )}
                </Field>
                <Field name="extensionsCoingeckoID">
                  {(fprops: {field: any}) => (
                    <FormControl p="2%" w={["auto", "50%"]}>
                      <FormLabel htmlFor="extensionsCoingeckoID">CoinGecko ID</FormLabel>
                      <Input {...fprops.field} id="extensionsCoingeckoID" />
                    </FormControl>
                  )}
                </Field>
              </Flex>
              <Text color="red" mt="5%">
                {props.errors.submitButton}
              </Text>
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

  constructor(props: {[key: string]: never}) {
    super(props);
    this.state = {
      conn: new Connection('https://api.devnet.solana.com', 'confirmed'),
      isConnectedToPhantom: false,
      userPublicKey: PublicKey.default,
    };
  }

  componentDidMount() {
    if (window.solana !== undefined) {
      window.solana.on("connect", async () => {
        this.setState({
          isConnectedToPhantom: true,
          userPublicKey: window.solana._publicKey,
        });
      });
      window.solana.on("disconnect", async () => {
        this.setState({
          isConnectedToPhantom: false,
          userPublicKey: PublicKey.default,
        });
      });
      window.solana.connect();
    }
  }

  render() {
    return (
      <Box>
        <Header suppressLaunchApp isConnectedToPhantom={this.state.isConnectedToPhantom} />
        <Box pt={["0", "7vh"]}>
          <ReadAndWriteBoxes {...this.state} />
        </Box>
      </Box>
    );
  }

}

export default Application;

