const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    bookId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book', required: true
    },
    borrowedAt: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnedAt: { type: Date },
    status: {
        type: String,
        enum: ['Borrowed', 'Returned'],
        default: 'Borrowed'
    },
});

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
