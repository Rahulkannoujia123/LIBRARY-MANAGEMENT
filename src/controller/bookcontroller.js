const Book = require('../model/book.model'); // Assuming your Book model is named 'book.model'

// Get a list of all books (accessible to all roles)
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json({ message: 'Books retrieved successfully', books });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get details of a specific book (accessible to all roles)
exports.getBookById = async (req, res) => {
  const { id } = req.params;
  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json({ message: 'Book retrieved successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a new book (Librarian/Admin access)
exports.addBook = async (req, res) => {
  const { title, author, isAvailable } = req.body;

  // Validate input fields
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and author are required' });
  }

  try {
    const newBook = new Book({ title, author, isAvailable: isAvailable ?? true });
    await newBook.save();
    res.status(201).json({ message: 'Book added successfully', book: newBook });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update book details (Librarian/Admin access)
exports.updateBook = async (req, res) => {
  const { id } = req.query;
  const { title, author, isAvailable } = req.body;

  try {
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (title) book.title = title;
    if (author) book.author = author;
    if (typeof isAvailable !== 'undefined') book.isAvailable = isAvailable;

    await book.save();
    res.status(200).json({ message: 'Book updated successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark a book as available or unavailable (Librarian/Admin access)
exports.updateBookAvailability = async (req, res) => {
    const { id } = req.query; // Get the id from the query parameters
    const { isAvailable } = req.body;
  
    // Validate that isAvailable is a boolean value
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ message: 'Invalid availability status, must be true or false' });
    }
  
    try {
      // Find the book by the id provided in the query
      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
  
      // Update the book's availability status
      book.isAvailable = isAvailable;
      await book.save();
  
      // Respond with the updated book information
      res.status(200).json({ message: 'Book availability updated successfully', book });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  

// Remove a book from the collection (Admin-only)
exports.deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json({ message: 'Book removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
