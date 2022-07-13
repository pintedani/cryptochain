//Version with from pubnub.com
//full implementation on https://github.com/15Dkatz/cryptochain/blob/master/app/pubsub.pubnub.js

const PubNub = require('pubnub')

const credentials = {
    publishKey: 'pub-c-f0360bcf-c013-40ef-952a-afb4a8137f8e',
    subscribeKey: 'sub-c-6c9a081c-6866-11eb-8d36-e20adcb01f05',
    secretKey: 'sec-c-Y2IxMTQ0YjYtYWZhZi00YjNjLWFkYTAtNWVkYzAwZTZjMGMy'
}

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
}

class PubSub{
    constructor({blockchain, transactionPool, wallet}){
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;

        this.pubnub = new PubNub(credentials)
        this.pubnub.subscribe({channels: Object.values(CHANNELS)})
        this.pubnub.addListener(this.listener())
    }

    listener(){
        return{
            message: messageObject => {
                const {channel, message} = messageObject;

                console.log(`Message received. Channel: ${channel}. Message: ${message}`)

                const parsedMessage = JSON.parse(message)

                switch(channel){
                    case CHANNELS.BLOCKCHAIN:
                        this.blockchain.replaceChain(parsedMessage, true, ()=>{
                            this.transactionPool.clearBlockChainTransactions({
                                chain: parsedMessage
                            })
                        })
                        break

                    case CHANNELS.TRANSACTION:
                        if(!this.transactionPool.existingTransaction({
                            inputAddress: this.wallet.publicKey
                        })){
                            this.transactionPool.setTransaction(parsedMessage)
                        }
                        break

                    default:
                        return
                }
            }
        }
    }

    publish({channel, message}){
        // this.subscribe.unsubscribe(channel, ()=>{
        //     this.pubnub.publish({channel, message}, ()=>{
        //         this.subscribe.subscribe(channel);
        //     });
        // })

        // there is an unsubscribe function in pubnub
        // but it doesn't have a callback that fires after success
        // therefore, redundant publishes to the same local subscriber will be accepted as noisy no-ops
        this.pubnub.publish({ message, channel });
    }

    broadcatChain(){
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        })
    }

    broadcastTransaction(transaction){
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        })
    }
}

//const testPubSub = new PubSub()
//testPubSub.publish({channel: CHANNELS.TEST, message: 'hello pubnub'}) // varianta 1
//setTimeout(() => testPubSub.publish({channel: CHANNELS.TEST, message: 'hello pubnub'}), 1000); //varianta 2

module.exports = PubSub;