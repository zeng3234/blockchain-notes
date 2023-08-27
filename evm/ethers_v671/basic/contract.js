const { ethers, Contract } = require('ethers');
const { VoidSigner } = require('ethers');
const { formatEther, parseEther, formatUnits, parseUnits } = require('ethers');
const constants = require('../constants/config');
const abi_erc20 = require('../abis/IERC20.json');


let customHttpProvider = new ethers.JsonRpcProvider(constants.rpc);

//https://docs.ethers.org/v6/getting-started/#starting-contracts
async function test() {

    let contract = new Contract(constants.address_token18, abi_erc20, customHttpProvider)
    console.log(await contract.balanceOf(constants.address_token18));
    console.log(await contract.symbol());
    console.log(await contract.decimals());
    let totalSupply = await contract.totalSupply();
    console.log(totalSupply);
    console.log(formatEther(totalSupply))
    console.log(formatUnits(totalSupply, 'ether'))

    //static call , err: ERC20: transfer from the zero address
    let tx = await contract.transfer.staticCall(constants.address_token18, '1').catch(function (err) { console.log(err) })
    console.log(tx)

    // We can also simulate the transaction as another account
    //true
    let other = new VoidSigner("0x333fE79D8dA5818634bA0ffEfDcdC2317C7c5933")
    let contractAsOther = contract.connect(other.connect(customHttpProvider))
    tx = await contractAsOther.transfer.staticCall(constants.address_token18, '1')
    console.log(tx)
    //

    //send tx
    let wallet = new ethers.Wallet(constants.walletPrikey);
    let contractSigner = contract.connect(wallet.connect(customHttpProvider))
    tx = await contractSigner.transfer(constants.walletAddress, '1')
    console.log(tx);

    // ...wait for the transaction to be included.
    await tx.wait()
    console.log('end')

}
test();