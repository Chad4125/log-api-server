const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = 9001;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/messageLog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define a schema for the messages
const messageSchema = new mongoose.Schema({
  text: String,
  timestamp: { type: Date, default: Date.now }
});

// Create a model based on the schema
const Message = mongoose.model('Message', messageSchema);

// Middleware to parse JSON
app.use(bodyParser.json());

// Endpoint to receive and save text messages
app.post('/log', async (req, res) => {
  const { text } = req.body;

  try {
    // Save the message to the database
    const message = new Message({ text });
    await message.save();
    res.status(201).send('Message saved successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to retrieve the latest text messages
app.get('/latest', async (req, res) => {
  try {
    // Get the 'count' parameter from the query string (default to 1 if not provided)
    const count = parseInt(req.query.count) || 1;

    // Find the latest messages in the database based on the count
    const latestMessages = await Message.find().sort({ timestamp: -1 }).limit(count);

    if (latestMessages.length > 0) {
      const messages = latestMessages.map(message => ({ text: message.text }));
      res.json({ messages });
    } else {
      res.status(404).send('No messages found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
