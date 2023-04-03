import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import NFT from "../abi/CelestiaNFT.json";
import { useAccount } from "wagmi";
import "./App.css";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Loader from "./loader";
import Grid from "@mui/material/Grid";
import * as Const from "./utils/Const";
import SendNftDialog from "./SendNftDialog.jsx";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import Card from "@mui/material/Card";
import StakeDialog from "./StakeDialog.jsx";

const Mint = ({ alertMsg, refreshData, setRefreshData }) => {
  const [fetchNewData, setFetchNewData] = useState(true);
  const { address } = useAccount();
  const [tokenIds, setTokenIds] = useState([]);
  const [tokenId, setTokenId] = React.useState();
  const [baseUri, setBaseUri] = useState();
  const [description, setDescription] = useState();
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const [open, setOpen] = useState(false);
  const [openStake, setOpenStake] = useState(false);

  useEffect(() => {
    if (fetchNewData) {
      fetchCount();
      setFetchNewData(false);
    }
  }, [fetchNewData]);

  /* when the component loads, useEffect will call this function */
  async function fetchCount() {
    if (!window.ethereum || address === undefined) {
      alertMsg("error", "MetaMask is not installed.");
      return;
    }

    setLoadingCollection(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(Const.NFT_CONTRACT, NFT.abi, provider);
      let tokenIds = await contract.getTokenIds(address);
      const tokenIdsArray = tokenIds.map((id) => id.toNumber());
      setTokenIds(tokenIdsArray);
      let metadata = await contract.baseURI();
      let metaObj = await (await fetch(metadata)).json();

      setBaseUri(metaObj.image);
      setDescription(metaObj.description);
    } catch (e) {
      console.log(e);
    }
    setLoadingCollection(false);
  }

  async function mint() {
    if (!window.ethereum || address === undefined) {
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

      const contract = new ethers.Contract(Const.NFT_CONTRACT, NFT.abi, signer);
      const transaction = await contract.mintNft(amount, {
        value: ethers.utils.parseEther(totalAmount.toString()),
      });
      setLoading(true);

      await transaction.wait();
      setLoading(false);
      setFetchNewData(true);
      setRefreshData(true);
      alertMsg("success", "Minted NFT success !");
    } catch (e) {
      console.log(e.message);
      if (JSON.stringify(e).indexOf("rejected") !== -1){
        alertMsg("error", "Cancel mint NFT !");
      }else {
        alertMsg("error", "Error to mint NFT error : " + JSON.stringify(e.message));
      }

    }
  }

  const inputNumber = (event) => {
    setAmount(event.target.value);
  };

  const clickToSendNFT = async (id) => {
    setOpen(true);
    setTokenId(id);
  };

  const stakeNft = async (id) => {
    setTokenId(id);
    setOpenStake(true);
  };

  return (
    <>
      <div className="header_1">
        <img src={"/collection.png"}></img>
      </div>
      <div className="mint">
        <div className="sale_box">
          <img src="https://gateway.pinata.cloud/ipfs/QmXbU4rDEJTbsBDxE6Hi9X3ycf8LFayVDZQCwuhf699xbq"></img>
          <div className="sale_box_action">
            <div>
              <h5 className="sale_box_description">{description}</h5>
              <h2>10,000 NFT</h2>
              <h4>Limit 4 NFT each time mint</h4>
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
      </div>
      <div className="collection">
        <h2>Your NFTs</h2>
        {loadingCollection ? (
          <Loader />
        ) : (
          <>
            {tokenIds.length > 0 ? (
              <Grid sx={{ flexGrow: 1 }} container spacing={2}>
                <Grid item xs={12}>
                  <Grid container justifyContent="center" spacing={2}>
                    {tokenIds.map((id) => (
                      <Card
                        sx={{
                          maxWidth: 250,
                          marginLeft: "20px",
                          marginTop: "20px",
                        }}
                      >
                        <CardMedia
                          component="img"
                          alt="green iguana"
                          height="350"
                          image="https://gateway.pinata.cloud/ipfs/QmXbU4rDEJTbsBDxE6Hi9X3ycf8LFayVDZQCwuhf699xbq"
                        />
                        <CardActions sx={{ justifyContent: "center" }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => clickToSendNFT(id)}
                          >
                            Send
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => stakeNft(id)}
                          >
                            Stake
                          </Button>
                        </CardActions>
                      </Card>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            ) : (
              <h5>You do not have a NFT</h5>
            )}
          </>
        )}
      </div>
      <SendNftDialog
        tokenId={tokenId}
        open={open}
        setOpen={setOpen}
        alertMsg={alertMsg}
        setFetchNewData={setFetchNewData}
      />
      <StakeDialog
        tokenId={tokenId}
        openStake={openStake}
        setOpenStake={setOpenStake}
        alertMsg={alertMsg}
        setFetchNewData={setFetchNewData}
      />
    </>
  );
};

export default Mint;
