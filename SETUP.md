# CarbonGuard - Winova Dashboard Setup Guide

## Overview
CarbonGuard is a comprehensive carbon compliance and regulatory management dashboard. The backend now dynamically feeds data from your MongoDB database to display real-time insights on the dashboard.

## Features Implemented
1. **Real-time Dashboard**: Displays live data from the database
2. **AI Agent Integration**: Upload CSV files or fetch from URLs to analyze compliance data
3. **Carbon Footprint Tracking**: Shows total emissions by department/industry
4. **Compliance Monitoring**: Displays alerts and regulatory scanner results
5. **Dynamic Stats**: Cards show user count, alerts, compliance status, and carbon footprint from database

## Setup Instructions

### Backend Setup
1. **Install Dependencies**:
   ```bash
   cd "C:\Users\acer\Desktop\final\winova"
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **MongoDB Setup**:
   - Install and start MongoDB locally, or use MongoDB Atlas
   - Default connection: `mongodb://localhost:27017`
   - Database name: `winova`

3. **Environment Variables** (optional):
   Create a `.env` file:
   ```
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=winova
   JWT_SECRET_KEY=your-secret-key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. **Start Backend**:
   ```bash
   python main.py
   ```
   Backend will run on: http://localhost:8000

### Frontend Setup
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Frontend**:
   ```bash
   npm run dev
   ```
   Frontend will run on: http://localhost:3000

## How to Use

### 1. Load Data into Dashboard
The dashboard automatically fetches data from MongoDB. To populate data:

**Option A: Use AI Agent**
1. Go to AI Agent page
2. Upload the provided `sample_data.csv` file or enter a URL
3. Click "Analyze" - this stores results in MongoDB
4. Return to Dashboard to see updated data

**Option B: Use Sample Data**
Upload `sample_data.csv` via the AI Agent with columns:
- Country/Region
- Industry  
- Compliance Level
- Emission Limit (tons CO2/year)
- Last Updated

### 2. Dashboard Features

**StatCards** (Top Row):
- **Current Emissions**: Total CO2 from all industries
- **Compliance Risk Score**: Calculated based on data and alerts
- **Regulatory Scanner**: Shows system status
- **System Status**: Number of records loaded

**Bar Chart** (Bottom Left):
- Shows emissions by department/industry
- Click bars for details
- Hover for tooltips

**Compliance Table** (Bottom Right):
- **Upcoming Deadlines**: Shows regulations and due dates
- **Recent Activity**: Shows system activity logs
- Toggle between tabs

### 3. Backend Endpoints

#### Dashboard Data Endpoints:
- `GET /dashboard` - Main dashboard stats
- `GET /dashboard/data` - Formatted data for frontend components
- `GET /compliance-alerts` - Alert information
- `GET /carbon-analysis` - Carbon footprint analysis
- `GET /regulatory-scanner` - Regulatory compliance status

#### AI Agent Endpoints:
- `POST /ai-agent/analyze` - Upload file or URL for analysis
- `GET /ai-agent/latest` - Get latest analysis results
- `GET /ai-agent/analysis` - Get detailed analysis

#### Analysis Endpoints:
- `POST /cost-benefit-analysis/analyze` - Cost-benefit analysis
- `POST /compliance-risk-calculator/analyze` - Compliance risk analysis

### 4. Data Flow
1. **Data Input**: Upload via AI Agent or other analysis tools
2. **Processing**: Backend processes and stores in MongoDB collections:
   - `ai_agent_results` - Analysis results
   - `regulatory_scanner_results` - Scanner data
   - `users` - User accounts
   - `user_settings` - User preferences
3. **Dashboard Display**: Frontend fetches processed data and displays visually

### 5. Collections in MongoDB
- `ai_agent_results`: Stores analysis from uploaded files/URLs
- `regulatory_scanner_results`: Stores regulatory scanning results
- `users`: User account information
- `user_settings`: User preferences and settings
- `analyses`: General analysis data
- `compliance_data`: Compliance-specific data
- `carbon_data`: Carbon footprint data
- `regulatory_data`: Regulatory information

## Troubleshooting
1. **No Data Showing**: Upload data via AI Agent first
2. **MongoDB Connection**: Ensure MongoDB is running on port 27017
3. **CORS Issues**: Backend allows localhost:3000 by default
4. **Loading States**: Dashboard shows loading spinners while fetching data

## Next Steps
- Upload your actual compliance data via the AI Agent
- Set up MongoDB with your production data
- Configure email notifications
- Customize alert thresholds based on your requirements
