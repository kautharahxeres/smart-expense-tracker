const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.get('/profile', auth, async (req, res) => {
  res.json({ id: req.user.id, email: req.user.email, name: req.user.name });
});

router.put('/profile', auth, async (req, res) => {
  const { name, email } = req.body;

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail && existingEmail.id !== req.user.id) {
    return res.status(400).json({ message: 'Email already in use' });
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, email },
  });

  res.json({ id: user.id, email: user.email, name: user.name });
});

router.get('/dashboard', auth, async (req, res) => {
  // This is placeholder; implement real dashboard logic later
  const expenses = await prisma.expense.findMany({ where: { userId: req.user.id }});
  const budgets = await prisma.budget.findMany({ where: { userId: req.user.id }});
  res.json({ totalExpenses: expenses.length, totalBudgets: budgets.length });
});

router.get('/insights', auth, async (req, res) => {
  // Placeholder insights
  res.json({ insights: ['Insight engine not implemented'] });
});

router.get('/notifications', auth, async (req, res) => {
  res.json({ notifications: [] });
});

router.get('/export/csv', auth, async (_req, res) => {
  res.status(501).json({ message: 'CSV export not implemented yet' });
});

router.get('/export/pdf', auth, async (_req, res) => {
  res.status(501).json({ message: 'PDF export not implemented yet' });
});

module.exports = router;
