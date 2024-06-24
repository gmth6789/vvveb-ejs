const express = require('express');
const bodyParser = require('body-parser');
const { Client, middleware } = require('@line/bot-sdk');
const { fromEvent } = require('rxjs');
const { map, switchMap, filter } = require('rxjs/operators');

const app = express();
const port = 3000;

// LINE Bot configuration
const config = {
  channelAccessToken: 'ZATSCX7jJfr0JNIBh08SOulayhT+ylUfODRDdB3nKUsx22zf4/Kfb7kkAVTHPfYkBqvjFRNULFo0b3e3BcHlg7fa06O2DaTfAhunVG4ToIxCgWTYzcS7XA8Jmi8b6btAoCNdSQkrlPalv4ScRoJd9wdB04t89/1O/w1cDnyilFU=',
  channelSecret: '6ac867326519450a35406ab44a6bef19'
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
