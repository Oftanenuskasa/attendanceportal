const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Store in .env
    pass: process.env.EMAIL_PASS, // Store in .env
  },
});

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

    // Handle address: parse addressJson if present
    let parsedAddress = [];
    if (addressJson) {
      try {
        const parsed = typeof addressJson === 'string' ? JSON.parse(addressJson) : addressJson;
        // If parsed is an object and not empty, wrap it in an array
        if (parsed && Object.keys(parsed).length > 0) {
          parsedAddress = [parsed];
        }
        console.log("Parsed address:", parsedAddress);
      } catch (e) {
        console.error("Error parsing addressJson:", e);
        return res.status(400).json({ message: "Invalid address format" });
      }
    }

    // Validate required fields
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
      address: parsedAddress, // Use parsedAddress directly
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

// Login Employee
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const employee = await Employee.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!employee) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: employee._id.toString(), roles: employee.roles, employeeId: employee.employeeId }, // Include employeeId in token
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
    console.log('req.user:', req.user); // Debug log to see all fields
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
    res.status(500).json({ message: 'Server error' }); // No CastError check needed here
  }
});

// employeeRoutes.js
// employeeRoutes.js
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
      employeeId, // Expect employeeId in the request body
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
      { employeeId }, // Query by employeeId
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

// Mark Attendance
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

// Get All Attendance (Admin)
router.get('/attendance', auth, async (req, res) => {
  try {
    const isAdmin = req.user.roles.includes('ADMIN');
    let attendance;

    if (isAdmin) {
      // Admins get all attendance records
      attendance = await Attendance.find().populate('employeeId', 'username email employeeId');
    } else {
      // Employees get only their own attendance records
      attendance = await Attendance.find({ employeeId: req.user.id }).populate('employeeId', 'username email employeeId');
    }

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Attendance by Date and Employee ID
router.get('/attendance/date', auth, async (req, res) => {
  try {
    const { employeeId, date } = req.query; // Expect employeeId as "EMP010"
    if (!employeeId || !date) {
      return res.status(400).json({ message: 'Employee ID and date are required' });
    }

    // Validate employee exists (optional, for better error handling)
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Query attendance by custom employeeId string
    const attendance = await Attendance.find({
      employeeId: employeeId, // Use "EMP010" directly
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    console.log("Attendance records found:", attendance); // Debug log

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/settings', auth, async (req, res) => {
  try {
    const { attendanceWindow, departments } = req.body;
    // Save to a Settings model or config file
    res.json({ message: "Settings saved" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post('/support', auth, async (req, res) => {
  try {
    const { subject, message } = req.body;
    // Logic to send email or log ticket
    res.json({ message: "Support message sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get Attendance History by Employee ID and Date Range
router.get('/attendance/history', auth, async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.query;
    if (!employeeId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Employee ID and date range are required' });
    }

    const employee = await Employee.findOne({ employeeId }); // Find by custom employeeId
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const attendance = await Attendance.find({
      employeeId: employee.employeeId, // Use _id internally
      date: { $gte: start, $lte: end },
    }).populate('employeeId', 'username email employeeId');

    res.json(attendance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Employees
router.get('/', auth, async (req, res) => {
  try {
    const employees = await Employee.find().select('-password');
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Employee by ID (Using employeeId instead of _id)
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
    const { status } = req.body; // Expect status in the request body

    // Find and update the employee
    const employee = await Employee.findOneAndUpdate(
      { employeeId },
      { status: status || "INACTIVE" }, // Default to "INACTIVE" if no status provided
      { new: true } // Return the updated document
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

// Optional: Keep the DELETE route for permanent deletion if needed
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
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const employee = await Employee.findOne({
      employeeId: decoded.employeeId,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!employee) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password (bcrypt hashing handled by pre-save middleware)
    employee.password = password; // Plain text; will be hashed by pre-save hook
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
    res.status(200).json({ message: 'Reset link sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;