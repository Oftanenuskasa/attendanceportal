const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee'); // Import Employee model

const auth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Request method:', req.method);
  console.log('Authorization header:', authHeader);

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

    // Fetch the full Employee document from the database
    const employee = await Employee.findById(decoded._id);
    if (!employee) {
      console.log('Employee not found in database');
      return res.status(401).json({ message: 'Employee not found' });
    }

    req.employee = employee; // Set the full Mongoose document
    console.log('req.employee set:', {
      id: employee._id,
      employeeId: employee.employeeId,
      username: employee.username,
    });
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = auth;