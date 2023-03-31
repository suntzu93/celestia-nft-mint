import React, { useState, useEffect } from "react";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import NFT from "../abi/CelestiaNFT.json";
import { useAccount } from "wagmi";
import "./App.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { Snackbar } from "@mui/material";
import Loader from "./loader";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import * as Const from "./utils/Const";
import LoadingButton from "@mui/lab/LoadingButton";

const contractAddress = "0xda4cB4430e8f5df91723804f2C7163127161Ab75";

const App = () => {
  const [fetchNewData, setFetchNewData] = useState(true);
  const [isShowAddNetWork, setIsShowAddNetWork] = useState("");
  const [disableFaucet, setDisableFaucet] = useState(false);
  const { address } = useAccount();
  const [count, setCount] = useState(0);
  const [baseUri, setBaseUri] = useState();
  const [description, setDescription] = useState();
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const [loadingFaucet, setLoadingFaucet] = useState(false);

  useEffect(() => {
    if (fetchNewData) {
      fetchCount();
      setFetchNewData(false);

      if (window.ethereum) {
        if (parseInt(window.ethereum.networkVersion) === Const.CHAIN_ID) {
          setIsShowAddNetWork("none");
        }
      }

      const faucetTime = localStorage.getItem("faucet")
      if (faucetTime){
        const currentTime = new Date().getTime();
        if (currentTime < parseInt(faucetTime) + 5 * 60 * 1000){
          setDisableFaucet(true);
        }
      }
    }
  }, [fetchNewData]);


  const [alert, setAlert] = React.useState({
    open: false,
    time: 3000,
    alertType: "",
    message: "",
    vertical: "top",
    horizontal: "center",
  });

  const { vertical, horizontal } = alert;
  function alertMsg(alertType, message) {
    setAlert({
      ...alert,
      open: true,
      alertType: alertType,
      message: message,
    });
  }

  function handleCloseAlert() {
    setAlert({
      ...alert,
      open: false,
      alertType: "",
      message: "",
    });
  }

  /* when the component loads, useEffect will call this function */
  async function fetchCount() {
    if (!window.ethereum  || address === undefined) {
      alertMsg("error", "MetaMask is not installed.");
      return;
    }

    setLoadingCollection(true);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, NFT.abi, provider);

    let count = await contract.balanceOf(address);
    setCount(parseInt(count));
    let metadata = await contract.baseURI();
    let metaObj = await (await fetch(metadata)).json();

    setBaseUri(metaObj.image);
    setDescription(metaObj.description);
    setLoadingCollection(false);
  }

  async function mint() {
    if (!window.ethereum  || address === undefined) {
      alertMsg("error", "MetaMask is not installed.");
      return;
    }

    if (amount > 5) {
      alertMsg("error", "Cannot mint > 5 NFT each time !");
      return;
    }
    try {
      const totalAmount = amount * 0.15;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(contractAddress, NFT.abi, signer);
      const transaction = await contract.mintNft(amount, {
        value: ethers.utils.parseEther(totalAmount.toString()),
      });
      setLoading(true);

      await transaction.wait();
      setLoading(false);
      setFetchNewData(true);
      alertMsg("success", "Minted NFT success !");
    } catch (e) {
      console.log(e);
      alertMsg("error", "Error to mint NFT!");
    }
  }

  const inputNumber = (event) => {
    setAmount(event.target.value);
  };

  const addCustomNetwork = async () => {
    if (!window.ethereum  || address === undefined) {
      alertMsg("error", "MetaMask is not installed.");
      return;
    }
    const customNetwork = {
      chainId: Const.CHAIN_ID_HEX,
      chainName: Const.CHAIN_NAME,
      rpcUrls: [Const.RPC_URL],
      nativeCurrency: {
        name: Const.NETWORK,
        symbol: Const.SYMBOL,
        decimals: 18,
      },
      blockExplorerUrls: null, // Custom block explorer URL
    };
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [customNetwork],
      });
      alertMsg("success", "Successfully added custom network to MetaMask.");
    } catch (error) {
      alertMsg("error", error);
    }
  };

  const requestFaucet = async () => {
    if (!window.ethereum || address === undefined) {
      alertMsg("error", "MetaMask is not installed.");
      return;
    }
    try {
      setLoadingFaucet(true);
      const response = await fetch(Const.FAUCET_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          address: address,
        }),
      });
      const data = await response.json();
      if (
        data.message != undefined &&
        data.message === "Transaction sent successfully"
      ) {
        alertMsg("success", "Request faucet success!");
      }
      setLoadingFaucet(false);
      setDisableFaucet(true);
      localStorage.setItem('faucet', new Date().getTime());

    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div>
      <div className="header">
        <img src={"/src/assets/logo.png"}></img>
        <span className="button_connect">
          <Button
            sx={{ marginRight: "20px", display: isShowAddNetWork }}
            variant="contained"
            onClick={() => addCustomNetwork()}
            disabled={loading}
          >
            Add Network
          </Button>
          {loadingFaucet ? (
            <LoadingButton sx={{ marginRight: "20px" }} loading variant="outlined">
              Faucet
            </LoadingButton>
          ) : (
            <Button
              sx={{ marginRight: "20px" }}
              variant="outlined"
              disabled={disableFaucet}
              onClick={() => requestFaucet()}
            >
              Faucet
            </Button>
          )}
          <ConnectButton />
        </span>
      </div>
      <div className="header_1">
        <img src={"/src/assets/collection.png"}></img>
      </div>
      <div className="sale_box">
        <img src="https://gateway.pinata.cloud/ipfs/QmXbU4rDEJTbsBDxE6Hi9X3ycf8LFayVDZQCwuhf699xbq"></img>
        <div className="sale_box_action">
          <div>
            <h5 className="sale_box_description">{description}</h5>
            <h2>10,000 NFT</h2>
            <h4>Limit 5 NFT each time mint</h4>
            <h4>0.15 ETH / NFT</h4>
          </div>
          <TextField
            disabled={loading}
            onChange={inputNumber}
            id="outlined-number"
            type="number"
            value={amount}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <div>
            {loading ? (
              <Loader />
            ) : (
              <Button
                variant="contained"
                onClick={() => mint()}
                disabled={loading}
              >
                Mint
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="collection">
        <h2>Your NFTs</h2>
        {loadingCollection ? (
          <Loader />
        ) : (
          <Grid sx={{ flexGrow: 1 }} container spacing={2}>
            <Grid item xs={12}>
              <Grid container justifyContent="center" spacing={2}>
                {Array.from(Array(count).keys()).map((value) => (
                  <Grid key={value} item>
                    <Paper
                      sx={{
                        height: 350,
                        width: 250,
                        backgroundColor: (theme) =>
                          theme.palette.mode === "dark" ? "#1A2027" : "#fff",
                      }}
                    >
                      <img src={baseUri} width="250" height="350"></img>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        )}
      </div>

      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={alert.open}
        onClose={handleCloseAlert}
        key={vertical + horizontal}
        autoHideDuration={alert.time}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alert.alertType}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default App;
