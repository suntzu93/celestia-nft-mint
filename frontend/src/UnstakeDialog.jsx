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

export default function UnStakeDialog({
  tokenId,
  open,
  setOpen,
  alertMsg,
  setRefreshData,
}) {
  const [isUnStake, setIsUnStake] = React.useState(false);

  const handleUnStake = async () => {
    setIsUnStake(true);
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
      const transaction = await stakingContract.unStake(tokenId);
      await transaction.wait();

      setRefreshData(true);
      alertMsg("success", `Unstake NFT ID ${tokenId} success !`);
    } catch (e) {
      setIsUnStake(false);
      console.log(e);
      alertMsg("error", "Unable to unstake error : " + JSON.stringify(e.message));
    }
    setIsUnStake(false);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog fullWidth="sm" maxWidth="sm" open={open} onClose={handleCancel}>
        <DialogTitle>UnStake NFT</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure want to unstake NFT #{tokenId} ? You will no longer
            receive reward from this NFT after unstake.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          {isUnStake ? (
            <LoadingButton
              loading
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="outlined"
              onClick={() => handleUnStake()}
            >
              Unstake
            </LoadingButton>
          ) : (
            <Button onClick={() => handleUnStake()}>Send</Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
