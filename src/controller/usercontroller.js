
const User=require('../model/user.model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
    const { username, password, role } = req.body;
    
    // Validate input fields
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password, and role are required' });
    }
  
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this username already exists' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user
      const newUser = new User({
        username,
        password: hashedPassword,
        role,
      });
  
      // Save the user to the database
      await newUser.save();
  
      // Respond with success message and user details (excluding password)
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: newUser._id,
          username: newUser.username,
          password:newUser.password,
          role: newUser.role,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  exports.loginUser = async (req, res) => {
    const { username, password } = req.body;
  
    // Validate input fields
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
  
    try {
      // Check if the user exists
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
  
      // Compare the password with the hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
  
      // Generate a JWT token
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
  
      // Respond with the token and user details (excluding password)
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };