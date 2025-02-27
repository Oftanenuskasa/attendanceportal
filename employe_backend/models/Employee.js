const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  city: String,
  zone: String,
  region: String,
  country: String,
});

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true }, // Custom employeeId field
  firstName: { type: String, required: true },
  middleName: String,
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true, minlength: 5, maxlength: 30 },
  dateOfJoining: Date,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: String,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'], default: 'ACTIVE' },
  dob: Date,
  gender: { type: String, enum: ['MALE', 'FEMALE', ''] },
  address: [addressSchema],
  photo: String,
  roles: [{ type: String, default: 'EMPLOYEE' }],
}, { timestamps: true });

employeeSchema.pre('save', async function (next) {
  if (this.isNew && !this.employeeId) {
    try {
      // Find the employee with the highest employeeId
      const lastEmployee = await mongoose.model('Employee')
        .findOne()
        .sort({ employeeId: -1 }) // Sort descending
        .select('employeeId');

      let nextIdNum = 1; // Default to EMP001 if no employees exist
      if (lastEmployee && lastEmployee.employeeId) {
        const lastIdNum = parseInt(lastEmployee.employeeId.replace('EMP', ''), 10);
        nextIdNum = lastIdNum + 1;
      }

      this.employeeId = `EMP${String(nextIdNum).padStart(3, '0')}`; // e.g., EMP007
    } catch (error) {
      return next(error); // Pass error to Mongoose
    }
  }

  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

employeeSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Employee', employeeSchema);