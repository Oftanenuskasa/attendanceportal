const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee'); // Ensure correct path to Employee model

const auth = async (req, res, next) => {
    try {
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

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded JWT:', decoded);

        // Find the employee using `employeeId`
        const employee = await Employee.findOne({ employeeId: decoded.employeeId });
        if (!employee) {
            console.log('Employee not found for provided token');
            return res.status(401).json({ message: 'Unauthorized access' });
        }

        // Attach employee details to req.user
        req.user = { 
            employeeId: employee.employeeId, 
            username: employee.username, 
            roles: employee.roles 
        };

        console.log('req.user set:', req.user);
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = auth;
