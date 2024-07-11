import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import '@fontsource/rubik';

import App from './App.jsx'


//extend default theme

//TODO
const colors = {}

const fonts = {
  body: 'Rubik,sans-serif',
  heading: 'Rubik,sans-serif'
}

const theme = extendTheme({ fonts });


ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <BrowserRouter>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </BrowserRouter>
  // </React.StrictMode>
)
