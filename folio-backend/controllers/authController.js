import User from '../models/User.js';
import Book from '../models/Book.js';

// POST /auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const user = await User.create({ name, email, password });
    const token = user.generateToken();

    res.status(201).json({
      success: true,
      user: {
        _id:       user._id,
        name:      user.name,
        email:     user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

// POST /auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = user.generateToken();

    res.status(200).json({
      success: true,
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

// GET /auth/me
export const getMe = async (req, res, next) => {
  try {
    const booksCount = await Book.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      user: {
        _id:       req.user._id,
        name:      req.user.name,
        email:     req.user.email,
        booksCount,
        createdAt: req.user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /auth/logout
export const logout = async (req, res, next) => {
  try {
    // Token blacklisting would be implemented here (e.g., Redis) if needed.
    res.status(200).json({ success: true, message: 'Logged out successfully. Please discard your token.' });
  } catch (err) {
    next(err);
  }
};
