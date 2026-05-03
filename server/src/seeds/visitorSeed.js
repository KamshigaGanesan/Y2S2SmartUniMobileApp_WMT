const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Visitor = require('../models/Visitor');

dotenv.config();
connectDB();

const visitors = [
  {
    fullName: 'Nimal Perera',
    nic: '981234567V',
    purpose: 'Meeting with lecturer',
    personToMeet: 'Dr. Fernando',
    department: 'Faculty of Computing',
    checkInDate: '2026-04-12',
    checkInTime: '09:30 AM',
    phoneNumber: '0771234567',
    status: 'Checked In',
  },
  {
    fullName: 'Kavya Raj',
    nic: '200145678901',
    purpose: 'Document submission',
    personToMeet: 'Administration Office',
    department: 'Administration',
    checkInDate: '2026-04-12',
    checkInTime: '10:15 AM',
    phoneNumber: '0769876543',
    status: 'Checked In',
  },
  {
    fullName: 'Suresh Kumar',
    nic: '971112223V',
    purpose: 'Parent visit',
    personToMeet: 'Student Affairs Officer',
    department: 'Student Affairs',
    checkInDate: '2026-04-11',
    checkInTime: '02:00 PM',
    phoneNumber: '0754567890',
    status: 'Checked Out',
  },
];

const importData = async () => {
  try {
    await Visitor.deleteMany();
    await Visitor.insertMany(visitors);
    console.log('✅ Visitor seed data inserted');
    process.exit();
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

importData();