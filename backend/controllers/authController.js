import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';
const jwtExpiry = '7d';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    // Always assign 'user' role for new registrations
    const user = await User.create({ name, email, passwordHash, role: 'user' });
    return res.status(201).json({
      token: jwt.sign({ sub: user._id, role: user.role }, jwtSecret, { expiresIn: jwtExpiry }),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Registration failed', details: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ sub: user._id, role: user.role }, jwtSecret, { expiresIn: jwtExpiry });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed', details: err.message });
  }
};

export const me = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Fetch fresh user data from DB for up-to-date info
    const user = await User.findById(req.user.sub || req.user._id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Build absolute avatar URL if present
    let avatar = user.avatar;
    if (avatar && !avatar.startsWith('http')) {
      const protocol = req.protocol;
      const host = req.get('host');
      avatar = `${protocol}://${host}${avatar}`;
    }
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      company: user.company,
      address: user.address,
      avatar
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch profile', details: err.message });
  }
};

// PATCH /api/user/me
export const updateMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Allow updating all editable fields, including avatar
    const updateFields = {};
    const allowed = ['name', 'role', 'phone', 'company', 'address', 'avatar'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updateFields[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true, select: '-passwordHash' }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Build absolute avatar URL if present
    let avatar = user.avatar;
    if (avatar && !avatar.startsWith('http')) {
      const protocol = req.protocol;
      const host = req.get('host');
      avatar = `${protocol}://${host}${avatar}`;
    }
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      company: user.company,
      address: user.address,
      avatar
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile', details: err.message });
  }
};


