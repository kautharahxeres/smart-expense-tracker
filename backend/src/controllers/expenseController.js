const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Joi = require('joi');

const expenseSchema = Joi.object({
  amount: Joi.number().positive().required(),
  description: Joi.string().optional(),
  date: Joi.date().required(),
  categoryId: Joi.number().integer().required(),
  isRecurring: Joi.boolean().optional(),
  recurringType: Joi.string().valid('daily', 'weekly', 'monthly').optional(),
});

exports.getExpenses = async (req, res) => {
  const { page = 1, limit = 10, startDate, endDate, categoryId } = req.query;

  const where = { userId: req.user.id };

  if (startDate && endDate) {
    where.date = { gte: new Date(startDate), lte: new Date(endDate) };
  }

  if (categoryId) {
    where.categoryId = parseInt(categoryId);
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: { category: true },
    skip: (page - 1) * limit,
    take: parseInt(limit),
    orderBy: { date: 'desc' },
  });

  const total = await prisma.expense.count({ where });

  res.json({ expenses, total, page: parseInt(page), pages: Math.ceil(total / limit) });
};

exports.createExpense = async (req, res) => {
  const { error } = expenseSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const expense = await prisma.expense.create({
    data: { ...req.body, userId: req.user.id },
    include: { category: true },
  });

  res.status(201).json(expense);
};

exports.updateExpense = async (req, res) => {
  const { id } = req.params;

  const { error } = expenseSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const expense = await prisma.expense.findUnique({ where: { id: parseInt(id) } });

  if (!expense || expense.userId !== req.user.id) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  const updatedExpense = await prisma.expense.update({
    where: { id: parseInt(id) },
    data: req.body,
    include: { category: true },
  });

  res.json(updatedExpense);
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;

  const expense = await prisma.expense.findUnique({ where: { id: parseInt(id) } });

  if (!expense || expense.userId !== req.user.id) {
    return res.status(404).json({ message: 'Expense not found' });
  }

  await prisma.expense.delete({ where: { id: parseInt(id) } });

  res.json({ message: 'Expense deleted' });
};