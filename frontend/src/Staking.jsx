import React, { useState, useEffect } from "react";
import "./App.css";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { ethers } from "ethers";
import * as Const from "./utils/Const.jsx";
import NFT from "../abi/CelestiaNFT.json";
import StakingABI from "../abi/Staking.json";

import Grid from "@mui/material/Grid";
import {formatDecimal} from "./utils/utils.jsx";
import Loader from "./loader";
import LoadingButton from "@mui/lab/LoadingButton";
import UnStakeDialog from "./UnstakeDialog.jsx";

const Staking = ({ address, alertMsg, refreshData, setRefreshData }) => {
  const [loadingData, setLoadingData] = useState(false);
  const [isClaimingReward, setIsClaimingReward] = useState(false);

  const [tokenIds, setTokenIds] = useState([]);
  const [tokenId, setTokenId] = React.useState();
  const [baseUri, setBaseUri] = useState();
  const [mapPendingReward, setMapPendingReward] = useState([]);
  const [totalPendingReward, setTotalPendingReward] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchAllStakedNft(true);
    setRefreshData(false);

    const intervalId = setInterval(() => {
      fetchAllStakedNft(false);
    }, 60 * 1000);

    // cleanup function to clear the interval when component unmounts
    return () => clearInterval(intervalId);
  }, [refreshData]);

  const fetchAllStakedNft = async (isShowLoading) => {
    if (!window.ethereum) {
      alertMsg("error", "MetaMask is not installed.");
      return;
    }
    if (isShowLoading){
      setLoadingData(true);
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const stakingContract = new ethers.Contract(
        Const.STAKING_CONTRACT,
        StakingABI.abi,
        provider
      );

      let tokenIds = await stakingContract.getStakingNFTs(address);
      const tokenIdsArray = tokenIds.map((id) => id.toNumber());
      setTokenIds(tokenIdsArray);

      const nftContract = new ethers.Contract(
        Const.NFT_CONTRACT,
        NFT.abi,
        provider
      );
      let metadata = await nftContract.baseURI();
      let metaObj = await (await fetch(metadata)).json();
      setBaseUri(metaObj.image);
    } catch (e) {
      console.log(e);
    }

    await getPendingReward();

    setLoadingData(false);
  };

  const getPendingReward = async () => {
    if (!window.ethereum) {
      alertMsg("error", "MetaMask is not installed.");
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const stakingContract = new ethers.Contract(
        Const.STAKING_CONTRACT,
        StakingABI.abi,
        provider
      );
      let pendingRewards = await stakingContract.getPendingRewards(address);
      let totalPendingReward = 0;
      const newMap = [];
      pendingRewards.forEach((innerArray) => {
        const key = innerArray[0];
        const value = innerArray[1] / 1e18;

        if (key !== undefined){
          const item = { key: key.toNumber(), value: value };
          newMap.push(item);
          totalPendingReward += value;
        }
      });

      setTotalPendingReward(totalPendingReward);
      setMapPendingReward(newMap);
    } catch (e) {
      console.log(e);
    }
  };

  const claimReward = async () => {
    if (!window.ethereum) {
      alertMsg("error", "MetaMask is not installed.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const stakingContract = new ethers.Contract(
        Const.STAKING_CONTRACT,
        StakingABI.abi,
        signer
      );
      const transaction = await stakingContract.claimPendingReward();
      setIsClaimingReward(true);

      await transaction.wait();
      setIsClaimingReward(false);

      setRefreshData(true);
      alertMsg("success", "Claimed reward success !");
    } catch (e) {
      console.log(e);
      alertMsg("error", "Unable to claim reward error : " + JSON.stringify(e.message));
    }
  };

  const unStake = async (tokenId) => {
    setTokenId(tokenId);
    setOpen(true);
  };

  return (
    <>
      <div className="staking_header">
        <img src="/staking.png" />
      </div>
      <div className="staking_content">
        <div className="staking_item">
          <h4>Total staked</h4>
          <span>{loadingData ? "loading..." : tokenIds?.length} NFT</span>
        </div>
        <div className="staking_item">
          <h4>Pending reward</h4>
          <span>
            {loadingData ? "loading..." : formatDecimal(totalPendingReward)}{" "}
            CEL
          </span>
        </div>
        <div className="staking_item">
          <h4>Claim reward</h4>
          {isClaimingReward ? (
            <LoadingButton
              loading
              variant="outlined"
              sx={{ borderRadius: "20px" }}
            >
              Claim
            </LoadingButton>
          ) : (
            <Button
              variant="outlined"
              sx={{ borderRadius: "20px" }}
              disabled={totalPendingReward === 0}
              onClick={() => claimReward()}
            >
              Claim
            </Button>
          )}
        </div>
      </div>
      <div className="staking_collection">
        {loadingData ? (
          <Loader />
        ) : tokenIds?.length > 0 ? (
          <Grid sx={{ flexGrow: 1 }} container spacing={2}>
            <Grid item xs={12}>
              <Grid container justifyContent="center" spacing={2}>
                {mapPendingReward?.map((item) => (
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
                      image={baseUri}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        Celestia NFT #{item.key}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Earned : {formatDecimal(item.value)} CEL
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: "center" }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => unStake(item.key)}
                      >
                        UnStake
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <h4>You have not staked NFT yet</h4>
        )}
      </div>
      <UnStakeDialog
        tokenId={tokenId}
        open={open}
        setOpen={setOpen}
        alertMsg={alertMsg}
        setRefreshData={setRefreshData}
      />
    </>
  );
};

export default Staking;
