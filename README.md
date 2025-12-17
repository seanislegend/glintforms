# Glint - An AI-assisted survey platform

> Data points that shine, insights that catch the eye

Glint is a survey platform that empowers teams to design, deploy, and analyse surveys using AI-powered question generation, theme analysis, and authenticity detection.

## 🚀 Features

### Survey builder
- **Question types**: Text, number, single select, and multi-select questions
- **Question settings**: Required fields, option randomisation, custom "other" options
- **Validation rules**: Min/max length, email, URL, and selection limits
- **AI question generation**: Generate survey questions from topic and description
- **Import questions**: Import from CSV, JSON, or XLSForm formats
- **Export questions**: Export to CSV, JSON, Excel, or XLSForm formats
- **Survey statuses**: Draft, testing, active, complete, and archived states

### Campaign & respondent management
- **Campaigns**: Organise surveys into campaigns for better project management
- **Cohorts**: Group respondents into cohorts for segmentation and analysis
- **Respondent profiles**: Track respondent details including name, email, location, and metadata
- **Cohort assignment**: Assign respondents to multiple cohorts with tracking

### Response collection & settings
- **Anonymous responses**: Allow or require respondent identification
- **Password protection**: Secure surveys with password access
- **Response limits**: Set maximum response counts with automatic closure
- **Custom closed text**: Display custom messages when surveys are closed
- **Response tracking**: Monitor completion status, timestamps, and geolocation

### AI analytics & insights
- **Theme analysis**: AI-powered semantic clustering of text responses with sentiment analysis
- **Authenticity detection**: Automated verification of response authenticity with scoring
- **Authenticity overrides**: Manual review and override of authenticity scores
- **Response insights**: Visual dashboards with charts and response overviews
- **Question-level analytics**: View answers grouped by question with theme associations

### Data export & integration
- **Response exports**: Export responses in CSV, JSON, or Excel formats
- **Field selection**: Choose specific fields to include in exports
- **Answer formatting**: Customise how multi-select answers are formatted
- **Filter application**: Apply active filters to exported data
- **API access**: RESTful API for programmatic survey and response access

## 🛠 Tech stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript 5
- **API**: TRPC for type-safe APIs, REST API for external access
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Authentication**: Better Auth with magic links via Resend
- **State Management**: Jotai
- **Forms**: React Hook Form with Zod validation
- **Background Jobs**: Trigger.dev for async processing
- **AI**: OpenAI SDK for question generation, theme analysis, and authenticity detection
- **URL State**: nuqs for URL-based state management
- **Monorepo**: Turborepo with Bun package manager
- **Linting & Formatting**: Biome

## 📦 Project structure

```
glint/
├── apps/
│   ├── admin/              # Next.js admin application (TRPC, React)
│   └── api/                # REST API server
├── packages/
│   ├── authenticity/      # Authenticity scoring and analysis
│   ├── database/           # Database schema, migrations, and connection
│   ├── encryption/         # Encryption utilities
│   ├── form/               # Form components and validation
│   ├── jobs/               # Background job tasks (Trigger.dev)
│   ├── schemas/            # Shared validation schemas (Zod)
│   ├── tsconfig/           # Shared TypeScript configurations
│   ├── ui/                 # Shared UI components
│   └── utils/              # Utility functions
├── package.json            # Root package.json
└── turbo.json             # Turborepo configuration
```

## 🚀 Getting started

### Prerequisites

- Node.js 20+ 
- bun 1.1.25+
- PostgreSQL database (via Supabase)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd glintforms
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   
   Copy environment example files for each app:
   ```bash
   cp apps/admin/env.example apps/admin/.env.local
   cp apps/api/env.example apps/api/.env.local
   cp packages/jobs/env.example packages/jobs/.env.local
   ```
   
   Update each `.env.local` file with your actual values.

4. **Set up the database**
   ```bash
   # Generate database schema
   bun run db:generate
   
   # Run migrations
   bun run db:migrate
   
   # Seed with initial data
   bun run db:seed
   ```

5. **Start the development server**
   ```bash
   bun run dev
   ```

   The application will be available at `http://localhost:3000`

### Development commands

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Run linting
bun run lint

# Type checking
bun run type-check

# Database operations
bun run db:generate    # Generate new migrations
bun run db:migrate     # Run migrations
bun run db:seed        # Seed database
bun run db:studio      # Open Drizzle Studio
```

## 🎯 Target users

### Research teams
- Need rapid survey deployment and AI-powered insights
- Integration with existing tools and platforms
- Automated analysis and reporting capabilities

### Data analysts
- Require intelligent data processing and visualisation
- AI-assisted pattern recognition and bias detection
- Flexible export and integration options

### Product managers
- Need quick feedback collection and analysis
- Real-time insights and automated reporting
- Campaign organisation and respondent segmentation

## 📈 Key benefits

- **AI-powered insights**: Automated theme analysis and authenticity detection for faster data understanding
- **Flexible question types**: Support for text, numeric, and multiple choice questions with custom validation
- **Data portability**: Import and export in multiple formats (CSV, JSON, Excel, XLSForm) for easy integration
- **Respondent management**: Organise respondents into cohorts for targeted analysis and segmentation
- **Multi-tenant architecture**: Secure tenant isolation for organisations and teams
- **Background processing**: Asynchronous job processing for theme generation and authenticity scoring

## 🔒 Security & data protection

- **Multi-tenancy**: Tenant isolation for data separation
- **Password protection**: Optional password-protected surveys
- **Access controls**: User authentication with Better Auth
- **Activity tracking**: Complete audit logging of survey activities
- **Data privacy**: Anonymous response options and metadata controls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT licence - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, raise an issue on GitHub.