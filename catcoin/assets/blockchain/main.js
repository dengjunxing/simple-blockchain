const {Blockchain,Transaction} = require('./blockchain');
const sha = require('crypto-js/sha256');
const EC = require('elliptic').ec;
//测试代码
{
let catCoin = new Blockchain();

// console.log('mining block 1...')
// catCoin.addNewBlock(new Block(1,{ total: 5,name: 'Jack',},'02/12/2021'))
// console.log('mining block 2...')
// catCoin.addNewBlock(new Block(2,{ total: 5,name: 'Tom',},'03/12/2021'))

// console.log(JSON.stringify(catCoin, null, 3));
// catCoin.chain[1].data = {
//     name: 'Nick',
// }
// console.log('Is the chain valid? ' + catCoin.isChainValid())
// catCoin.createTransaction(new Transaction('address1','address2',100));
// catCoin.createTransaction(new Transaction('address1','address2',50));

// console.log('\n Start mining...');
// catCoin.miningTransaction('miner_address');
// console.log(catCoin.chain[1].transaction)

// console.log('\n Start mining again...');
// catCoin.miningTransaction('miner_address');
// console.log('\nBalance of miner is',catCoin.checkAddressBalance('miner_address'));
}