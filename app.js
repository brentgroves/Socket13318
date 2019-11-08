// start with node app.js

const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio');
const mqtt = require('mqtt');

// A messages service that allows to create new
// and return all existing messages
class MessageService {
  constructor() {
    this.messages = [];
  }

  async find() {
    // Just return all our messages
    return this.messages;
  }

  async create(data) {
    // The new message is the data merged with a unique identifier
    // using the messages length since it changes whenever we add one
    const message = {
      id: this.messages.length,
      text: data.text,
    };

    // Add new message to the list
    this.messages.push(message);

    return message;
  }
}

// Initialize a Feathers app
const app = feathers();
// Configure Socket.io real-time APIs
app.configure(socketio());
// Register an in-memory messages service
app.use('/messages', new MessageService());
// Register a nicer error handler than the default Express one
//app.use(express.errorHandler());

// Add any new real-time connection to the `everybody` channel
app.on('connection', connection => app.channel('everybody').join(connection));
// Publish all events to the `everybody` channel
app.publish(data => app.channel('everybody'));

// Start the server
app
  .listen(3030)
  .on('listening', () =>
    console.log('Feathers server listening on localhost:3030'),
  );

// For good measure let's create a message
// So our API doesn't look so empty
app.service('messages').create({
  text: 'Hello world from the server',
});

let mqttClient = mqtt.connect(
  'mqtt://ec2-3-15-151-115.us-east-2.compute.amazonaws.com',
  // 'mqtt://test.mosquitto.org'
  // 'mqtt://localhost',
);

mqttClient.on('connect', function() {
  mqttClient.subscribe('Plex13318', function(err) {
    if (!err) {
      console.log('subscribed to: Plex13318');
    }
  });
});
// message is a buffer
mqttClient.on('message', function(topic, message) {
  const params = JSON.parse(message.toString()); // payload is a buffer
  console.log(params);
  app.service('messages').create({
    text: 'mqtt message',
  });
});
