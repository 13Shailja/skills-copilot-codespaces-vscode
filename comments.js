// Create web server with express
const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto'); // randomBytes is a function inside crypto
const cors = require('cors'); // Cross Origin Resource Sharing
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

// GET request handler
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []); // send back the comments array
});

// POST request handler
app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex'); // create random id
  const { content } = req.body; // pull content out of the request body
  const comments = commentsByPostId[req.params.id] || []; // get comments array for the post from the commentsByPostId object

  comments.push({ id: commentId, content, status: 'pending' }); // push the new comment to the array

  commentsByPostId[req.params.id] = comments; // update commentsByPostId object

  // emit event to event bus
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: {
      // send the data that will be sent to the event bus
      id: commentId,
      content,
      postId: req.params.id,
      status: 'pending',
    },
  });

  res.status(201).send(comments); // send back the comments array
});

// POST request handler
app.post('/events', async (req, res) => {
  console.log('Event Received: ', req.body.type);

  const { type, data } = req.body; // get type and data from the request body

  if (type === 'CommentModerated') {
    // pull out the commentId and status from the data object
    const { postId, id, status, content } = data;

    // get the comments array for the post
    const comments = commentsByPostId[postId];

    // find the comment that has the same id as the one that was moderated
    const comment = comments.find((comment) => {
      return comment.id === id;})}})