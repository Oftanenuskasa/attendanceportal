const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Request method:', req.method); // Debug log
  console.log('Authorization header:', authHeader); // Debug log

  if (!authHeader) {
    console.log('No authorization header found');
    return res.status(401).json({ message: 'No authorization header provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('No token extracted from header');
    return res.status(401).json({ message: 'No token provided in header' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded JWT:', decoded);
    req.user = decoded;
    console.log('req.user set:', req.user);
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = auth;