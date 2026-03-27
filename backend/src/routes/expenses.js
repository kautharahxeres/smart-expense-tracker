const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');

router.get('/', auth, getExpenses);
router.post('/', auth, createExpense);
router.put('/:id', auth, updateExpense);
router.delete('/:id', auth, deleteExpense);

module.exports = router;
