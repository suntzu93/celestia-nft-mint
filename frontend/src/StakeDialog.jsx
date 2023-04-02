import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { ethers } from "ethers";
import * as Const from "./utils/Const.jsx";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import StakingABI from "../abi/Staking.json";
import NFT from "../abi/CelestiaNFT.json";

export default function StakeDialog({
  tokenId,
  openStake,
  setOpenStake,
  alertMsg,
  setFetchNewData,
}) {
  const [isStake, setIsStake] = React.useState(false);

  const handleUnStake = async () => {
    setIsStake(true);
    if (!window.ethereum) {
      alertMsg("error", "MetaMask is not installed.");
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      //Check is approved
      const nftContract = new ethers.Contract(
        Const.NFT_CONTRACT,
        NFT.abi,
        provider
      );
      const approvedAddress = await nftContract.getApproved(tokenId);
      if (
        approvedAddress.toLowerCase() !== Const.STAKING_CONTRACT.toLowerCase()
      ) {
        //request approve before stake
        const approveTx = await nftContract
          .connect(signer)
          .approve(Const.STAKING_CONTRACT, tokenId);
        await approveTx.wait();
      }

      const stakingContract = new ethers.Contract(
        Const.STAKING_CONTRACT,
        StakingABI.abi,
        signer
      );
      const transaction = await stakingContract.stake(tokenId);
      await transaction.wait();

      setFetchNewData(true);
      alertMsg("success", `Stake NFT ID ${tokenId} success !`);
    } catch (e) {
      setIsStake(false);
      console.log(e);
      alertMsg("error", "Unable to stake error : " + e);
    }
    setIsStake(false);
    setOpenStake(false);
  };

  const handleCancel = () => {
    setOpenStake(false);
  };

  return (
    <div>
      <Dialog
        fullWidth="sm"
        maxWidth="sm"
        open={openStake}
        onClose={handleCancel}
      >
        <DialogTitle>UnStake NFT</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have to approve NFT #{tokenId} before stake !
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          {isStake ? (
            <LoadingButton
              loading
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="outlined"
              onClick={() => handleUnStake()}
            >
              Stake
            </LoadingButton>
          ) : (
            <Button onClick={() => handleUnStake()}>Send</Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
