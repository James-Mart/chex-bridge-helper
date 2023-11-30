import { useState, useEffect } from 'react'
import './App.css'

import { SessionKit, Session } from "@wharfkit/session"
import { WebRenderer } from "@wharfkit/web-renderer"
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor"
import useLocalStorageState from 'use-local-storage-state';
import { ContractKit } from "@wharfkit/contract";
import { APIClient, Asset } from "@wharfkit/antelope"
import { ethers } from "ethers";
import { FaTelegramPlane } from 'react-icons/fa';

declare global {
  interface Window {
    ethereum: any;
  }
}

let session : Session;
const webRenderer = new WebRenderer();

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

const contractKit = new ContractKit({
  client: new APIClient({url: "https://eos.greymass.com"}),
})

function App() {
  
  const [anchorSession, setAnchorSession] = useLocalStorageState<Session | null>('session', {
    defaultValue: null,
  });

  const [balance, setBalance] = useState<number>(0);
  const [ethAddress, setEthAddress] = useState<string>("");

  const [amount, setAmount] = useState<number>(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    if (value === '') {
      setAmount(0);
    } else if (!isNaN(parseInt(value))) {
      setAmount(parseInt(value));
    }
  };

  const formatNumber = (number: number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  useEffect(() => {
    if (anchorSession) {
      
      const fetchBalance = async () => {
      
        const contract = await contractKit.load("chexchexchex");
        const table = contract.table("accounts", anchorSession.actor.toString());
        
        const result = await table.get();
        const newBalance : Asset  = result.balance;
        setBalance(newBalance.value);
      };

      fetchBalance();
    }
  }, [anchorSession]);

  const handleAnchorLogin = async () => {
    const response = await sessionKit.login();
    setAnchorSession(response.session);
  };

  const handleMMLogin = async () => {
    async function loginWithMetaMask(): Promise<string | null> {
      if (!window.ethereum) {
        console.error("MetaMask is not installed!");
        return null;
      }
    
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const account = accounts[0];

        return account;
      } catch (error) {
        console.error("Error logging in with MetaMask", error);
        return null;
      }
    }
    
    loginWithMetaMask().then((address) => {
      if (address) {
        console.log(`Logged in with address: ${address}`);
        setEthAddress(address);
      }
    });
  };

  const handleTransfer = async () => {
    if (!anchorSession)
    {
      alert("You're not logged in with Anchor");
    }
    if (!ethAddress)
    {
      alert("You're not logged in with MetaMask");
    }
    if (amount < 10000)
    {
      alert("Transfer amount must be greater than 10,000");
    }

    if (anchorSession && ethAddress && amount >= 10000)
    {
      const contract = await contractKit.load("chexchexchex");
      const action = contract.action("transfer", {
        from: anchorSession.actor,
        to: "james.x", // Change to eth.chintai
        quantity: `${amount}.00000000 CHEX`,
        memo: ethAddress,
      })

      const result = await session.transact({ action });
      console.log(result);
    }
  };

    return (
      <div className="app-container">
        <div className="header-bar">
          <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/8534.png" alt="Chex Logo" className="logo"/>
          <h1 className="app-title">Manual $CHEX Bridge</h1>
        </div>

        <div className="app-description">
          This is just a simple front-end to help transfer EOS tokens to the manual $CHEX bridge. It validates your Ethereum address so that you don't accidentally specify the wrong address in the memo of the transfer to the bridge.
        
          Because this is a manual bridge, here are the rules:
          <ul>
            <li>Only one transfer per account</li>
            <li>Minimum transfer: 10k $Chex</li>
            <li>This bridge closes at 21:00 UTC on 30th November (No more transfers)</li>
            <li>Migration to specified Ethereum address will happen between Dec 1-5</li>
          </ul>
        </div>
        
        
        <div className="account-section">

          <label className="account-label">
            <h3>Step 1: Connect EOS account</h3>
            <h5>This will be the account from which you send $CHEX. Refresh page if you logged in as the wrong account.</h5>
            {anchorSession ? (
              <div className="details">{String(anchorSession.actor)}</div>
            ) : (
              <button className="login-button" onClick={handleAnchorLogin}>Login to Anchor</button>
            )}
          </label>
          
          <label className="account-label">
            <h3>Step 2: Connect Metamask account</h3>
            <h5>This will be the address on ETH to which your CHEX is migrated</h5>
            
            {ethAddress ? (
              <div className="details">{ethAddress}</div>
            ) : (
              <button className="login-button" onClick={handleMMLogin}>Login to Metamask</button>
            )}

          </label>
        </div>
        
        <div className="conversion-section">
        
          <h3>Step 3: Transfer</h3>
          <h5>This sends $CHEX to a contract on EOS (eth.chintai). This $CHEX will be burned and the same amount will be minted on Ethereum and sent to the address linked above.</h5>
          <label className="balance-label">
          From EOS account: {anchorSession ? String(anchorSession.actor) : "<not logged in>"}

          </label>

          <label className="balance-label">
            Your <span className="highlight">$CHEX</span> balance on EOS:
            <span id="chexBalance">{balance}</span>
          </label>
        

          <div className="input-and-button-container">
            <div className="conversion-input-group">
            <input 
              type="text" 
              className="conversion-input" 
              min="10000" 
              value={formatNumber(amount)} 
              onChange={handleInputChange} 
            />
              <label className="chex-label highlight">$CHEX</label>
            </div>
            <button className="submit-button" onClick={handleTransfer}>Transfer to bridge</button>
          </div>
        </div>

        <div className="conversion-section"> 
          {/* It's actually a footer */}
          <a href="https://t.me/chex_token" target="_blank" rel="noopener noreferrer">
            <FaTelegramPlane size={30} /> Community telegram
          </a>
        </div>
      </div>
    )
}

export default App
