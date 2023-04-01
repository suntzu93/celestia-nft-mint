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
import NFT from "../abi/CelestiaNFT.json";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";

export default function SendNftDialog({
  tokenId,
  open,
  setOpen,
  alertMsg,
  setFetchNewData,
}) {
  const [recipientWallet, setRecipientWallet] = React.useState();
  const [isSendLoading, setIsSendLoading] = React.useState(false);

  const changeWalllet = (e) => {
    setRecipientWallet(e.target.value);
  };

  const handleSendNFT = async () => {
    try {
      const re = new RegExp("^0x[a-fA-F0-9]{40}$");
      if (!re.test(recipientWallet)) {
        alertMsg("error", "Address is invalid !");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(Const.CONTRACT, NFT.abi, signer);
      const transaction = await contract.transferTokens(
        recipientWallet,
        tokenId
      );
      setIsSendLoading(true);
      await transaction.wait();
      setIsSendLoading(false);
      //Reload nft collection
      setFetchNewData(true);
      setOpen(false);

      alertMsg("success", "Send NFT success");
    } catch (e) {
      console.log(e);
      setIsSendLoading(false);
      alertMsg("error", "Send NFT error");
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog fullWidth="sm" maxWidth="sm" open={open} onClose={handleCancel}>
        <DialogTitle>Send NFT</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter NFT recipient wallet make sure it is correct or you will lose
            your NFT.
          </DialogContentText>
          <TextField
            value={recipientWallet}
            autoFocus
            margin="dense"
            id="name"
            label="Recipient address"
            fullWidth
            variant="standard"
            onChange={changeWalllet}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          {isSendLoading ? (
            <LoadingButton
              loading
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="outlined"
              onClick={handleSendNFT}
            >
              Send
            </LoadingButton>
          ) : (
            <Button onClick={handleSendNFT}>Send</Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
}
