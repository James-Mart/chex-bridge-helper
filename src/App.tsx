import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { SessionKit } from "@wharfkit/session"
import { WebRenderer } from "@wharfkit/web-renderer"
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor"

function App() {
  const [count, setCount] = useState(0)

  const webRenderer = new WebRenderer()

  const eos = {
      id: 'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906',
      url: 'https://eos.greymass.com',
  }

  const sessionKit = new SessionKit({
    appName: "manual-chex-bridge",
    chains: [eos],
    ui: webRenderer,
    walletPlugins: [new WalletPluginAnchor()],
  })

  const login = async () => {
    const { session } = await sessionKit.login();
  }
  
    return (
      <div className="app-container">
        <div className="header-bar">
          <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/8534.png" alt="Chex Logo" className="logo"/>
          <h1 className="app-title">Manual <span className="highlight">$CHEX</span> Bridge</h1>
        </div>

        <p className="app-description">This is just a simple front-end to help transfer EOS tokens to the manual $CHEX bridge. It validates your Ethereum address so that you don't accidentally specify the wrong address in the memo of the transfer to the bridge.</p>
        
        <div className="account-section">

          <label className="account-label">
            <h3>Connect EOS account</h3>
            <button className="login-button">Login to Anchor</button>
          </label>
          
          <label className="account-label">
            <h3>Connect Metamask account</h3>
            <button className="login-button">Login to Metamask</button>
          </label>
        </div>
        
        <div className="conversion-section">
        
          <h3>Transfer</h3>
        
          <label className="balance-label">
            Your <span className="highlight">$CHEX</span> balance:
            <span id="chexBalance">0</span>
          </label>
        
          <label className="conversion-label">
            Amount of <span className="highlight">$CHEX</span> to send to bridge: 
            <input type="number" className="conversion-input"/>
          </label>

          <button className="submit-button">Transfer</button>
        </div>
      </div>
    )
}

export default App
