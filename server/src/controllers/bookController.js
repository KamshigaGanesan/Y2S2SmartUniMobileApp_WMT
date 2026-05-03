const Book = require('../models/Book');

// GET books with filters
const getBooks = async (req, res) => {
  try {
    const { faculty, category, search } = req.query;

    let filter = {};

    // Filter by faculty
    if (faculty) {
      filter.faculty = faculty;
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Search by title or author
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    const books = await Book.find(filter);

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch books' });
  }
};

// POST new book
const createBook = async (req, res) => {
  try {
    const { title, author, faculty, category, description, image, availability } = req.body;

    const newBook = new Book({
      title,
      author,
      faculty,
      category,
      description,
      image,
      availability,
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create book', error: error.message });
  }
};

module.exports = {
  getBooks,
  createBook,
};