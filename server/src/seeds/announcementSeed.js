const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Announcement = require('../models/Announcement');

dotenv.config();
connectDB();

const announcements = [
  {
    title: 'Semester Examination Timetable Released',
    category: 'Exams',
    date: '2026-04-12',
    priority: 'High',
    description:
      'The final semester examination timetable has been published. Students are advised to check dates, times, and hall allocations carefully and report any clashes to the academic office immediately.',
  },
  {
    title: 'New Library eResources Now Available',
    category: 'Library',
    date: '2026-04-11',
    priority: 'Medium',
    description:
      'The library has added new academic resources including updated eBooks, research collections, and publication access for computing and engineering students.',
  },
  {
    title: 'Canteen Lunch Menu Updated for This Week',
    category: 'Canteen',
    date: '2026-04-10',
    priority: 'Normal',
    description:
      'The weekly lunch menu has been updated with new meal options and beverage selections. Students can now check available food items through the Smart Campus app.',
  },
  {
    title: 'Faculty Workshop on Internship Preparation',
    category: 'Events',
    date: '2026-04-10',
    priority: 'Medium',
    description:
      'A workshop on CV building, LinkedIn optimization, and internship interview preparation will be conducted this Friday at the main auditorium.',
  },
  {
    title: 'Assignment Submission Deadline Reminder',
    category: 'Academic',
    date: '2026-04-09',
    priority: 'High',
    description:
      'Students are reminded to submit pending coursework and module assignments before the published deadlines. Late submissions may affect marks according to module policy.',
  },
  {
    title: 'Administrative Office Time Change Notice',
    category: 'Administration',
    date: '2026-04-08',
    priority: 'Normal',
    description:
      'The student administration office will operate with revised working hours this week due to internal scheduling changes. Please plan document collection accordingly.',
  },
];

const importData = async () => {
  try {
    await Announcement.deleteMany();
    await Announcement.insertMany(announcements);

    console.log('✅ Announcement seed data inserted');
    process.exit();
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

importData();