const {
    exec
} = require("child_process");
const express = require("express");
var cors = require('cors');
var bodyParser = require('body-parser');

const app = express();
const port = 11111;
const corsOptions = {
    origin: '*',
    methods: [],
    allowedHeaders: [],
    exposedHeaders: [],
    credentials: true
};
app.use(
    bodyParser.urlencoded({
        extended: true
    }));

let globalNonce = null;

app.post("/faucet",cors(corsOptions), (req, res) => {
    const address = req.body.address;

    // check if address is valid
    if (!address) {
        res.status(400).send({
            error: "Invalid address"
        });
        return;
    }
    console.log("request address : " + address)

    try {
        if (globalNonce === null) {
            // get the nonce for the faucet address
            exec(`cast nonce 0xde00c69613d05C7d6cc4A24365063BC72E230d30`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    res.status(500).send({
                        error: "Error getting nonce"
                    });
                    return;
                }
                const nonce = Number(stdout.trim());
                globalNonce = nonce;
                console.log("nonce: " + globalNonce);
                // send 10 ether to the requested address
                const private_key = "483DB04C3612DFDF65FA4851C464A02D9304631D6D694C60592094C0FA904FC3";
                const rpc_url = "https://ethermintd-blockspacerace.suntzu.pro";
                const value = "10ether";
                const cmd = `cast send ${address} --value ${value} --rpc-url ${rpc_url} --private-key ${private_key} --nonce ${globalNonce}`;

                globalNonce++;
                exec(cmd, (error, stdout, stderr) => {
                    if (error) {
                        globalNonce === null;
                        console.error(`exec error: ${error}`);
                        res.status(500).send({
                            error: "Error sending transaction"
                        });
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                    console.error(`stderr: ${stderr}`);
                    res.send({
                        message: "Transaction sent successfully"
                    });
                });
            });
        } else {
            console.log("nonce: " + globalNonce);
            // send 10 ether to the requested address
            const private_key = "483DB04C3612DFDF65FA4851C464A02D9304631D6D694C60592094C0FA904FC3";
            const rpc_url = "https://ethermintd-blockspacerace.suntzu.pro";
            const value = "10ether";
            const cmd = `cast send ${address} --value ${value} --rpc-url ${rpc_url} --private-key ${private_key} --nonce ${globalNonce}`;

            globalNonce++;
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    res.status(500).send({
                        error: "Error sending transaction"
                    });
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                res.send({
                    message: "Transaction sent successfully"
                });
            });
        }
    } catch (error) {
        globalNonce === null;
        console.error(`exec error: ${error}`);
        const message = error.stderr || error.message || "Error sending transaction";
        res.status(500).send({
            error: message
        });
    }
});

app.listen(port, () => {
    console.log(`Faucet server listening at http://localhost:${port}`);
});