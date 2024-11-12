const BorrowRecord = require('../model/borrowrecord'); // Assuming you have a BorrowRecord model
const Book = require('../model/book.model'); // Assuming you have a Book model

// Borrow a book (Member-only)
exports.borrowBook = async (req, res) => {
  const { bookId } = req.body;

  // Validate input
  if (!bookId) {
    return res.status(400).json({ message: 'Book ID is required to borrow a book' });
  }

  try {
    // Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if the book is available
    if (!book.isAvailable) {
      return res.status(400).json({ message: 'Book is currently unavailable for borrowing' });
    }

    // Create a new borrow record
    const borrowRecord = new BorrowRecord({
      userId: req.user.id, // Assuming userId is available in req.user from the authentication middleware
      bookId,
      borrowedAt: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Setting a 2-week borrowing period
      status: 'Borrowed',
    });

    // Save the borrow record and mark the book as unavailable
    await borrowRecord.save();
    book.isAvailable = false;
    await book.save();

    res.status(201).json({ message: 'Book borrowed successfully', borrowRecord });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Return a borrowed book (Member-only)
exports.returnBook = async (req, res) => {
  const { borrowRecordId } = req.query;

  try {
    // Find the borrow record
    const borrowRecord = await BorrowRecord.findById(borrowRecordId);
    if (!borrowRecord) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    // Ensure the user returning the book is the one who borrowed it
    if (borrowRecord.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to return this book' });
    }

    // Check if the book has already been returned
    if (borrowRecord.status === 'Returned') {
      return res.status(400).json({ message: 'This book has already been returned' });
    }

    // Mark the borrow record as returned and update the book's availability
    borrowRecord.status = 'Returned';
    borrowRecord.returnedAt = new Date();
    await borrowRecord.save();

    // Mark the book as available
    const book = await Book.findById(borrowRecord.bookId);
    if (book) {
      book.isAvailable = true;
      await book.save();
    }

    res.status(200).json({ message: 'Book returned successfully', borrowRecord });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// View borrowing history for the logged-in member (Member-only)
exports.getBorrowHistory = async (req, res) => {
  try {
    const borrowRecords = await BorrowRecord.find({ userId: req.user.id }).populate('bookId', 'title author');
    res.status(200).json({ message: 'Borrowing history retrieved successfully', borrowRecords });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all borrow records (Admin-only access)
exports.getAllBorrowRecords = async (req, res) => {
  try {
    const borrowRecords = await BorrowRecord.find().populate('bookId', 'title author').populate('userId', 'username');
    res.status(200).json({ message: 'All borrow records retrieved successfully', borrowRecords });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
