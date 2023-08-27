const { formatEther, parseEther, formatUnits, parseUnits } = require('ethers');

let ethWei = '1000000000000000000';

console.log('wei->ether')
console.log(formatEther(ethWei))
console.log(formatUnits(ethWei, 'ether'))
console.log(formatUnits(ethWei, 18))
//
console.log('ether->wei')
console.log(parseEther('1'))
console.log(parseUnits('1', 'ether'))
console.log(parseUnits('1', 18))

console.log('decimal');
//
console.log(parseEther('0.0011'))
console.log(parseUnits('0.0011', 'ether'))
console.log(parseUnits('0.0011', 18))
//
console.log(parseUnits('0.0011', 6))
console.log(parseUnits('0.000011', 6))
// console.log(parseUnits('0.0000011', 6))//error
