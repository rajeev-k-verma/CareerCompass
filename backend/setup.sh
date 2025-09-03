#!/bin/bash

# Career Compass AI - Express.js Backend Setup Script
# This script sets up the new Express.js backend

echo "🚀 Setting up Career Compass AI Express.js Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL first."
    echo "On Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "On macOS: brew install postgresql"
    exit 1
fi

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "⚠️  Redis not found. Please install Redis first."
    echo "On Ubuntu/Debian: sudo apt install redis-server"
    echo "On macOS: brew install redis"
fi

# Navigate to backend directory
cd express-backend

echo "📦 Installing dependencies..."
npm install

# Create logs directory
mkdir -p logs

# Create uploads directory
mkdir -p uploads

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "✅ Environment file created. Please update .env with your configuration."
else
    echo "✅ Environment file already exists."
fi

# Create database
echo "🗄️  Setting up database..."
read -p "Enter PostgreSQL username (default: postgres): " db_user
db_user=${db_user:-postgres}

read -p "Enter database name (default: resume_analyser): " db_name
db_name=${db_name:-resume_analyser}

# Create database if it doesn't exist
psql -U $db_user -tc "SELECT 1 FROM pg_database WHERE datname = '$db_name'" | grep -q 1 || psql -U $db_user -c "CREATE DATABASE $db_name"

if [ $? -eq 0 ]; then
    echo "✅ Database '$db_name' created/verified successfully."
else
    echo "❌ Failed to create database. Please create it manually:"
    echo "   createdb -U $db_user $db_name"
fi

echo "🔑 Generating JWT secrets..."
# Generate random JWT secrets
jwt_secret=$(openssl rand -base64 32)
jwt_refresh_secret=$(openssl rand -base64 32)
session_secret=$(openssl rand -base64 32)

# Update .env file with generated secrets
sed -i.bak "s/JWT_SECRET=.*/JWT_SECRET=$jwt_secret/" .env
sed -i.bak "s/JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$jwt_refresh_secret/" .env
sed -i.bak "s/SESSION_SECRET=.*/SESSION_SECRET=$session_secret/" .env
sed -i.bak "s/DB_USER=.*/DB_USER=$db_user/" .env
sed -i.bak "s/DB_NAME=.*/DB_NAME=$db_name/" .env

# Remove backup file
rm .env.bak

echo "🛠️  Building TypeScript..."
npm run build

echo "🧪 Running tests..."
npm test

echo "🌟 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your specific configuration:"
echo "   - Database password (DB_PASSWORD)"
echo "   - AI API keys (GEMINI_API_KEY)"
echo "   - Email settings (EMAIL_USER, EMAIL_PASS)"
echo ""
echo "2. Run database migrations:"
echo "   npm run db:migrate"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. API will be available at: http://localhost:8000"
echo "5. Health check: http://localhost:8000/health"
echo ""
echo "📚 Documentation:"
echo "   - Migration Guide: ../EXPRESS_MIGRATION_GUIDE.md"
echo "   - API Docs: http://localhost:8000/api/docs (when running)"
echo ""
echo "🎉 Happy coding!"
