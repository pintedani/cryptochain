const redis = require('redis')

const CHANNELS = {
    TEST: 'TEST'
}

class PubSub{
    constructor(){
        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        this.subscriber.subscribe(CHANNELS.TEST)

        this.subscriber.on(
            'message', 
            (channnel, message)=>{this.handleMessage(channnel, message)})
    }

    handleMessage(channel, message){
        console.log(`Message received. Channel: ${channel}. Message: ${message}`)
    }
}

const testPubSub = new PubSub()

setTimeout(() => testPubSub.publisher.publish(CHANNELS.TEST, 'foo'), 1000);