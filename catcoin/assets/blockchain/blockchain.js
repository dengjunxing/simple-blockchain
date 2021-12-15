const sha = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
//交易类
class Transaction{
    constructor(fromAddress,toAddress,amount){
        this.fromAddress = fromAddress;
        this.timestamp = Date.now();
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        return sha(this.fromAddress + this.toAddress + this.amount).toString();
    }

    signHash(key){
        if(key.getPublic('hex') !==  this.fromAddress){
            throw new Error('Signing transactions in other wallets is invalid...');
        }

        const transactionHash = this.calculateHash();
        const sign = key.sign(transactionHash,'base64');
        this.signature = sign.toDER('hex');
    }
    check(){
        if(this.fromAddress === null) return true;
        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature!');
        }
        const publicKey = ec.keyFromPublic(this.fromAddress,'hex');
        return publicKey.verify(this.calculateHash(),this.signature);
    }
}
//区块类
class Block{
    constructor(transaction,timestamp,previousHash = ''){
        this.transaction = transaction;
        this.timestamp = timestamp;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nounce = 0;
    }

//使用sha256哈希算法计算当前区块哈希值并返回
    calculateHash(){
        return sha(this.transaction + JSON.stringify(this.data) + this.previousHash + this.timestamp + this.nounce).toString();
        
    }
//挖矿难度POW(power-of-work)
    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')){
            this.nounce++;
            this.hash = this.calculateHash();
        }
        console.log('Block mined:' + this.hash);
    }
    checkTransaction(){
        for(const tran of this.transaction){
            if(!tran.check()){
                return false;
            }
        }
        return true;
    }
}

//区块链
class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 1;
        this.transactionInProgress = [];
        this.reward = 100;
    }
//创世区块
    createGenesisBlock(){
        return new Block('',Date.now(),'0');
    }
//返回当前区块链中最后一个区块
    returnNewBlock(){
        return this.chain[this.chain.length - 1];
    }
//矿工负责挖矿并将区块加入区块链，同时获得报酬
    miningTransaction(minerAddress){
        const rewardTransaction = new Transaction(null,minerAddress,this.reward);
        this.transactionInProgress.push(rewardTransaction);
        const block = new Block(this.transactionInProgress, Date.now(), this.returnNewBlock().hash);
        block.mineBlock(this.difficulty);
        // console.log('Block successfully mined!');
        this.chain.push(block);
        this.transactionInProgress = [];
    }
    //新增交易并把交易加入正在进行的交易数组
    addTransaction(transaction){
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Address must be included!');
        }
        if(!transaction.check()){
            throw new Error('Transaction is not valid.');
        }
        if(transaction.amount <= 0){
            throw new Error('Amount should be higher than 0.');
        }
        if(!transaction.amount){
            throw new Error('Amount must be included.');
        }
        if(this.checkAddressBalance(transaction.fromAddress) < transaction.amount){
            throw new Error('Balance not enough!');
        }
        this.transactionInProgress.push(transaction);
    }
    //交易后的货币转移，检查余额
    checkAddressBalance(address){
        let balance = 0;
        for(const block of this.chain){
            for(const tran of block.transaction){
                if(tran.fromAddress === address){
                    balance = balance - tran.amount;
                }

                if(tran.toAddress === address){
                    balance = balance + tran.amount;
                }
            }
        }
        return balance;
    }
//检查交易是否合法
    checkChainValid(){
        const genesis = JSON.stringify(this.createGenesisBlock());
        if(genesis !== JSON.stringify(this.chain[0])){
            return false;
        }
        for(let i = 1;i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];
            if(!currentBlock.checkTransaction()){
                return false;
            }
//判断当前区块的哈希值是否等于原数据加密后的哈希值，以及是否指向父区块
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }
        }

        return true;
    }
    allTransForWallet(address){
        const trans = [];
        for(const block of this.chain){
            for(const tran of block.transaction){
                if(tran.fromAddress === address || tran.toAddress === address){
                    trans.push(tran);
                }
            }
        }
        return trans;
    }
}
module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
module.exports.Block = Block;