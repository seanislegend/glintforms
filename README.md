# Glint - AI-powered research platform

> Data points that shine, insights that catch the eye

Glint is a modern platform that empowers research teams to design, deploy and analyse surveys using AI-assisted tools, multi-channel collection, and intelligent analytics.

## 🚀 Features

### AI-powered survey builder
- **Intelligent question generation**: AI chat interface for creating surveys
- **Smart logic branching**: Automated conditional flows
- **Import/export**: CSV, JSON support for data flexibility, including XLSForm
- **Advanced filtering**: Custom criteria and targeting options

### Multi-channel distribution
- **Shareable links & QR codes**: Track engagement across channels
- **Interviewer network**: Human-in-the-loop interview management
- **Source tracking**: Monitor response origins and effectiveness

### AI analytics & insights
- **Automated analysis**: Sentiment analysis and topic clustering
- **Intelligent coding**: AI-powered response categorisation
- **Authenticity detection**: Automated authenticity verification in responses
- **Interactive dashboards**: Real-time insights and visualisations

### Integrations & automation
- **Webhook system**: Connect to external tools and platforms
- **API management**: Secure key management and access control
- **Event triggers**: Automated workflows on survey completion
- **Data export**: Flexible data delivery options

## 🛠 Tech stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5, TRPC
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Authentication**: Better Auth with magic links via Resend
- **State Management**: Jotai
- **Forms**: React Hook Form with Zod validation
- **Background Jobs**: Trigger.dev
- **URL State**: nuqs
- **Monorepo**: Turborepo

## 📦 Project structure

```
glint/
├── apps/
│   ├── admin/              # Next.js admin application
│   └── api/                # API server
├── packages/
│   ├── database/           # Database schema and connection
│   ├── encryption/         # Encryption utilities
│   ├── ui/                 # Shared UI components
│   ├── form/               # Form components and validation
│   ├── schemas/            # Shared validation schemas
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
   cd glint
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your actual values.

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
- Multi-channel distribution capabilities

## 📈 Key benefits

- **Faster insights**: AI-powered analysis reduces time from weeks to hours
- **Higher engagement**: Intelligent survey design improves completion rates
- **Better data quality**: Automated validation and bias detection
- **Seamless integration**: Connect with existing tools and workflows
- **Scalable platform**: Handle research projects of any size

## 🔒 Security & data protection

- **Data encryption**: End-to-end encryption for all data
- **Access controls**: Role-based permissions and API key management
- **Audit logging**: Complete activity tracking and monitoring
- **Spam protection**: Advanced bot detection and rate limiting
- **Data privacy**: Built-in privacy controls and data management

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