const { ethers } = require('ethers');
const constants = require('../constants/config');

let customHttpProvider = new ethers.JsonRpcProvider(constants.rpc);

// https://docs.ethers.org/v6/getting-started/#starting-connecting
async function test() {
    let balance = await customHttpProvider.getBalance('0x5Ff40197C83C3A2705ba912333Cf1a37BA249eB7');
    console.log(balance)
    process.exit(0);
}
test();