const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB connection established successfully');
});

// Define routes (to be added in later steps)

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const User = require('./models/user');

// Register user
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Login user
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) throw new Error('User not found');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Incorrect password');
    res.status(200).send('Login successful');
  } catch (error) {
    res.status(401).send(error.message);
  }
});

const jwt = require('jsonwebtoken');

// Login user
app.post('/login', async (req, res) => {
  try {
    // ... (existing code)

    // Generate JWT token
    const token = jwt.sign({ username: user.username }, 'secret-key', {
      expiresIn: '1h',
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

const jwt = require('jsonwebtoken');

// Login user
app.post('/login', async (req, res) => {
  try {
    // ... (existing code)

    // Generate JWT token
    const token = jwt.sign({ username: user.username }, 'secret-key', {
      expiresIn: '1h',
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(401).send(error.message);
  }
});

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).send('Access denied');

  jwt.verify(token, 'secret-key', (err, user) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = user;
    next();
  });
};

// Example secured route
app.get('/tasks', verifyToken, (req, res) => {
  // Only accessible with a valid token
  res.send('This is a secured route');
});

const Task = require('./models/task');

// Create task
app.post('/tasks', verifyToken, async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const user = await User.findOne({ username: req.user.username });

    const task = new Task({
      title,
      description,
      deadline,
      user: user._id,
    });

    await task.save();
    res.status(201).send('Task created successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Get user's tasks
// Get user's tasks with optional filtering and sorting
app.get('/tasks', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });

    const filterOptions = {};
    const sortOptions = {};

    // Handle filtering
    if (req.query.filter) {
      if (req.query.filter === 'completed') {
        filterOptions.status = 'Completed';
      } else if (req.query.filter === 'inProgress') {
        filterOptions.status = 'In Progress';
      }
      // Add additional filter options as needed
    }

    // Handle sorting
    if (req.query.sort) {
      if (req.query.sort === 'deadline') {
        sortOptions.deadline = 1;
      } else if (req.query.sort === 'priority') {
        // Add additional sorting options as needed
      }
    }

    const tasks = await Task.find({ user: user._id, ...filterOptions })
      .sort(sortOptions)
      .exec();

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// Update task
app.put('/tasks/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, deadline },
      { new: true }
    );
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Delete task
app.delete('/tasks/:id', verifyToken, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).send('Task deleted successfully');
  } catch (error) {
    res.status(400).send(error.message);
  }
});
