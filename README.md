# Real Estate Portfolio Management Platform

A modern web-based platform for real estate investors and property managers to track portfolios, analyze performance, and collaborate on investment decisions.

## Features

### For Investors
- **Portfolio Dashboard**: View all properties and overall portfolio performance
- **Financial Metrics**: Track cash flow, ROI, cap rate, and other key metrics
- **Interactive Charts**: Visualize cash flow trends and portfolio composition
- **Manager Recommendations**: Receive and review recommendations from your property manager
- **Property Details**: Deep dive into individual property performance

### For Property Managers
- **Multi-Investor Management**: Manage multiple investor portfolios from one dashboard
- **Portfolio Overview**: View aggregate data across all managed properties
- **Action Items**: Track important tasks and deadlines
- **Recommendations System**: Send refinance, sale, or other recommendations to investors
- **Activity Tracking**: Monitor recent actions and changes

## Tech Stack

- **Frontend**: Next.js 16 with React 19
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Icons**: Lucide React
- **TypeScript**: Full type safety
- **Hosting**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd RYAN_dashboard_thing
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Accounts

For testing purposes, the app uses mock authentication:

- **Investor**: Use any email with "investor" in it (e.g., investor@example.com)
- **Manager**: Use any email with "manager" in it (e.g., manager@example.com)

## Project Structure

```
├── app/                      # Next.js app router pages
│   ├── dashboard/
│   │   ├── investor/        # Investor dashboard
│   │   └── manager/         # Manager dashboard
│   ├── login/               # Login page
│   ├── signup/              # Signup page
│   └── page.tsx             # Landing page
├── components/
│   ├── charts/              # Chart components
│   ├── dashboard/           # Dashboard-specific components
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── mock-data.ts         # Mock data for development
│   └── utils.ts             # Utility functions
└── types/
    └── index.ts             # TypeScript type definitions
```

## Key Metrics Tracked

- **Cap Rate**: Capitalization rate for each property
- **CoC Return**: Cash-on-cash return
- **IRR**: Internal rate of return
- **LTV**: Loan-to-value ratio
- **NOI**: Net operating income
- **Cash Flow**: Monthly income minus expenses
- **Total ROI**: Overall return on investment

## Deployment to Vercel

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Go to [Vercel](https://vercel.com) and import your repository

3. Vercel will auto-detect Next.js and deploy with optimal settings

4. Your app will be live at `https://your-project.vercel.app`

## Future Enhancements

### Phase 1 (MVP - Current)
- Basic authentication and dashboards
- Property management
- Financial metrics and charts
- Recommendations system

### Phase 2 (Planned)
- Real authentication (Firebase or custom JWT)
- Database integration (PostgreSQL)
- Document storage (AWS S3)
- CSV import for properties
- In-app messaging

### Phase 3 (Future)
- API integrations (Zillow, Plaid, QuickBooks)
- Automated property valuations
- AI-driven recommendations
- Mobile app
- Multi-tenant support

## Environment Variables

For production deployment, you'll need to add these environment variables:

```env
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com
```

## Contributing

This is a private project. For questions or issues, contact the project owner.

## License

Private - All Rights Reserved
