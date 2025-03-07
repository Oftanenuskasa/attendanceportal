const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const upload = require('../middleware/upload');
const Settings = require("../models/Settings");
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Export routes as a function that accepts transporter
module.exports = (transporter) => {
  router.post('/create', upload.single('photo'), async (req, res) => {
    try {
      const {
        firstName,
        middleName,
        lastName,
        username,
        dateOfJoining,
        email,
        password,
        phoneNumber,
        status,
        dob,
        gender,
        addressJson,
        roles,
        photo: photoUrl,
      } = req.body;

      console.log("Request body:", req.body);
      console.log("Uploaded file:", req.file);

      let parsedAddress = [];
      if (addressJson) {
        try {
          const parsed = typeof addressJson === 'string' ? JSON.parse(addressJson) : addressJson;
          if (parsed && Object.keys(parsed).length > 0) {
            parsedAddress = [parsed];
          }
          console.log("Parsed address:", parsedAddress);
        } catch (e) {
          console.error("Error parsing addressJson:", e);
          return res.status(400).json({ message: "Invalid address format" });
        }
      }

      if (!firstName || !lastName || !username || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const employeeData = {
        firstName,
        middleName: middleName || '',
        lastName,
        username,
        dateOfJoining: dateOfJoining || null,
        email,
        password, // Will be hashed by pre-save hook
        phoneNumber: phoneNumber || '',
        status: status || 'ACTIVE',
        dob: dob || null,
        gender: gender || '',
        address: parsedAddress,
        photo: req.file ? req.file.path : photoUrl || null,
        roles: roles && Array.isArray(roles) ? roles : ['EMPLOYEE'],
      };

      console.log("Employee data to save:", employeeData);

      const employee = new Employee(employeeData);
      await employee.save();

      res.status(201).json({ message: 'Employee created successfully', employee });
    } catch (error) {
      console.error('Error creating employee:', error);
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Duplicate username or email' });
      }
      res.status(500).json({ message: error.message || 'Server error' });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      const employee = await Employee.findOne({
        $or: [{ username }, { email: username }],
      });

      if (!employee) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, employee.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }

      const token = jwt.sign(
        { id: employee._id.toString(), roles: employee.roles, employeeId: employee.employeeId },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({
        token,
        username: employee.username,
        email: employee.email,
        roles: employee.roles,
        employeeId: employee.employeeId,
        photo: employee.photo,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.get('/profile', auth, async (req, res) => {
    try {
      console.log('req.user:', req.user);
      const employee = await Employee.findOne({ employeeId: req.user.employeeId }).select('-password');
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      console.log('Raw employee data from DB:', employee.toObject());

      const responseData = {
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        middleName: employee.middleName || '',
        lastName: employee.lastName,
        username: employee.username,
        email: employee.email,
        dateOfJoining: employee.dateOfJoining || null,
        dob: employee.dob || null,
        gender: employee.gender || '',
        address: employee.address || [],
        phoneNumber: employee.phoneNumber || '',
        status: employee.status || 'ACTIVE',
        photo: employee.photo || null,
        roles: employee.roles || ['EMPLOYEE'],
      };

      console.log('Sending profile response:', responseData);
      res.json(responseData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.patch('/profile/edit-no-auth', upload.single('photo'), async (req, res) => {
    try {
      const {
        firstName,
        middleName,
        lastName,
        email,
        phoneNumber,
        dob,
        dateOfJoining,
        gender,
        addressJson,
        employeeId,
      } = req.body;

      console.log("Request body:", req.body);
      console.log("Uploaded file:", req.file);

      let parsedAddress = [];
      if (addressJson) {
        parsedAddress = typeof addressJson === 'string' ? JSON.parse(addressJson) : addressJson;
        console.log("Parsed address:", parsedAddress);
      }

      const updateData = {
        firstName,
        middleName,
        lastName,
        email,
        phoneNumber,
        dob,
        dateOfJoining,
        gender,
        address: Array.isArray(parsedAddress) ? parsedAddress : [parsedAddress],
        ...(req.file && { photo: req.file.path }),
      };

      console.log("Updating employee with employeeId:", employeeId);
      console.log("Update data:", updateData);

      const employee = await Employee.findOneAndUpdate(
        { employeeId },
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json(employee);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.post('/attendance', auth, async (req, res) => {
    try {
      const { name, department, status } = req.body;
      const employeeId = req.user.employeeId;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const existingAttendance = await Attendance.findOne({
        employeeId,
        date: { $gte: today, $lt: tomorrow },
      });

      if (existingAttendance) {
        return res.status(400).json({ message: 'Attendance already marked for today' });
      }

      const attendance = new Attendance({
        employeeId,
        name,
        department,
        status,
        date: new Date(),
      });

      await attendance.save();
      res.status(201).json({ message: 'Attendance marked successfully', attendance });
    } catch (error) {
      console.error(error);
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Attendance already marked for today' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Consolidated /attendance GET route
  router.get('/attendance', auth, async (req, res) => {
    try {
      const isAdmin = req.user.roles.includes('ADMIN');
      let attendance;

      if (isAdmin) {
        attendance = await Attendance.find();
      } else {
        attendance = await Attendance.find({ employeeId: req.user.employeeId });
      }

      res.json(attendance);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.post("/settings", auth, async (req, res) => {
    try {
      const { attendanceWindow, departments } = req.body;

      if (!attendanceWindow || !attendanceWindow.startTime || !attendanceWindow.endTime) {
        return res.status(400).json({ message: "Attendance window (startTime and endTime) is required" });
      }
      if (!Array.isArray(departments) || departments.length === 0) {
        return res.status(400).json({ message: "Departments must be a non-empty array" });
      }

      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(attendanceWindow.startTime) || !timeRegex.test(attendanceWindow.endTime)) {
        return res.status(400).json({ message: "Invalid time format. Use HH:MM (24-hour)" });
      }

      const existingSettings = await Settings.findOne();
      if (existingSettings) {
        existingSettings.attendanceWindow = attendanceWindow;
        existingSettings.departments = departments;
        await existingSettings.save();
      } else {
        const newSettings = new Settings({
          attendanceWindow,
          departments,
        });
        await newSettings.save();
      }

      res.status(200).json({ message: "Settings saved successfully" });
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  router.get("/settings", auth, async (req, res) => {
    try {
      const settings = await Settings.findOne();
      if (!settings) {
        return res.status(404).json({ message: "Settings not found" });
      }
      res.status(200).json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  router.post('/support', auth, async (req, res) => {
    try {
      const { subject, message } = req.body;
      res.json({ message: "Support message sent" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  router.get('/attendance/history', auth, async (req, res) => {
    try {
      const { employeeId, startDate, endDate } = req.query;
      if (!employeeId || !startDate || !endDate) {
        return res.status(400).json({ message: 'Employee ID and date range are required' });
      }

      const employee = await Employee.findOne({ employeeId });
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const attendance = await Attendance.find({
        employeeId: employee.employeeId,
        date: { $gte: start, $lte: end },
      });

      res.json(attendance);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.get('/', auth, async (req, res) => {
    try {
      const employees = await Employee.find().select('-password');
      res.json(employees);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.get('/:employeeId', auth, async (req, res) => {
    try {
      const employee = await Employee.findOne({ employeeId: req.params.employeeId }).select('-password');
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      res.json(employee);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.patch('/:employeeId/deactivate', auth, async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { status } = req.body;

      const employee = await Employee.findOneAndUpdate(
        { employeeId },
        { status: status || "INACTIVE" },
        { new: true }
      );

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json({ message: 'Employee deactivated successfully', employee });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.delete('/:employeeId', auth, async (req, res) => {
    try {
      const employee = await Employee.findOne({ employeeId: req.params.employeeId });
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      await Employee.deleteOne({ employeeId: req.params.employeeId });
      await Attendance.deleteMany({ employeeId: employee._id });
      res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const employee = await Employee.findOne({
        employeeId: decoded.employeeId,
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
      });

      if (!employee) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      employee.password = password;
      employee.resetToken = undefined;
      employee.resetTokenExpiration = undefined;
      await employee.save();

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error(error);
      if (error.name === 'JsonWebTokenError') {
        return res.status(400).json({ message: 'Invalid reset token' });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.post('/forgot-password', async (req, res) => {
    const { username } = req.body;
    try {
      if (!username) {
        return res.status(400).json({ message: 'Username or email is required' });
      }

      const employee = await Employee.findOne({
        $or: [{ username }, { email: username }],
      });
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      const resetToken = jwt.sign(
        { id: employee.employeeId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
      employee.resetToken = resetToken;
      employee.resetTokenExpiration = Date.now() + 3600000;
      await employee.save();

      const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: employee.email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click this link to reset your password: ${resetUrl}. This link expires in 1 hour.`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Reset email sent to ${employee.email} with token: ${resetToken}`);
      res.status(200).json({ message: 'Reset link sent to your email' });
    } catch (error) {
      console.error("Error in forgot-password:", error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  router.post('/change-password', auth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
  
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      // Fetch employee from database using ID from the JWT
      const employee = await Employee.findById(req.user.employeeId);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
  
      // Compare the current password with the stored hash
      const isMatch = await bcrypt.compare(currentPassword, employee.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
  
      // Ensure new password is different
      const isSamePassword = await bcrypt.compare(newPassword, employee.password);
      if (isSamePassword) {
        return res.status(400).json({ message: 'New password must be different from the current password' });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      employee.password = await bcrypt.hash(newPassword, salt);
  
      // Save the updated employee
      await employee.save();
  
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

  router.patch('/profile/edit-no-auth', upload.single('photo'), async (req, res) => {
    try {
      const { firstName, middleName, lastName, email, phoneNumber, dob, dateOfJoining, gender, addressJson, employeeId } = req.body;
      let parsedAddress = [];
      if (addressJson) {
        parsedAddress = typeof addressJson === 'string' ? JSON.parse(addressJson) : addressJson;
      }
      const updateData = {
        firstName,
        middleName,
        lastName,
        email,
        phoneNumber,
        dob,
        dateOfJoining,
        gender,
        address: Array.isArray(parsedAddress) ? parsedAddress : [parsedAddress],
        ...(req.file && { photo: req.file.path }),
      };
      const employee = await Employee.findOneAndUpdate(
        { employeeId },
        updateData,
        { new: true, runValidators: true }
      ).select('-password');
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      res.json(employee);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });

  return router;
};