const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Book = require('../models/Book');

dotenv.config();
connectDB();

const books = [
  {
    title: 'Operating System Concepts',
    author: 'Silberschatz, Galvin, Gagne',
    faculty: 'Computing',
    category: 'Core Subject',
    description:
      'A core textbook for operating systems, process management, threads, memory management, file systems, and synchronization.',
    image: 'https://covers.openlibrary.org/b/id/8231996-L.jpg',
    availability: 'Available',
  },
  {
    title: 'Database System Concepts',
    author: 'Korth, Silberschatz',
    faculty: 'Computing',
    category: 'Database',
    description:
      'Comprehensive resource covering relational databases, ER modeling, SQL, transactions, normalization, and indexing.',
    image: 'https://covers.openlibrary.org/b/id/240726-L.jpg',
    availability: 'Available',
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    faculty: 'Computing',
    category: 'Programming',
    description:
      'A practical guide for writing readable, maintainable, and professional code using software engineering best practices.',
    image: 'https://covers.openlibrary.org/b/id/9641981-L.jpg',
    availability: 'Available',
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt, David Thomas',
    faculty: 'Computing',
    category: 'Programming',
    description:
      'A classic software development book focused on practical thinking, career growth, and writing better systems.',
    image: 'https://covers.openlibrary.org/b/id/8099256-L.jpg',
    availability: 'Available',
  },
  {
    title: 'Design Patterns',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    faculty: 'Computing',
    category: 'Software Engineering',
    description:
      'Introduces reusable object-oriented design solutions and the most important software design patterns.',
    image: 'https://covers.openlibrary.org/b/id/8235081-L.jpg',
    availability: 'Borrowed',
  },
  {
    title: 'Computer Networks',
    author: 'Andrew S. Tanenbaum',
    faculty: 'Computing',
    category: 'Networking',
    description:
      'Covers networking architecture, protocols, routing, transport layer, and network security fundamentals.',
    image: 'https://covers.openlibrary.org/b/id/5546156-L.jpg',
    availability: 'Available',
  },
  {
    title: 'Introduction to Algorithms',
    author: 'Cormen, Leiserson, Rivest, Stein',
    faculty: 'Computing',
    category: 'Algorithms',
    description:
      'A detailed academic resource for algorithm design, complexity, sorting, graphs, and dynamic programming.',
    image: 'https://covers.openlibrary.org/b/id/8101351-L.jpg',
    availability: 'Available',
  },
  {
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    faculty: 'Computing',
    category: 'Artificial Intelligence',
    description:
      'A major AI textbook covering intelligent agents, search, reasoning, machine learning, and real-world AI systems.',
    image: 'https://covers.openlibrary.org/b/id/2407261-L.jpg',
    availability: 'Available',
  },
  {
    title: 'Principles of Marketing',
    author: 'Philip Kotler, Gary Armstrong',
    faculty: 'Business',
    category: 'Marketing',
    description:
      'Explains core marketing concepts, customer value, branding, strategy, and market positioning.',
    image: 'https://covers.openlibrary.org/b/id/11153222-L.jpg',
    availability: 'Available',
  },
  {
    title: 'Financial Accounting',
    author: 'Walter T. Harrison',
    faculty: 'Business',
    category: 'Accounting',
    description:
      'Introduces accounting principles, balance sheets, financial statements, and business reporting basics.',
    image: 'https://covers.openlibrary.org/b/id/10521227-L.jpg',
    availability: 'Available',
  },
  {
    title: 'Operations Management',
    author: 'William J. Stevenson',
    faculty: 'Business',
    category: 'Management',
    description:
      'Covers operations strategy, quality, supply chain, forecasting, and productivity in organizations.',
    image: 'https://covers.openlibrary.org/b/id/10276731-L.jpg',
    availability: 'Borrowed',
  },
  {
    title: 'Business Statistics',
    author: 'Ken Black',
    faculty: 'Business',
    category: 'Statistics',
    description:
      'Provides statistical methods for business decision-making, including probability, hypothesis testing, and regression.',
    image: 'https://covers.openlibrary.org/b/id/10958330-L.jpg',
    availability: 'Available',
  },
  {
    title: 'Human Resource Management',
    author: 'Gary Dessler',
    faculty: 'Business',
    category: 'Human Resources',
    description:
      'Introduces recruitment, performance management, employee development, and workplace policy.',
    image: 'https://covers.openlibrary.org/b/id/8275320-L.jpg',
    availability: 'Available',
  },
  {
    title: 'Strategic Management',
    author: 'Fred R. David',
    faculty: 'Business',
    category: 'Strategy',
    description:
      'Focuses on organizational strategy, planning, analysis, competition, and business decision-making.',
    image: 'https://covers.openlibrary.org/b/id/8265324-L.jpg',
    availability: 'Available',
  },
];

const importData = async () => {
  try {
    await Book.deleteMany();
    await Book.insertMany(books);

    console.log('✅ Library seed data inserted successfully');
    process.exit();
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

importData();