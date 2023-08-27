const { ethers, Contract } = require('ethers');
const { VoidSigner, Typed } = require('ethers');
const { formatEther, parseEther, formatUnits, parseUnits } = require('ethers');
const constants = require('../../constants/config');
const abi_permit2 = require('../../abis/IPermit2_remove_array.json');
const abi_reactor = require('../../abis/IBaseReactor.json');



let wallet = new ethers.Wallet(constants.walletPrikey);
let customHttpProvider = new ethers.JsonRpcProvider(constants.rpc);
//
let permit2Contract = new Contract(constants.address_permit2, abi_permit2);
let permit2Signer = permit2Contract.connect(wallet.connect(customHttpProvider))
//
let orderReactorContract = new Contract(constants.address_exclusive_dutch_order_reactor, abi_reactor);
let orderReactorSigner = orderReactorContract.connect(wallet.connect(customHttpProvider))


async function sendDutch() {
    /*
        当前发送交易者，需要授权out_token给reactor
        
        @uniswap/uniswapx-sdk 中的ethers版本是5.7, 
        需到ethers_v570中执行签名，拿到这里使用(注意替换nonce)

    */
    let tx = await orderReactorSigner.execute({
        order: Typed.bytes('0x'),
        sig: Typed.bytes('0x'),
    });
    console.log(tx);
}
async function test() {
    await sendDutch();
    process.exit(0);
}
test();