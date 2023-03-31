import "./polyfills";
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { injectedWallet, metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import * as Const from "./utils/Const"

/* create configuration for Ethermint testnet */
const ethermint = {
  id: Const.CHAIN_ID,
  name: Const.CHAIN_NAME,
  network: Const.NETWORK,
  nativeCurrency: {
    decimals: 18,
    name: Const.NETWORK,
    symbol:  Const.SYMBOL,
  },
  testnet: true,
};

// remove chain.localhost or ethermint depending on which you want to connect to
const { chains, provider } = configureChains( 
  [ethermint],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: Const.RPC_URL,
      }),
    }),
  ],
);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ chains }),
      injectedWallet({ chains }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})


ReactDOM.createRoot(document.getElementById('root')).render(
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains}>
      <App />
    </RainbowKitProvider>
  </WagmiConfig>
)