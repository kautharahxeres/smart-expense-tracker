"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  LogIn,
  UserPlus,
  Plus,
  Trash2,
  Edit3,
  LogOut,
  CircleCheck,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const CATEGORY_OPTIONS = [
  { id: 1, name: "Food" },
  { id: 2, name: "Transport" },
  { id: 3, name: "Shopping" },
  { id: 4, name: "Utilities" },
  { id: 5, name: "Entertainment" },
  { id: 6, name: "Health" },
  { id: 7, name: "Others" },
];
const CATEGORY_COLORS = ["#2563EB", "#DB2777", "#F59E0B", "#14B8A6", "#8B5CF6", "#EF4444", "#0EA5E9"];

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const nowISO = () => new Date().toISOString().slice(0, 10);

export default function Home() {
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("demo@expense.com");
  const [password, setPassword] = useState("password");
  const [name, setName] = useState("Demo User");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    amount: "",
    description: "",
    date: nowISO(),
    categoryId: 1,
    isRecurring: false,
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("expense-tracker-session");
    if (saved) {
      const session = JSON.parse(saved);
      setToken(session.token);
      setUser(session.user);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    localStorage.setItem("expense-tracker-session", JSON.stringify({ token, user }));
    fetchExpenses();
  }, [token]);

  const client = async (path, method = "GET", body) => {
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Request failed");
      return data;
    } catch (err) {
      throw err;
    }
  };

  const onAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    const endpoint = authMode === "register" ? "/auth/register" : "/auth/login";
    const payload = authMode === "register" ? { email, password, name } : { email, password };

    try {
      setLoading(true);
      const body = await client(endpoint, "POST", payload);
      setToken(body.token);
      setUser(body.user);
      setSuccess(`Logged in as ${body.user.name}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await client("/expenses?limit=100&sortBy=date");
      setExpenses(data.expenses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ amount: "", description: "", date: nowISO(), categoryId: 1, isRecurring: false });
    setEditingId(null);
  };

  const onSubmitExpense = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      amount: parseFloat(form.amount),
      description: form.description,
      date: form.date,
      categoryId: parseInt(form.categoryId, 10),
      isRecurring: form.isRecurring,
      recurringType: form.isRecurring ? "monthly" : undefined,
    };

    if (!payload.amount || payload.amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await client(`/expenses/${editingId}`, "PUT", payload);
        setSuccess("Expense updated successfully.");
      } else {
        await client("/expenses", "POST", payload);
        setSuccess("Expense created successfully.");
      }
      await fetchExpenses();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    setError("");
    setSuccess("");
    if (!window.confirm("Delete this expense?")) return;

    try {
      setLoading(true);
      await client(`/expenses/${id}`, "DELETE");
      setSuccess("Expense deleted.");
      await fetchExpenses();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (expense) => {
    setEditingId(expense.id);
    setForm({
      amount: expense.amount.toString(),
      description: expense.description || "",
      date: expense.date.slice(0, 10),
      categoryId: expense.categoryId,
      isRecurring: expense.isRecurring,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);
    const perCategory = CATEGORY_OPTIONS.map((cat) => ({
      name: cat.name,
      value: expenses.filter((x) => x.categoryId === cat.id).reduce((t, x) => t + x.amount, 0),
    })).filter((entry) => entry.value > 0);

    const byDate = Object.values(
      expenses.reduce((acc, item) => {
        const day = item.date.slice(0, 10);
        if (!acc[day]) acc[day] = { date: day, amount: 0 };
        acc[day].amount += item.amount;
        return acc;
      }, {})
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    const topCategory = perCategory.sort((a, b) => b.value - a.value)[0];

    return { total, perCategory, byDate, topCategory };
  }, [expenses]);

  const logout = () => {
    setToken("");
    setUser(null);
    setExpenses([]);
    localStorage.removeItem("expense-tracker-session");
    setSuccess("Logged out successfully.");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 p-6 text-white shadow-lg">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">Smart Expense Tracker</h1>
              <p className="mt-2 text-slate-100">Fintech-grade UX, realtime insights, and all essential expense controls in one dashboard.</p>
            </div>
            {user ? (
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900/80 px-4 py-2 text-sm font-semibold hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            ) : null}
          </div>
          {user ? (
            <div className="text-sm text-slate-100">
              Signed in as <strong>{user.name}</strong> ({user.email})
            </div>
          ) : (
            <div className="text-sm text-slate-100">Use demo credentials to start fast: <code>demo@expense.com / password</code>.</div>
          )}
        </header>

        {error && <div className="rounded-md bg-red-100 p-3 text-red-700">{error}</div>}
        {success && <div className="rounded-md bg-emerald-100 p-3 text-emerald-700">{success}</div>}

        {!user ? (
          <section className="rounded-xl bg-white p-6 shadow">
            <h2 className="mb-4 text-2xl font-semibold">{authMode === "login" ? "Login" : "Register"}</h2>
            <form onSubmit={onAuth} className="space-y-4">
              {authMode === "register" && (
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Full name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    placeholder="Jane Doe"
                  />
                </label>
              )}
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="demo@expense.com"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Password</span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  placeholder="******"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {authMode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {loading ? "Working..." : authMode === "login" ? "Login" : "Create account"}
              </button>
            </form>
            <div className="mt-4 text-sm text-slate-600">
              {authMode === "login" ? (
                <span>
                  Don’t have an account?{' '}
                  <button onClick={() => setAuthMode('register')} className="font-semibold text-indigo-600 hover:underline">
                    Register
                  </button>
                </span>
              ) : (
                <span>
                  Have an account?{' '}
                  <button onClick={() => setAuthMode('login')} className="font-semibold text-indigo-600 hover:underline">
                    Login
                  </button>
                </span>
              )}
            </div>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl bg-white p-6 shadow">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Add / Edit Expense</h2>
                  <span className="text-sm text-slate-500">{editingId ? "Editing" : "New"}</span>
                </div>
                <form onSubmit={onSubmitExpense} className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Amount (USD)</span>
                    <input
                      value={form.amount}
                      onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                      type="number"
                      step="0.01"
                      min="0"
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Date</span>
                    <input
                      value={form.date}
                      onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                      type="date"
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      required
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Description</span>
                    <input
                      value={form.description}
                      onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                      type="text"
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      placeholder="Groceries, taxi, utilities..."
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-slate-700">Category</span>
                    <select
                      value={form.categoryId}
                      onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                      className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    >
                      {CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.isRecurring}
                      onChange={(e) => setForm((prev) => ({ ...prev, isRecurring: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm">Recurring monthly</span>
                  </label>
                  <div className="md:col-span-2 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                      {editingId ? "Update expense" : "Create expense"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
                      >
                        Cancel edit
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <h2 className="mb-4 text-2xl font-semibold">Expenses ({expenses.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] divide-y divide-slate-200 text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600">
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-left">Amount</th>
                        <th className="py-3 px-4 text-left">Category</th>
                        <th className="py-3 px-4 text-left">Description</th>
                        <th className="py-3 px-4 text-left">Recurring</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expenses.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-4 px-4 text-center text-slate-500">
                            No expenses yet.
                          </td>
                        </tr>
                      )}
                      {expenses.map((expense) => (
                        <tr key={expense.id}>
                          <td className="py-3 px-4">{expense.date.slice(0, 10)}</td>
                          <td className="py-3 px-4 font-semibold">{formatMoney(expense.amount)}</td>
                          <td className="py-3 px-4">{expense.category?.name || "Unknown"}</td>
                          <td className="py-3 px-4">{expense.description || "-"}</td>
                          <td className="py-3 px-4 text-center">{expense.isRecurring ? "Yes" : "No"}</td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => onEdit(expense)}
                              className="inline-flex items-center gap-1 rounded px-2 py-1 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit3 className="h-3.5 w-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => onDelete(expense.id)}
                              className="inline-flex items-center gap-1 rounded px-2 py-1 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <aside className="space-y-6">
              <div className="rounded-xl bg-white p-6 shadow">
                <h2 className="mb-4 text-2xl font-semibold">Quick Insights</h2>
                <p className="text-sm text-slate-600">Total spend tracked: <strong>{formatMoney(stats.total)}</strong></p>
                <p className="text-sm text-slate-600">Top category: <strong>{stats.topCategory?.name || "None"}</strong></p>
                <p className="text-sm text-slate-600">Entries: <strong>{expenses.length}</strong></p>
                <p className="mt-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">
                  {stats.total > 0
                    ? `Keep the momentum: your average per day is ${formatMoney(stats.total / Math.max(1, stats.byDate.length))}`
                    : "Add an expense to unlock smart insights."}
                </p>
              </div>

              <div className="h-72 rounded-xl bg-white p-4 shadow">
                <h3 className="mb-3 text-lg font-semibold">Spending Trend</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={stats.byDate}>
                    <defs>
                      <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatMoney(value)} />
                    <Area dataKey="amount" stroke="#6366F1" fillOpacity={1} fill="url(#colorSpent)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {stats.perCategory.length > 0 && (
                <div className="h-72 rounded-xl bg-white p-4 shadow">
                  <h3 className="mb-3 text-lg font-semibold">Category Breakdown</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie dataKey="value" data={stats.perCategory} nameKey="name" innerRadius={45} outerRadius={85} paddingAngle={3}>
                        {stats.perCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatMoney(value)} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </aside>
          </section>
        )}

        <footer className="rounded-xl bg-white p-4 text-center text-sm text-slate-500 shadow">
          <p>
            Built with strong UX focus, third-party analytics, and robust expense control. Use filters and export features via API endpoints to keep your financial insights sharp.
          </p>
          <p className="mt-2">Need auto-sync? Make sure `/api/users/insights` and `/api/users/export/csv` are implemented on your backend.</p>
        </footer>
      </div>
    </main>
  );
}