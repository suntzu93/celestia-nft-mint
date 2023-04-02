import React, { useState, useEffect } from "react";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useBalance } from "wagmi";
import "./App.css";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { Snackbar } from "@mui/material";
import * as Const from "./utils/Const";
import LoadingButton from "@mui/lab/LoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Staking from "./Staking";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import Mint from "./Mint.jsx";
import { browserHistory } from "react-router";

const App = () => {
  const { address } = useAccount();
  const { data } = useBalance({ address: address });
  const [loadingFaucet, setLoadingFaucet] = useState(false);
  const [isShowAddNetWork, setIsShowAddNetWork] = useState("");
  const [disableFaucet, setDisableFaucet] = useState(false);
  const [refreshData, setRefreshData] = useState(true);

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

  useEffect(() => {
    if (window.location.pathname.startsWith("/mint")) {
      setTab("mint");
    } else if (window.location.pathname.startsWith("/staking")) {
      setTab("staking");
    }

    if (window.ethereum === undefined || parseInt(window.ethereum?.networkVersion) === Const.CHAIN_ID) {
      setIsShowAddNetWork("none");
    }

    const faucetTime = localStorage.getItem("faucet");
    if (faucetTime) {
      const currentTime = new Date().getTime();
      if (currentTime < parseInt(faucetTime) + 5 * 60 * 1000) {
        setDisableFaucet(true);
      }
    }
  }, []);

  const addCustomNetwork = async () => {
    if (!window.ethereum || address === undefined) {
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
        setDisableFaucet(true);
        localStorage.setItem("faucet", new Date().getTime());
      }
      setLoadingFaucet(false);
    } catch (e) {
      console.log(e);
    }
  };

  const [tab, setTab] = React.useState("mint");

  function tabs() {
    const changeTab = (event, newValue) => {
      setTab(newValue);

      switch (newValue) {
        case "mint":
          return browserHistory.push("/mint");
        case "staking":
          return browserHistory.push("/staking");
      }
    };

    return (
      <Box sx={{ typography: "body" }}>
        <TabContext value={tab}>
          <Box
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              textAlign: "left",
              paddingLeft: "20px",
              paddingTop: "20px",
              display: "flex",
            }}
          >
            <img
              src={"/logo.png"}
              style={{ cursor: "pointer" }}
            ></img>

            <span className="button_connect">
              <Button
                sx={{ marginRight: "20px", display: isShowAddNetWork }}
                variant="contained"
                onClick={() => addCustomNetwork()}
              >
                Add Network
              </Button>
              {data?.value < 1 * 10 ** 18 ? (
                loadingFaucet ? (
                  <LoadingButton
                    sx={{ marginRight: "20px" }}
                    loading
                    loadingPosition="start"
                    startIcon={<SaveIcon />}
                    variant="outlined"
                  >
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
                )
              ) : null}

              <ConnectButton />
            </span>
            <TabList
              onChange={changeTab}
              aria-label=""
              sx={{
                display: "flex",
                paddingLeft: "20px",
                alignItems: "center",
              }}
            >
              <Tab label="Mint" value="mint" />
              <Tab label="Staking" value="staking" />
            </TabList>
          </Box>
          <TabPanel value="mint">{mintUI()}</TabPanel>
          <TabPanel value="staking">{stakingUI()}</TabPanel>
        </TabContext>
      </Box>
    );
  }

  const mintUI = () => {
    return (
      <Mint
        alertMsg={alertMsg}
        refreshData={refreshData}
        setRefreshData={setRefreshData}
      />
    );
  };

  const stakingUI = () => {
    return (
      <Staking
        address={address}
        alertMsg={alertMsg}
        refreshData={refreshData}
        setRefreshData={setRefreshData}
      />
    );
  };

  return (
    <div>
      <div>{tabs()}</div>
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
