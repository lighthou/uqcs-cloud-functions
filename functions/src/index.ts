import * as functions from 'firebase-functions';
import * as Twit from 'twit'

//import * as admin from 'firebase-admin'
//admin.initializeApp();


export const helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});

export const slackMessage = functions.https.onRequest((request, response) => {

    if (request.method !== 'POST') {
        response.send("HTTP Error 405 - Method Not Allowed")
    }

    if (request.get('content-type') !== 'application/x-www-form-urlencoded') {
        response.send("Request body must be 'application/x-www-form-urlencoded'")
    }

    const { WebClient } = require('@slack/web-api');
    const token = process.env.SLACK_TOKEN;
    const web = new WebClient(token);

    // tslint:disable-next-line: no-floating-promises
    (async () => {
        if ('img' in request.body) {
            const decodedData = Buffer.from(request.body['img'], 'base64')
            require('fs').writeFileSync('/tmp/image.png', decodedData)

            await web.files.upload({channels: request.body['channels'], initial_comment: request.body['text'], file: require('fs').createReadStream('/tmp/image.png') })
        } else {
            await web.chat.postMessage({ channel: request.body['channels'], text: request.body['text']});
        }
    })();
      
    response.send("OK")
});

export const tweet = functions.https.onRequest((request, response) => {

    if (request.method !== 'POST') {
        response.send("HTTP Error 405 - Method Not Allowed")
    }

    const client = new Twit({
        consumer_key:         process.env.TWITTER_CONSUMER_KEY!,
        consumer_secret:      process.env.TWITTER_CONSUMER_SECRET!,
        access_token:         process.env.TWITTER_ACCESS_TOKEN!,
        access_token_secret:  process.env.TWITTER_ACCESS_TOKEN_SECRET!, 
    })

    client.post('statuses/update', { status: request.body['text'] }, function(err, data, res) {
        console.log(data)
    })

    response.send("OK")
});
