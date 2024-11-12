const express = require('express');
const router = express.Router();
const userController = require('../controller/usercontroller');
const { authenticate, authorizeRoles } = require('../middleware/authmiddleware'); 
const bookController=require('../controller/bookcontroller')
const borrowRecordController=require('../controller/borrowrecordcontroller')

// Routes
router.post('/user-create',  userController.createUser); // Example for role-based restriction
router.post('/user-login', userController.loginUser);


//book
router.get('/get-books', authenticate, bookController.getAllBooks);
router.get('/books/:id', authenticate, bookController.getBookById);
router.post('/books', authenticate, authorizeRoles('Admin', 'Librarian'), bookController.addBook);
router.post('/update-book', authenticate, authorizeRoles('Admin', 'Librarian'), bookController.updateBook);
router.post('/books/availability', authenticate, authorizeRoles('Admin', 'Librarian'), bookController.updateBookAvailability);
router.delete('/books/:id', authenticate, authorizeRoles('Admin'), bookController.deleteBook);




//borrow record
router.post('/borrow-book', authenticate, authorizeRoles('Member'), borrowRecordController.borrowBook);
router.post('/return-book', authenticate, authorizeRoles('Member'), borrowRecordController.returnBook);
router.get('/get-borrow-history',authenticate,authorizeRoles('Member'),borrowRecordController.getBorrowHistory)
router.get('/borrow-all', authenticate, authorizeRoles('Admin'), borrowRecordController.getAllBorrowRecords);

module.exports = router;

module.exports = router;
