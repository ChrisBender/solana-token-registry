import React from 'react';
import ReactDOM from 'react-dom';
import { ChakraProvider, extendTheme } from "@chakra-ui/react"
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from './Homepage';
import Application from './Application'

import "@fontsource/orbitron/400.css"
import "@fontsource/rubik/700.css"

const theme = extendTheme({
  colors: {
    sol: {
      green: "#00D18C",
      purple: "#9945FF",
    },
    gray: {
      100: "#ABABAB",
      800: "#1E2423",
      900: "#161B19",
    }
  },
  fonts: {
    heading: "Orbitron",
    body: "Rubik",
  },
  styles: {
    global: {
      body: {
        bg: "gray.900",
        color: "white",
      }
    }
  },
  components: {
    Button: {
      baseStyle: {
        width: ["40vw", "auto"],
      },
      variants: {
        "github": {
          border: "1px solid #ABABAB",
        },
        "launch-app": {
          color: "#293D35",
          backgroundColor: "#00D18C",
          border: "2px solid #025338",
        }
      }
    }
  }
});

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/app" element={<Application />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
