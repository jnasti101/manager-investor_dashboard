# Technical Architecture
# AI-Powered Wealth Management Platform

**Version:** 1.0
**Last Updated:** January 2025
**Status:** Planning

---

## Table of Contents
1. [Technology Stack](#technology-stack)
2. [Database Schema](#database-schema)
3. [API Architecture](#api-architecture)
4. [AI Integration](#ai-integration)
5. [Security Implementation](#security-implementation)
6. [Third-Party Integrations](#third-party-integrations)
7. [Infrastructure & Deployment](#infrastructure--deployment)
8. [Cost Estimates](#cost-estimates)

---

## Technology Stack

### Frontend Stack
```
├── Framework: Next.js 16 (App Router)
├── React: 19
├── TypeScript: 5.x
├── Styling: Tailwind CSS 4
├── Charts: Recharts + D3.js (advanced visualizations)
├── Data Fetching: React Query (TanStack Query)
├── State Management: Zustand or Jotai
├── Forms: React Hook Form + Zod validation
└── Icons: Lucide React
```

### Backend Stack
```
├── API: Next.js API Routes (initial) → tRPC (future)
├── Runtime: Node.js 20+
├── Database: PostgreSQL 16
├── ORM: Prisma or Drizzle
├── Caching: Redis (Upstash)
├── Authentication: NextAuth.js v5
└── File Storage: AWS S3 / Cloudflare R2
```

### AI/ML Stack
```
├── Primary LLM: Anthropic Claude 4 (Sonnet)
├── Backup LLM: OpenAI GPT-4
├── Orchestration: LangChain
├── Vector DB: Pinecone or Chroma
├── Embeddings: OpenAI text-embedding-3-large
└── RAG: Custom implementation with LangChain
```

### Infrastructure
```
├── Hosting: Vercel (frontend + serverless API)
├── Database: Supabase / Railway / Neon
├── CDN: Cloudflare
├── Monitoring: Sentry + PostHog
├── Analytics: PostHog or Mixpanel
└── Email: Resend or SendGrid
```

---

## Database Schema

### Complete PostgreSQL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('client', 'advisor', 'admin')),
  password_hash VARCHAR(255),
  phone VARCHAR(50),
  date_of_birth DATE,
  tax_filing_status VARCHAR(50),
  primary_residence_state VARCHAR(2),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  currency VARCHAR(3) DEFAULT 'USD',
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  notifications_enabled BOOLEAN DEFAULT true,
  theme VARCHAR(20) DEFAULT 'light',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ============================================
-- ADVISOR-CLIENT RELATIONSHIPS
-- ============================================

CREATE TABLE advisor_client_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) DEFAULT 'primary',
  start_date DATE NOT NULL,
  end_date DATE,
  permissions JSONB DEFAULT '{"view": true, "edit": false}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(advisor_id, client_id)
);

CREATE INDEX idx_advisor_client_advisor ON advisor_client_relationships(advisor_id);
CREATE INDEX idx_advisor_client_client ON advisor_client_relationships(client_id);

-- ============================================
-- ASSET CATEGORIES
-- ============================================

CREATE TABLE asset_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  parent_category_id UUID REFERENCES asset_categories(id),
  icon VARCHAR(50),
  description TEXT,
  sort_order INT,
  is_active BOOLEAN DEFAULT true
);

-- Insert default categories
INSERT INTO asset_categories (name, icon, sort_order) VALUES
  ('Real Estate', 'home', 1),
  ('Investments', 'trending-up', 2),
  ('Cash & Banking', 'dollar-sign', 3),
  ('Retirement Accounts', 'piggy-bank', 4),
  ('Alternative Investments', 'briefcase', 5),
  ('Business Interests', 'building', 6),
  ('Insurance', 'shield', 7),
  ('Other Assets', 'more-horizontal', 8);

-- ============================================
-- CORE ASSETS
-- ============================================

CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES asset_categories(id),
  asset_type VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  current_value DECIMAL(15, 2) NOT NULL,
  cost_basis DECIMAL(15, 2),
  acquisition_date DATE,
  quantity DECIMAL(15, 6),
  ticker_symbol VARCHAR(20),
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assets_user ON assets(user_id);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_type ON assets(asset_type);
CREATE INDEX idx_assets_ticker ON assets(ticker_symbol);

-- ============================================
-- REAL ESTATE PROPERTIES
-- ============================================

CREATE TABLE real_estate_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE UNIQUE,
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  country VARCHAR(2) DEFAULT 'US',
  property_type VARCHAR(50),
  square_footage INT,
  bedrooms INT,
  bathrooms DECIMAL(3, 1),
  year_built INT,
  lot_size DECIMAL(10, 2),
  purchase_price DECIMAL(15, 2),
  purchase_date DATE,
  current_value DECIMAL(15, 2),
  last_appraisal_date DATE,
  rental_status VARCHAR(50) DEFAULT 'owner-occupied',
  monthly_rent DECIMAL(10, 2),
  property_tax_annual DECIMAL(10, 2),
  insurance_annual DECIMAL(10, 2),
  hoa_monthly DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_properties_asset ON real_estate_properties(asset_id);
CREATE INDEX idx_properties_city_state ON real_estate_properties(city, state);

-- ============================================
-- ACCOUNTS (Banking, Investment, Retirement)
-- ============================================

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_type VARCHAR(50) NOT NULL,
  account_name VARCHAR(255),
  institution_name VARCHAR(255),
  account_number_last4 VARCHAR(4),
  current_balance DECIMAL(15, 2) DEFAULT 0,
  available_balance DECIMAL(15, 2),
  interest_rate DECIMAL(5, 4),
  is_retirement BOOLEAN DEFAULT false,
  tax_treatment VARCHAR(50) DEFAULT 'taxable',
  plaid_account_id VARCHAR(255),
  plaid_access_token TEXT,
  plaid_item_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_accounts_plaid_item ON accounts(plaid_item_id);

-- ============================================
-- SECURITIES (Stocks, Bonds, ETFs, etc.)
-- ============================================

CREATE TABLE securities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  security_type VARCHAR(50) NOT NULL,
  ticker VARCHAR(20),
  cusip VARCHAR(9),
  exchange VARCHAR(50),
  sector VARCHAR(100),
  industry VARCHAR(100),
  quantity DECIMAL(15, 6) NOT NULL,
  average_cost_per_share DECIMAL(15, 4),
  current_price DECIMAL(15, 4),
  market_value DECIMAL(15, 2),
  unrealized_gain_loss DECIMAL(15, 2),
  last_price_update TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_securities_asset ON securities(asset_id);
CREATE INDEX idx_securities_account ON securities(account_id);
CREATE INDEX idx_securities_ticker ON securities(ticker);

-- ============================================
-- TAX LOTS (for securities)
-- ============================================

CREATE TABLE tax_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  security_id UUID REFERENCES securities(id) ON DELETE CASCADE,
  acquisition_date DATE NOT NULL,
  quantity DECIMAL(15, 6) NOT NULL,
  cost_per_share DECIMAL(15, 4) NOT NULL,
  total_cost DECIMAL(15, 2) NOT NULL,
  holding_period VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tax_lots_security ON tax_lots(security_id);
CREATE INDEX idx_tax_lots_acquisition ON tax_lots(acquisition_date);

-- ============================================
-- ALTERNATIVE INVESTMENTS
-- ============================================

CREATE TABLE alternative_investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  investment_type VARCHAR(50) NOT NULL,
  investment_name VARCHAR(255),
  initial_investment DECIMAL(15, 2),
  current_value DECIMAL(15, 2),
  commitment_amount DECIMAL(15, 2),
  unfunded_commitment DECIMAL(15, 2),
  inception_date DATE,
  expected_term_years INT,
  illiquidity_discount DECIMAL(5, 2),
  valuation_date DATE,
  valuation_method VARCHAR(100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alt_investments_asset ON alternative_investments(asset_id);
CREATE INDEX idx_alt_investments_type ON alternative_investments(investment_type);

-- ============================================
-- LIABILITIES (Debts)
-- ============================================

CREATE TABLE liabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  liability_type VARCHAR(50) NOT NULL,
  lender_name VARCHAR(255),
  account_number_last4 VARCHAR(4),
  original_amount DECIMAL(15, 2),
  current_balance DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 4),
  monthly_payment DECIMAL(10, 2),
  payment_due_day INT,
  origination_date DATE,
  maturity_date DATE,
  auto_pay_enabled BOOLEAN DEFAULT false,
  related_asset_id UUID REFERENCES assets(id),
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_liabilities_user ON liabilities(user_id);
CREATE INDEX idx_liabilities_type ON liabilities(liability_type);
CREATE INDEX idx_liabilities_related_asset ON liabilities(related_asset_id);

-- ============================================
-- INCOME STREAMS
-- ============================================

CREATE TABLE income_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  income_type VARCHAR(50) NOT NULL,
  source_name VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  frequency VARCHAR(20) NOT NULL,
  start_date DATE,
  end_date DATE,
  tax_treatment VARCHAR(50),
  related_asset_id UUID REFERENCES assets(id),
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_income_user ON income_streams(user_id);
CREATE INDEX idx_income_type ON income_streams(income_type);

-- ============================================
-- TRANSACTIONS & EXPENSES
-- ============================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  transaction_date DATE NOT NULL,
  post_date DATE,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  merchant_name VARCHAR(255),
  is_recurring BOOLEAN DEFAULT false,
  is_tax_deductible BOOLEAN DEFAULT false,
  tags TEXT[],
  plaid_transaction_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_plaid ON transactions(plaid_transaction_id);

CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  parent_category_id UUID REFERENCES expense_categories(id),
  is_tax_deductible BOOLEAN DEFAULT false,
  icon VARCHAR(50),
  color VARCHAR(7),
  sort_order INT
);

-- ============================================
-- FINANCIAL GOALS
-- ============================================

CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount DECIMAL(15, 2),
  current_amount DECIMAL(15, 2) DEFAULT 0,
  target_date DATE,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'planning',
  monthly_contribution DECIMAL(10, 2),
  expected_return_rate DECIMAL(5, 4),
  inflation_rate DECIMAL(5, 4),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goals_user ON financial_goals(user_id);
CREATE INDEX idx_goals_type ON financial_goals(goal_type);
CREATE INDEX idx_goals_status ON financial_goals(status);

CREATE TABLE goal_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID REFERENCES financial_goals(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  actual_amount DECIMAL(15, 2) NOT NULL,
  projected_amount DECIMAL(15, 2),
  contribution_amount DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goal_progress_goal_date ON goal_progress(goal_id, date DESC);

-- ============================================
-- MARKET DATA CACHE
-- ============================================

CREATE TABLE market_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol VARCHAR(20) NOT NULL,
  data_type VARCHAR(50) NOT NULL,
  price DECIMAL(15, 4),
  volume BIGINT,
  timestamp TIMESTAMP NOT NULL,
  open DECIMAL(15, 4),
  high DECIMAL(15, 4),
  low DECIMAL(15, 4),
  close DECIMAL(15, 4),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_market_data_symbol_timestamp ON market_data(symbol, timestamp DESC);
CREATE INDEX idx_market_data_symbol_type ON market_data(symbol, data_type);

-- ============================================
-- AI RECOMMENDATIONS
-- ============================================

CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  rationale TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',
  impact_score DECIMAL(5, 2),
  confidence_score DECIMAL(5, 2),
  related_assets UUID[],
  related_goals UUID[],
  action_items JSONB DEFAULT '[]',
  model_version VARCHAR(50),
  generated_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP,
  viewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_rec_user_status ON ai_recommendations(user_id, status);
CREATE INDEX idx_ai_rec_generated ON ai_recommendations(generated_at DESC);

CREATE TABLE advisor_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  advisor_id UUID REFERENCES users(id),
  recommendation_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  status VARCHAR(20) DEFAULT 'pending',
  related_asset_id UUID REFERENCES assets(id),
  estimated_benefit DECIMAL(15, 2),
  estimated_cost DECIMAL(15, 2),
  attachments JSONB DEFAULT '[]',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_advisor_rec_client ON advisor_recommendations(client_id);
CREATE INDEX idx_advisor_rec_advisor ON advisor_recommendations(advisor_id);
CREATE INDEX idx_advisor_rec_status ON advisor_recommendations(status);

-- ============================================
-- PROJECTIONS & SCENARIOS
-- ============================================

CREATE TABLE financial_projections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scenario_name VARCHAR(255) NOT NULL,
  projection_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  assumptions JSONB NOT NULL,
  projection_data JSONB NOT NULL,
  monte_carlo_iterations INT,
  success_probability DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projections_user ON financial_projections(user_id);
CREATE INDEX idx_projections_type ON financial_projections(projection_type);

-- ============================================
-- DOCUMENTS & FILES
-- ============================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT,
  file_url TEXT NOT NULL,
  mime_type VARCHAR(100),
  tax_year INT,
  related_asset_id UUID REFERENCES assets(id),
  related_account_id UUID REFERENCES accounts(id),
  tags TEXT[],
  is_archived BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_tags ON documents USING GIN(tags);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  message TEXT,
  priority VARCHAR(20) DEFAULT 'normal',
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

-- ============================================
-- AUDIT LOG
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================
-- NET WORTH SNAPSHOTS
-- ============================================

CREATE TABLE net_worth_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_assets DECIMAL(15, 2) NOT NULL,
  total_liabilities DECIMAL(15, 2) NOT NULL,
  net_worth DECIMAL(15, 2) NOT NULL,
  asset_breakdown JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, snapshot_date)
);

CREATE INDEX idx_net_worth_user_date ON net_worth_snapshots(user_id, snapshot_date DESC);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_liabilities_updated_at BEFORE UPDATE ON liabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON financial_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## API Architecture

### RESTful API Endpoints

```typescript
// ============================================
// AUTHENTICATION & USER MANAGEMENT
// ============================================

POST   /api/auth/signup              // Create new user account
POST   /api/auth/login               // Login with email/password
POST   /api/auth/logout              // Logout and invalidate session
POST   /api/auth/refresh             // Refresh access token
POST   /api/auth/forgot-password     // Request password reset
POST   /api/auth/reset-password      // Reset password with token
POST   /api/auth/verify-email        // Verify email address
POST   /api/auth/mfa/setup           // Set up MFA
POST   /api/auth/mfa/verify          // Verify MFA code

GET    /api/users/me                 // Get current user profile
PUT    /api/users/me                 // Update current user profile
GET    /api/users/:id                // Get user by ID (admin only)
PUT    /api/users/:id/settings       // Update user settings
DELETE /api/users/me                 // Delete account

// ============================================
// ASSETS
// ============================================

GET    /api/assets                   // List all assets for user
POST   /api/assets                   // Create new asset
GET    /api/assets/:id               // Get asset by ID
PUT    /api/assets/:id               // Update asset
DELETE /api/assets/:id               // Delete asset
GET    /api/assets/category/:cat     // Get assets by category
GET    /api/assets/stats             // Get asset statistics

// ============================================
// REAL ESTATE
// ============================================

GET    /api/real-estate              // List all properties
POST   /api/real-estate              // Create property
GET    /api/real-estate/:id          // Get property details
PUT    /api/real-estate/:id          // Update property
DELETE /api/real-estate/:id          // Delete property
POST   /api/real-estate/:id/valuation // Update valuation (Zillow API)
GET    /api/real-estate/:id/cash-flow // Get property cash flow

// ============================================
// ACCOUNTS (Banking, Investment)
// ============================================

GET    /api/accounts                 // List all accounts
POST   /api/accounts                 // Create account manually
GET    /api/accounts/:id             // Get account details
PUT    /api/accounts/:id             // Update account
DELETE /api/accounts/:id             // Delete account
GET    /api/accounts/:id/transactions // Get account transactions
POST   /api/accounts/:id/sync        // Force account sync

// Plaid integration
POST   /api/accounts/plaid/link-token   // Create Plaid Link token
POST   /api/accounts/plaid/exchange     // Exchange public token
POST   /api/accounts/plaid/sync         // Sync all Plaid accounts
DELETE /api/accounts/plaid/:itemId     // Remove Plaid connection

// ============================================
// SECURITIES (Stocks, Bonds, ETFs)
// ============================================

GET    /api/securities               // List all securities
POST   /api/securities               // Add security position
GET    /api/securities/:id           // Get security details
PUT    /api/securities/:id           // Update security
DELETE /api/securities/:id           // Delete security
GET    /api/securities/:id/quote     // Get real-time quote
GET    /api/securities/:id/history   // Get historical prices
GET    /api/securities/:id/tax-lots  // Get tax lots for security
POST   /api/securities/:id/tax-lots  // Add tax lot
POST   /api/securities/import        // Import portfolio (CSV)

// ============================================
// LIABILITIES (Debts)
// ============================================

GET    /api/liabilities              // List all liabilities
POST   /api/liabilities              // Create liability
GET    /api/liabilities/:id          // Get liability details
PUT    /api/liabilities/:id          // Update liability
DELETE /api/liabilities/:id          // Delete liability
GET    /api/liabilities/:id/amortization // Get amortization schedule
GET    /api/liabilities/:id/payoff   // Calculate payoff scenarios

// ============================================
// TRANSACTIONS & EXPENSES
// ============================================

GET    /api/transactions             // List transactions (paginated)
POST   /api/transactions             // Create transaction
GET    /api/transactions/:id         // Get transaction details
PUT    /api/transactions/:id         // Update transaction
DELETE /api/transactions/:id         // Delete transaction
POST   /api/transactions/categorize  // AI categorization
GET    /api/transactions/trends      // Spending trends
GET    /api/transactions/search      // Search transactions

GET    /api/expenses/categories      // List expense categories
GET    /api/expenses/summary         // Expense summary by category
GET    /api/expenses/budget          // Budget vs actual

// ============================================
// INCOME STREAMS
// ============================================

GET    /api/income                   // List all income streams
POST   /api/income                   // Create income stream
GET    /api/income/:id               // Get income stream details
PUT    /api/income/:id               // Update income stream
DELETE /api/income/:id               // Delete income stream
GET    /api/income/projections       // Income projections

// ============================================
// FINANCIAL GOALS
// ============================================

GET    /api/goals                    // List all goals
POST   /api/goals                    // Create goal
GET    /api/goals/:id                // Get goal details
PUT    /api/goals/:id                // Update goal
DELETE /api/goals/:id                // Delete goal
GET    /api/goals/:id/progress       // Get goal progress
POST   /api/goals/:id/progress       // Update goal progress
GET    /api/goals/:id/projection     // Project goal achievement

// ============================================
// AI RECOMMENDATIONS
// ============================================

GET    /api/recommendations/ai       // List AI recommendations
POST   /api/recommendations/ai/generate // Generate new recommendations
GET    /api/recommendations/ai/:id   // Get recommendation details
PUT    /api/recommendations/ai/:id/status // Update status (accept/reject)
DELETE /api/recommendations/ai/:id   // Dismiss recommendation
GET    /api/recommendations/ai/history // Recommendation history

// ============================================
// ADVISOR RECOMMENDATIONS
// ============================================

GET    /api/recommendations/advisor  // List advisor recommendations
POST   /api/recommendations/advisor  // Create recommendation (advisor only)
GET    /api/recommendations/advisor/:id // Get recommendation details
PUT    /api/recommendations/advisor/:id // Update recommendation
DELETE /api/recommendations/advisor/:id // Delete recommendation
POST   /api/recommendations/advisor/:id/response // Client response

// ============================================
// PROJECTIONS & SCENARIOS
// ============================================

GET    /api/projections              // List saved projections
POST   /api/projections/generate     // Generate new projection
GET    /api/projections/:id          // Get projection details
PUT    /api/projections/:id          // Update projection
DELETE /api/projections/:id          // Delete projection
POST   /api/projections/monte-carlo  // Run Monte Carlo simulation
POST   /api/projections/what-if      // What-if scenario analysis

// ============================================
// REPORTS
// ============================================

GET    /api/reports/net-worth        // Net worth statement
GET    /api/reports/performance      // Portfolio performance report
GET    /api/reports/tax-summary      // Tax summary report
GET    /api/reports/cash-flow        // Cash flow statement
GET    /api/reports/income           // Income statement
POST   /api/reports/custom           // Generate custom report
GET    /api/reports/:id/export       // Export report (PDF/Excel)

// ============================================
// ANALYTICS & DASHBOARD
// ============================================

GET    /api/analytics/dashboard      // Dashboard summary data
GET    /api/analytics/asset-allocation // Asset allocation breakdown
GET    /api/analytics/performance    // Performance metrics
GET    /api/analytics/risk           // Risk metrics
GET    /api/analytics/net-worth-history // Net worth over time
GET    /api/analytics/income-expenses // Income vs expenses trends

// ============================================
// MARKET DATA
// ============================================

GET    /api/market/quote/:symbol     // Get real-time quote
GET    /api/market/history/:symbol   // Get historical prices
GET    /api/market/search             // Search for securities
GET    /api/market/batch-quotes      // Get multiple quotes

// ============================================
// AI ASSISTANT (Chat)
// ============================================

POST   /api/ai/chat                  // Chat with AI assistant
POST   /api/ai/analyze               // Analyze portfolio/scenario
POST   /api/ai/explain/:topic        // Explain financial concept
GET    /api/ai/insights              // Get personalized insights

// ============================================
// ADVISOR FEATURES
// ============================================

GET    /api/advisor/clients          // List all clients (advisor)
GET    /api/advisor/clients/:id      // Get client overview
POST   /api/advisor/clients/:id/notes // Add client note
GET    /api/advisor/dashboard        // Advisor dashboard data
POST   /api/advisor/clients/invite   // Invite new client

// ============================================
// DOCUMENTS
// ============================================

GET    /api/documents                // List documents
POST   /api/documents/upload         // Upload document
GET    /api/documents/:id            // Get document metadata
DELETE /api/documents/:id            // Delete document
GET    /api/documents/:id/download   // Download document
PUT    /api/documents/:id            // Update document metadata

// ============================================
// NOTIFICATIONS
// ============================================

GET    /api/notifications            // List notifications
PUT    /api/notifications/:id/read   // Mark notification as read
PUT    /api/notifications/read-all   // Mark all as read
DELETE /api/notifications/:id        // Delete notification
```

---

## AI Integration

### Architecture Overview

```typescript
// AI Service Structure
interface AIService {
  recommendations: RecommendationService;
  projections: ProjectionService;
  assistant: AssistantService;
  analysis: AnalysisService;
}

// ============================================
// 1. RECOMMENDATION SERVICE
// ============================================

class RecommendationService {
  async generateRecommendations(userId: string): Promise<Recommendation[]> {
    // 1. Gather user context
    const context = await this.buildContext(userId);

    // 2. Generate recommendations using Claude
    const recommendations = await this.callClaude(context);

    // 3. Validate and score recommendations
    const validated = await this.validate(recommendations);

    // 4. Store in database
    await this.saveRecommendations(validated);

    return validated;
  }

  private async buildContext(userId: string): Promise<FinancialContext> {
    const [user, assets, liabilities, goals, transactions, marketData] = await Promise.all([
      getUserProfile(userId),
      getAssets(userId),
      getLiabilities(userId),
      getGoals(userId),
      getRecentTransactions(userId, 90),
      getMarketConditions()
    ]);

    return {
      user,
      portfolio: await calculatePortfolio(assets, liabilities),
      goals,
      recentActivity: transactions,
      marketConditions: marketData
    };
  }

  private async callClaude(context: FinancialContext): Promise<RawRecommendation[]> {
    const prompt = this.buildPrompt(context);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.3, // Lower temp for financial advice
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    return JSON.parse(response.content[0].text);
  }
}

// ============================================
// 2. PROJECTION SERVICE
// ============================================

class ProjectionService {
  async generateProjection(
    userId: string,
    years: number,
    assumptions: ProjectionAssumptions
  ): Promise<Projection> {
    const context = await this.buildContext(userId);

    // Run Monte Carlo simulation
    const simulation = await this.runMonteCarloSimulation(
      context,
      years,
      assumptions,
      1000 // iterations
    );

    return {
      scenarios: simulation.scenarios,
      successProbability: simulation.successRate,
      medianOutcome: simulation.median,
      bestCase: simulation.p90,
      worstCase: simulation.p10
    };
  }

  private async runMonteCarloSimulation(
    context: FinancialContext,
    years: number,
    assumptions: ProjectionAssumptions,
    iterations: number
  ): Promise<SimulationResult> {
    const results: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const outcome = this.simulateSinglePath(
        context,
        years,
        assumptions
      );
      results.push(outcome.finalNetWorth);
    }

    return this.analyzeResults(results);
  }
}

// ============================================
// 3. AI ASSISTANT SERVICE
// ============================================

class AssistantService {
  async chat(
    userId: string,
    message: string,
    conversationHistory: Message[]
  ): Promise<string> {
    // 1. Build context with RAG
    const relevantContext = await this.retrieveRelevantContext(userId, message);

    // 2. Build conversation with context
    const messages = this.buildConversation(
      conversationHistory,
      relevantContext,
      message
    );

    // 3. Call Claude
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0.7, // Higher temp for conversational responses
      system: this.getSystemPrompt(),
      messages
    });

    return response.content[0].text;
  }

  private async retrieveRelevantContext(
    userId: string,
    query: string
  ): Promise<string[]> {
    // Use vector similarity search
    const embedding = await this.getEmbedding(query);
    const similarDocs = await this.vectorStore.similaritySearch(
      embedding,
      { userId, limit: 5 }
    );

    return similarDocs.map(doc => doc.content);
  }

  private getSystemPrompt(): string {
    return `You are a knowledgeable financial advisor assistant helping high-net-worth individuals with their wealth management. You have access to the user's complete financial profile including assets, liabilities, goals, and transaction history.

Guidelines:
- Provide accurate, helpful financial information
- Always include appropriate disclaimers about not being licensed financial advice
- Be concise but thorough in explanations
- Use the user's actual data when answering questions
- If you don't know something, say so
- Never recommend specific securities or make predictions about future returns
- Focus on education and general financial principles`;
  }
}

// ============================================
// 4. ANALYSIS SERVICE
// ============================================

class AnalysisService {
  async analyzePortfolio(userId: string): Promise<PortfolioAnalysis> {
    const context = await this.buildContext(userId);

    const prompt = `Analyze this investment portfolio:

Portfolio Value: $${context.portfolio.totalValue.toLocaleString()}
Asset Allocation: ${JSON.stringify(context.portfolio.allocation, null, 2)}
Age: ${context.user.age}
Risk Tolerance: ${context.user.riskTolerance}
Time Horizon: ${context.user.timeHorizon} years

Provide analysis on:
1. Asset allocation appropriateness
2. Diversification quality
3. Risk level assessment
4. Areas for improvement

Format as structured JSON.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }

  async analyzeTaxStrategy(userId: string): Promise<TaxAnalysis> {
    // Similar pattern for tax analysis
  }

  async analyzeRisk(userId: string): Promise<RiskAnalysis> {
    // Risk analysis with AI insights
  }
}
```

### Prompt Engineering Examples

```typescript
// Example: Portfolio Optimization Prompt
const portfolioOptimizationPrompt = `You are analyzing a client's investment portfolio for optimization opportunities.

Client Profile:
- Age: 45
- Net Worth: $2,500,000
- Risk Tolerance: Moderate
- Goals: Retire at 60, fund children's education

Current Portfolio:
- Cash: $100,000 (4%)
- Stocks: $1,500,000 (60%)
  - US Large Cap: 40%
  - US Small Cap: 10%
  - International: 10%
- Bonds: $700,000 (28%)
- Real Estate: $200,000 (8%)

Market Conditions:
- Stock Market: Bull market, high valuations
- Interest Rates: 5% (elevated)
- Inflation: 3%

Provide 3-5 specific, actionable recommendations to optimize this portfolio. For each:
1. Clear title (5-7 words)
2. Detailed rationale (2-3 sentences)
3. Expected impact (quantified if possible)
4. Risk level (low/medium/high)
5. Implementation steps (numbered list)

Return as JSON array matching this schema:
{
  "recommendations": [{
    "title": string,
    "type": "rebalance" | "tax_optimization" | "risk_adjustment" | "diversification",
    "description": string,
    "rationale": string,
    "expectedBenefit": string,
    "expectedCost": string,
    "riskLevel": "low" | "medium" | "high",
    "timeHorizon": "immediate" | "short" | "medium" | "long",
    "implementationSteps": string[],
    "impactScore": number (0-100),
    "confidenceScore": number (0-100)
  }]
}`;

// Example: Tax Optimization Prompt
const taxOptimizationPrompt = `Analyze tax optimization opportunities for this client.

Client Info:
- Filing Status: Married Filing Jointly
- AGI: $350,000
- Tax Bracket: 24% Federal, 6% State
- State: California

Portfolio:
- Taxable Accounts: $800,000
- Traditional IRA: $500,000
- Roth IRA: $200,000
- 401(k): $600,000

Opportunities to analyze:
1. Tax-loss harvesting opportunities
2. Roth conversion potential
3. Charitable giving strategies
4. Asset location optimization
5. Capital gains timing

Provide specific, actionable recommendations with quantified tax savings.`;
```

---

## Security Implementation

### Authentication Flow

```typescript
// NextAuth.js Configuration
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = await verifyCredentials(credentials);
        if (user) {
          return user;
        }
        return null;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
};
```

### Encryption

```typescript
// Field-level encryption for sensitive data
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte key
const ALGORITHM = 'aes-256-gcm';

export function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
}

export function decrypt(encrypted: string, iv: string, tag: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

### Rate Limiting

```typescript
// API rate limiting with Upstash Redis
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true,
});

// Usage in API route
export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }

  // Handle request...
}
```

---

## Third-Party Integrations

### Required APIs & Cost Estimates

| API | Purpose | Pricing | Monthly Est. |
|-----|---------|---------|--------------|
| **Plaid** | Bank account linking | $0.10-0.60/item/month | $30-60 (100 users) |
| **Alpha Vantage** | Stock market data | $49.99/month (500 req/day) | $50 |
| **Anthropic Claude** | AI capabilities | Usage-based (~$0.01/1K tokens) | $100-500 |
| **Zillow API** | Real estate valuations | Research required | TBD |
| **CoinGecko** | Cryptocurrency data | $129/month (Pro) | $129 |
| **Resend** | Transactional email | $20/month (50K emails) | $20 |
| **Upstash Redis** | Caching | $10/month | $10 |

**Total Estimated API Costs:** $340-770/month for MVP with 100 users

---

## Infrastructure & Deployment

### Hosting Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          Cloudflare CDN                       │
│                    (DNS, DDoS Protection, WAF)                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                      Vercel (Frontend + API)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │  API Routes  │  │  Serverless  │      │
│  │   App (SSR)  │  │   (tRPC)     │  │   Functions  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────┬───────────────────┬───────────────────┘
                      │                   │
          ┌───────────┴───────┐           │
          ▼                   ▼           ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐
│   PostgreSQL     │  │  Redis Cache │  │   S3/R2 Storage  │
│   (Supabase/     │  │   (Upstash)  │  │   (Documents)    │
│    Railway)      │  └──────────────┘  └──────────────────┘
└──────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────┐
│                    External APIs                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Plaid   │  │  Claude  │  │  Alpha   │  │  Zillow  │   │
│  │          │  │   API    │  │ Vantage  │  │   API    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://yourapp.com

# APIs
ANTHROPIC_API_KEY=...
PLAID_CLIENT_ID=...
PLAID_SECRET=...
ALPHA_VANTAGE_API_KEY=...
ZILLOW_API_KEY=...
COINGECKO_API_KEY=...

# Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...

# Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Email
RESEND_API_KEY=...

# Monitoring
SENTRY_DSN=...
POSTHOG_API_KEY=...

# Encryption
ENCRYPTION_KEY=... # 32-byte hex string
```

---

## Cost Estimates

### MVP (100 users)

| Service | Monthly Cost |
|---------|-------------|
| Vercel Pro | $20 |
| PostgreSQL (Supabase) | $25 |
| Redis (Upstash) | $10 |
| S3 Storage | $5 |
| Plaid | $30-60 |
| Market Data APIs | $50-180 |
| Claude API | $100-300 |
| Email (Resend) | $20 |
| Monitoring (Sentry) | $26 |
| **Total** | **$286-626/month** |

### Production (1,000 users)

| Service | Monthly Cost |
|---------|-------------|
| Vercel Pro | $20 |
| PostgreSQL | $100-200 |
| Redis | $40 |
| S3 Storage | $20 |
| Plaid | $300-600 |
| Market Data APIs | $200-400 |
| Claude API | $1,000-2,000 |
| Email | $40 |
| Monitoring | $100 |
| **Total** | **$1,820-3,420/month** |

### Scale (10,000 users)

| Service | Monthly Cost |
|---------|-------------|
| Vercel Enterprise | $400+ |
| PostgreSQL (dedicated) | $500-1,000 |
| Redis | $150 |
| S3 Storage | $100 |
| Plaid | $3,000-6,000 |
| Market Data APIs | $500-1,000 |
| Claude API | $10,000-20,000 |
| Email | $100 |
| Monitoring | $300 |
| **Total** | **$15,050-29,050/month** |

---

**Next Document:** [IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)
