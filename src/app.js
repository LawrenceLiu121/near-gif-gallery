import "regenerator-runtime/runtime";
import twitterLogo from "./assets/twitter-logo.svg";
import { useEffect, useState } from "react";
import React from "react";
import { login, logout } from "./utils";
import "./App.css";

import getConfig from "./config";

// Constants
const TWITTER_HANDLE = "Lawrence_Liu";
const TWITTER_LINK = `https://twitter.com/Lawrenc_Liu${TWITTER_HANDLE}`;

const { networkId } = getConfig(process.env.NODE_ENV || "development");

const App = () => {
  //State
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [gifList, setGifList] = useState([]);

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.walletConnection.isSignedIn()) {
        console.log("Near wallet found!");
        console.log("Connected with Account:", window.accountId);

        setWalletAddress(window.accountId);
      } else {
        alert("Near not found! Get a Near Wallet");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const sendGif = async () => {
    if (inputValue.length == 0) {
      console.log("No gif link given!");
      return;
    }
    console.log("Gif link:", inputValue);
    try {
      window.contract.set_status({
        message: inputValue,
        account_id: window.accountId,
      });
      console.log("GIF successfully sent to program", inputValue);
      setInputValue("");
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error);
    }
  };

  const getGifList = async () => {
    try {
      console.log("Got the account", window.accountId);
      const gifList = await window.contract.get_status({
        account_id: window.accountId,
      });
      console.log(gifList);
      setGifList(gifList);
    } catch (error) {
      console.log("Error in getGifList: ", error);
      setGifList(null);
    }
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching GIF list...");

      // Set state
      getGifList();
    }
  }, [walletAddress]);

  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={login}>
      Connect Wallet
    </button>
  );

  const renderConnectedContainer = () => (
    <div className="connected-container">
      {/* <button className="cta-button connect-wallet-button" onClick={logout}>
        Sign Out
      </button> */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendGif();
        }}
      >
        <input
          type="text"
          placeholder="Enter gif link!"
          value={inputValue}
          onChange={onInputChange}
        />
        <button type="submit" className="cta-button submit-gif-button">
          Submit
        </button>
        {/* <div>{gifList.length} GIFs found</div> */}
      </form>
      <div className="gif-grid">
        {gifList.map((item, index) => (
          <div className="gif-item" key={index}>
            <img src={item.msg} alt="gif_image" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">Film Gif Gallery🔥</p>
          <p className="sub-text">Welcome to Film Gif Gallery!</p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
