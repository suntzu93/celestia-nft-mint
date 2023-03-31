## You can mint NFT on ethemintd test network in conjunction with celestia light node.

To deploy contract use ethemintd network and foundry

### Install foundry

```
1. curl -L https://foundry.paradigm.xyz | bash
2. Then, run foundryup in a new terminal session or after reloading your PATH.
```

### Use forge to deploy contract

```
PRIVATE_KEY=$(ethermintd keys unsafe-export-eth-key mykey --keyring-backend test)

forge create CelestiaNFT --constructor-args "Celestia NFT" \
"CEL" "https://gateway.pinata.cloud/ipfs/QmQjgM6nBBFJgLZFUctoLcrTjdnqzMoyHD1TkDYppwJJRJ" \
--contracts script/CelestiaNFT.sol --private-key $PRIVATE_KEY \
--rpc-url http://localhost:8545

```