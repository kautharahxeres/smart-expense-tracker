# Smart Expense Tracker

A production-ready personal finance management web application with intelligent insights, built using modern web technologies.

## 🚀 Features

### Core Functionality
- **Secure Authentication**: JWT-based login/registration with password hashing
- **Expense Management**: Add, edit, delete expenses with categories and recurring options
- **Income Tracking**: Record and manage income sources
- **Budgeting System**: Set category-based budgets with period tracking
- **Dashboard**: Comprehensive overview with balance, spending charts, and category breakdown

### Smart Features
- **Intelligent Insights**: AI-like analysis detecting spending trends, comparisons, and recommendations
- **Notifications**: In-app alerts for budget warnings and spending insights (email optional)
- **Data Export**: Export transactions to CSV or PDF
- **Responsive Design**: Mobile-first design with dark/light mode toggle
- **Advanced Filtering**: Search, pagination, and date-based filtering

### Technical Features
- API rate limiting and input validation
- Error handling and logging
- Modular architecture with clean separation of concerns
- Environment-based configuration

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **Prisma ORM** with PostgreSQL
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Joi** for input validation
- **Winston** for logging
- **Nodemailer** for email notifications
- **Helmet** and CORS for security

### Database
- **PostgreSQL** with Prisma migrations

## 📁 Project Structure

```
smart-expense-tracker/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── dashboard/
│   │   ├── expenses/
│   │   ├── budgets/
│   │   └── profile/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
├── database/
│   ├── migrations/
│   └── seeds/
└── README.md
```

## 🏁 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Database Setup
```bash
# Create PostgreSQL database
createdb smart_expense_tracker

# Update backend/.env with your database credentials
DATABASE_URL="postgresql://username:password@localhost:5432/smart_expense_tracker"
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔧 Configuration

### Environment Variables (Backend)
Create `.env` file in backend directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/smart_expense_tracker"
JWT_SECRET="your_super_secret_jwt_key"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"
PORT=5000
NODE_ENV=development
```

### Environment Variables (Frontend)
Create `.env.local` in frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Expenses
- `GET /api/expenses` - Get user expenses (with pagination/filtering)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Incomes
- `GET /api/incomes` - Get user incomes
- `POST /api/incomes` - Create income
- `PUT /api/incomes/:id` - Update income
- `DELETE /api/incomes/:id` - Delete income

### Budgets
- `GET /api/budgets` - Get user budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Categories
- `GET /api/categories` - Get all categories

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/dashboard` - Get dashboard data
- `GET /api/users/insights` - Get smart insights
- `GET /api/users/notifications` - Get notifications
- `GET /api/users/export/csv` - Export expenses to CSV
- `GET /api/users/export/pdf` - Export expenses to PDF

## 🚀 Deployment

### Backend (Render/Heroku)
1. Push backend code to GitHub
2. Connect to Render/Heroku
3. Set environment variables
4. Deploy

### Frontend (Vercel)
1. Push frontend code to GitHub
2. Connect to Vercel
3. Set `NEXT_PUBLIC_API_URL` to production backend URL
4. Deploy

### Database (Production)
- Use managed PostgreSQL (e.g., Supabase, Railway, or AWS RDS)
- Update `DATABASE_URL` in production environment

## 🎨 Design Highlights

- **Fintech-inspired UI**: Clean, professional design suitable for real users
- **Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **Interactive Charts**: Bar, pie, and line charts for data visualization
- **Intuitive UX**: Easy navigation with clear call-to-actions
- **Accessibility**: Proper contrast, focus states, and semantic HTML

## 🔍 Smart Insights Examples

- "You spent 25% more on dining out this month compared to last month"
- "Your transportation costs have increased by 15% over the past 4 weeks"
- "You're approaching your food budget limit - 85% used this month"
- "Consider reducing entertainment expenses to save $200 monthly"

## 📈 Future Enhancements

- Integration with OpenAI API for advanced insights
- Mobile app using React Native
- Multi-currency support
- Receipt scanning with OCR
- Social features (shared budgets)
- Advanced analytics with machine learning

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 📞 Support

For questions or issues, please open a GitHub issue or contact the maintainers.

---

Built with ❤️ for the developer community. Showcase your skills with this production-ready application!