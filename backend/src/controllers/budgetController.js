const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Joi = require('joi');

const budgetSchema = Joi.object({
  amount: Joi.number().positive().required(),
  categoryId: Joi.number().integer().required(),
  period: Joi.string().valid('monthly', 'yearly').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().optional(),
});

exports.getBudgets = async (req, res) => {
  const budgets = await prisma.budget.findMany({
    where: { userId: req.user.id },
    include: { category: true },
  });

  res.json(budgets);
};

exports.createBudget = async (req, res) => {
  const { error } = budgetSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const budget = await prisma.budget.create({
    data: { ...req.body, userId: req.user.id },
    include: { category: true },
  });

  res.status(201).json(budget);
};

exports.updateBudget = async (req, res) => {
  const { id } = req.params;

  const { error } = budgetSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const budget = await prisma.budget.findUnique({ where: { id: parseInt(id) } });

  if (!budget || budget.userId !== req.user.id) {
    return res.status(404).json({ message: 'Budget not found' });
  }

  const updatedBudget = await prisma.budget.update({
    where: { id: parseInt(id) },
    data: req.body,
    include: { category: true },
  });

  res.json(updatedBudget);
};

exports.deleteBudget = async (req, res) => {
  const { id } = req.params;

  const budget = await prisma.budget.findUnique({ where: { id: parseInt(id) } });

  if (!budget || budget.userId !== req.user.id) {
    return res.status(404).json({ message: 'Budget not found' });
  }

  await prisma.budget.delete({ where: { id: parseInt(id) } });

  res.json({ message: 'Budget deleted' });
};