import React from 'react';
import './App.css';

import solanaLogo from './solana-logo-color-white.svg';

interface RegistryIllustrationTokenProps {
  ticker: string;
}
class RegistryIllustrationToken extends React.Component<RegistryIllustrationTokenProps> {
  render() {
    console.log(this)
    return (
      <div className="registry-illustration-token">
        {"{key: " + this.props.ticker + ", ...}"}
      </div>
    );
  }
}

class Homepage extends React.Component {
  render() {
    return (
      <div className="registry">
        <header className="header">
          <div className="logo">
            <div className="logo-img">
              <img src={solanaLogo} alt="" />
            </div>
            <div className="logo-text">
              Token Registry
            </div>
          </div>
          <a className="link link-github" href="https://github.com/ChrisBender/solana-token-registry">
            GitHub
          </a>
          <div className="link link-launch-app">
            Launch App
          </div>
        </header>
        <div className="main-text-and-registry-illustration">
          <div className="main-text">
            <div className="main-text-title">
              All Solana tokens.<br />In one place.
            </div>
            <div className="main-text-subtitle">
              Register your SPL token metadata on-chain. Stop submitting PRs to the token-list repository. 
            </div>
          </div>
          <div className="registry-illustration">
            <div className="registry-illustration-content">
              <div className="registry-illustration-header">
                0xregistry
              </div>
              <RegistryIllustrationToken ticker="USDC" />
              <RegistryIllustrationToken ticker="wETH" />
              <RegistryIllustrationToken ticker="????" />
            </div>
          </div>
        </div>
        <div className="learn-more">
          <div className="learn-more-text">
            Learn More
          </div>
          <div className="learn-more-symbol">
            \/
          </div>
        </div>
        <div className="explainer">
          <div className="explainer-pr-illustration">
          </div>
          <div className="explainer-text">
            Currently, Solana uses a manual GitHub repository to keep track of registered SPL token metadata (the name of the token, the ticker, and URL of the logo).<br /><br />Instead, this on-chain token registry allows <strong>anyone to register this metadata, permissionlessly</strong>. No more manual PR reviews to get your token onto Phantom.
          </div>
        </div>
        <div className="call-to-action">
        </div>
      </div>
    );
  }
}

class App extends React.Component {
  render() {
    return <Homepage />
  }
}

export default App;

