const { ethers, Contract } = require('ethers');
const constants = require('../constants/config');
const abi_erc20 = require('../abis/IERC20.json');

let customHttpProvider = new ethers.JsonRpcProvider(constants.rpc);

// https://docs.ethers.org/v6/getting-started/#starting-contracts
async function test() {

    let contract = new Contract(constants.address_token18, abi_erc20, customHttpProvider)
    console.log(await contract.balanceOf(constants.address_token18));
    // console.log(await contract.symbol());
    
}
test();