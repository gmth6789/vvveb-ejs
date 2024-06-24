const express = require('express');
const bodyParser = require('body-parser');
const { Client, middleware } = require('@line/bot-sdk');
const { fromEvent } = require('rxjs');
const { map, switchMap, filter } = require('rxjs/operators');

const app = express();
const port = 3000;

// LINE Bot configuration
const config = {
  channelAccessToken: 'YOUR_CHANNEL_ACCESS_TOKEN',
  channelSecret: 'YOUR_CHANNEL_SECRET'
};

const client = new Client(config);

// Middleware
app.use(bodyParser.json());
app.use(middleware(config));

// RxJS observables for LINE events
const lineEvents$ = fromEvent(app, 'line-event');

// Function to handle message events
const handleMessageEvent = (event) => {
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: `Received your message: ${event.message.text}`
  });
};

// Subscribe to message events
lineEvents$
  .pipe(
    filter(event => event.type === 'message' && event.message.type === 'text'),
    switchMap(handleMessageEvent)
  )
  .subscribe({
    next: (result) => console.log('Message handled:', result),
    error: (err) => console.error('Error handling message:', err)
  });

// Webhook route
app.post('/webhook', (req, res) => {
  req.body.events.forEach(event => {
    app.emit('line-event', event);
  });
  res.status(200).end();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
