from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
from typing import Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import json
import time
import csv
from fastapi import FastAPI, Query
from pymongo import MongoClient
from datetime import datetime

load_dotenv()

# MongoDB configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "winova")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-change-this-in-production")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# SMTP configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "your-email@gmail.com")
SMTP_PASS = os.getenv("SMTP_PASS", "your-app-password")

# MongoDB setup
client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]
users_collection = db.users
settings_collection = db.user_settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

app = FastAPI(title="Winova API", version="1.0.0")

# --- Cost-Benefit Analysis Endpoint ---
@app.post("/cost-benefit-analysis/analyze")
async def analyze_cost_benefit(file: UploadFile = File(...)):
    import io
    import pandas as pd
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))
    required_cols = {"company", "strategy", "cost", "projected_savings", "waste_reduction"}
    if not required_cols.issubset(df.columns):
        raise HTTPException(status_code=400, detail=f"CSV must contain columns: {', '.join(required_cols)}")
    results = []
    companies = df['company'].unique().tolist()
    for company in companies:
        company_df = df[df['company'] == company]
        options = []
        for _, row in company_df.iterrows():
            roi = (row['projected_savings'] - row['cost']) / row['cost'] * 100 if row['cost'] else 0
            options.append({
                "strategy": row['strategy'],
                "cost": row['cost'],
                "savings": row['projected_savings'],
                "waste_reduction": row['waste_reduction'],
                "roi": round(roi, 2)
            })
        sorted_options = sorted(options, key=lambda x: x['roi'], reverse=True)
        top = sorted_options[0] if sorted_options else {}
        company_data = {
            "initialCost": f"${top['cost']:,}" if top else "",
            "annualSavings": f"${top['savings']:,}" if top else "",
            "roi": f"{top['roi']}%" if top else "",
            "paybackPeriod": "",  # Add if available in CSV
            "implementationTime": ""  # Add if available in CSV
        }
        results.append({
            "company": company,
            "companyData": company_data,
            "roiRankings": sorted_options,
            "strategies": sorted_options,
            "recommendations": [
                f"Best strategy: {top['strategy']}" if top else "No strategies found."
            ] if top else [],
        })
    # Return companies list for dropdown
    return {"results": results, "companies": companies}

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None

class SettingsUpdate(BaseModel):
    theme: Optional[str] = None  # 'dark', 'light', 'auto'
    notifications: Optional[bool] = None
    language: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Password utilities
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# JWT utilities
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
    
    # Convert ObjectId to string for JSON serialization
    user["id"] = str(user["_id"])
    return user

# Email utility

def send_email(to_email, subject, body):
    msg = MIMEMultipart()
    msg["From"] = SMTP_USER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, to_email, msg.as_string())
    except Exception as e:
        print(f"Error sending email: {e}")

# API Endpoints
@app.post("/register", response_model=UserResponse)
def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user_doc = {
        "email": user_data.email,
        "full_name": user_data.full_name,
        "hashed_password": hashed_password,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = users_collection.insert_one(user_doc)
    user_doc["id"] = str(result.inserted_id)
    
    # Create default settings
    settings_doc = {
        "user_id": str(result.inserted_id),
        "theme": "dark",
        "notifications": True,
        "language": "en"
    }
    settings_collection.insert_one(settings_doc)
    
    # Send welcome email if notifications enabled
    if settings_doc["notifications"]:
        send_email(
            user_data.email,
            "Welcome to Winova!",
            f"Hello {user_data.full_name or user_data.email},\n\nWelcome to Winova! Your account has been created successfully.\n\nBest regards,\nWinova Team"
        )
    
    return user_doc

@app.post("/login", response_model=Token)
def login(user_data: UserLogin):
    # Find user
    user = users_collection.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    
    # Convert ObjectId to string for JSON serialization
    user["id"] = str(user["_id"])
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/profile", response_model=UserResponse)
def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user

@app.put("/profile", response_model=UserResponse)
def update_profile(
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    # Update user data
    update_data = {"updated_at": datetime.utcnow()}
    
    if user_data.full_name is not None:
        update_data["full_name"] = user_data.full_name
    if user_data.email is not None:
        # Check if email is already taken
        existing_user = users_collection.find_one({
            "email": user_data.email, 
            "_id": {"$ne": ObjectId(current_user["id"])}
        })
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already taken")
        update_data["email"] = user_data.email
    
    users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": update_data}
    )
    
    # Get updated user
    updated_user = users_collection.find_one({"_id": ObjectId(current_user["id"])})
    updated_user["id"] = str(updated_user["_id"])
    
    return updated_user

@app.get("/settings")
def get_settings(current_user: dict = Depends(get_current_user)):
    settings = settings_collection.find_one({"user_id": current_user["id"]})
    if not settings:
        # Create default settings
        settings_doc = {
            "user_id": current_user["id"],
            "theme": "dark",
            "notifications": True,
            "language": "en"
        }
        settings_collection.insert_one(settings_doc)
        settings = settings_doc
    
    return {
        "theme": settings.get("theme", "dark"),
        "notifications": settings.get("notifications", True),
        "language": settings.get("language", "en")
    }

@app.put("/settings")
def update_settings(
    settings_data: SettingsUpdate,
    current_user: dict = Depends(get_current_user)
):
    update_data = {}
    
    if settings_data.theme is not None:
        update_data["theme"] = settings_data.theme
    if settings_data.notifications is not None:
        update_data["notifications"] = settings_data.notifications
    if settings_data.language is not None:
        update_data["language"] = settings_data.language
    
    if update_data:
        settings_collection.update_one(
            {"user_id": current_user["id"]},
            {"$set": update_data},
            upsert=True
        )
        # If notifications enabled and email changed, send notification
        if update_data.get("notifications"):
            user = users_collection.find_one({"_id": ObjectId(current_user["id"])})
            send_email(
                user["email"],
                "Winova Notification Enabled",
                f"Hello {user.get('full_name', user['email'])},\n\nEmail notifications have been enabled for your account.\n\nBest regards,\nWinova Team"
            )
    
    # Get updated settings
    settings = settings_collection.find_one({"user_id": current_user["id"]})
    
    return {
        "theme": settings.get("theme", "dark"),
        "notifications": settings.get("notifications", True),
        "language": settings.get("language", "en")
    }

import io
import pandas as pd
from fastapi import UploadFile, File
from fastapi.responses import JSONResponse, StreamingResponse

# Collections for storing analysis data
analyses_collection = db.analyses
compliance_data_collection = db.compliance_data
carbon_data_collection = db.carbon_data
regulatory_data_collection = db.regulatory_data

# Dashboard endpoints

@app.post("/cost-benefit-analysis/analyze")
async def analyze_compliance(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))
    required_cols = {"company_name", "compliance_cost", "penalty_cost"}
    if not required_cols.issubset(df.columns):
        raise HTTPException(status_code=400, detail=f"CSV must contain columns: {', '.join(required_cols)}")

    # --- Existing company risk logic ---
    def calculate_risk(company_name, compliance_cost, penalty_cost):
        savings = penalty_cost - compliance_cost
        decision = "Fix Compliance Issue" if compliance_cost < penalty_cost else "Accept Penalty"
        return {
            "company": company_name,
            "compliance_cost": compliance_cost,
            "penalty_cost": penalty_cost,
            "savings_if_fixed": savings,
            "recommended_action": decision
        }
    def prioritize_by_impact(risks):
        return sorted(risks, key=lambda x: x['savings_if_fixed'], reverse=True)
    risk_reports = [
        calculate_risk(row['company_name'], row['compliance_cost'], row['penalty_cost'])
        for _, row in df.iterrows()
    ]
    prioritized = prioritize_by_impact(risk_reports)

    return JSONResponse(content={
        "results": prioritized
    })

@app.post("/compliance-risk-calculator/download")
async def download_compliance_report(file: UploadFile = File(...)):
    content = await file.read()
    df = pd.read_csv(io.BytesIO(content))
    required_cols = {"company_name", "compliance_cost", "penalty_cost"}
    if not required_cols.issubset(df.columns):
        raise HTTPException(status_code=400, detail=f"CSV must contain columns: {', '.join(required_cols)}")
    def calculate_risk(company_name, compliance_cost, penalty_cost):
        savings = penalty_cost - compliance_cost
        decision = "Fix Compliance Issue" if compliance_cost < penalty_cost else "Accept Penalty"
        return {
            "company": company_name,
            "compliance_cost": compliance_cost,
            "penalty_cost": penalty_cost,
            "savings_if_fixed": savings,
            "recommended_action": decision
        }
    def prioritize_by_impact(risks):
        return sorted(risks, key=lambda x: x['savings_if_fixed'], reverse=True)
    risk_reports = [
        calculate_risk(row['company_name'], row['compliance_cost'], row['penalty_cost'])
        for _, row in df.iterrows()
    ]
    prioritized = prioritize_by_impact(risk_reports)
    result_df = pd.DataFrame(prioritized)
    stream = io.StringIO()
    result_df.to_csv(stream, index=False)
    response = StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = "attachment; filename=compliance_risk_output.csv"
    return response
@app.get("/dashboard")
def dashboard():
    try:
        # Get latest AI agent analysis data
        latest_doc = db.ai_agent_results.find_one(sort=[("timestamp", -1)])
        
        # Calculate stats based on stored data
        total_users = users_collection.count_documents({})
        total_alerts = 0
        carbon_footprint = 0
        compliance_status = "No Data"
        
        if latest_doc and latest_doc.get("summary"):
            # Count alerts
            total_alerts = len(latest_doc.get("alerts", []))
            
            # Calculate total carbon footprint
            for item in latest_doc["summary"]:
                emission_limit = item.get("emission_limit_tons_per_year")
                try:
                    carbon_footprint += float(emission_limit or 0)
                except (ValueError, TypeError):
                    pass
            
            # Determine compliance status based on alerts
            if total_alerts == 0:
                compliance_status = "Good"
            elif total_alerts <= 2:
                compliance_status = "Fair"
            else:
                compliance_status = "Poor"
        
        return {
            "summary": "Dashboard data from database",
            "stats": {
                "users": total_users,
                "alerts": total_alerts,
                "compliance": compliance_status,
                "carbon_footprint": round(carbon_footprint)
            }
        }
    except Exception as e:
        print(f"Dashboard error: {e}")
        # Fallback to default values
        return {
            "summary": "Dashboard data (fallback)",
            "stats": {
                "users": users_collection.count_documents({}),
                "alerts": 0,
                "compliance": "Unknown",
                "carbon_footprint": 0
            }
        }

@app.get("/compliance-alerts")
def compliance_alerts():
    try:
        # Get latest AI agent results for alerts
        latest_doc = db.ai_agent_results.find_one(sort=[("timestamp", -1)])
        
        alerts = []
        if latest_doc and latest_doc.get("alerts"):
            for idx, alert in enumerate(latest_doc["alerts"]):
                # Map urgency to level
                urgency = alert.get("urgency", "Low").lower()
                if "high" in urgency:
                    level = "High"
                elif "medium" in urgency:
                    level = "Medium"
                else:
                    level = "Low"
                
                alerts.append({
                    "id": idx + 1,
                    "level": level,
                    "message": alert.get("message", "Alert message"),
                    "date": alert.get("timestamp", datetime.utcnow()).strftime("%Y-%m-%d") if isinstance(alert.get("timestamp"), datetime) else str(alert.get("timestamp", ""))[:10]
                })
        
        # If no alerts from database, provide default fallback
        if not alerts:
            alerts = [
                {"id": 1, "level": "Low", "message": "No compliance alerts at this time", "date": datetime.utcnow().strftime("%Y-%m-%d")}
            ]
        
        return {"alerts": alerts}
    
    except Exception as e:
        print(f"Compliance alerts error: {e}")
        # Fallback to default alerts
        return {
            "alerts": [
                {"id": 1, "level": "Low", "message": "System monitoring active", "date": datetime.utcnow().strftime("%Y-%m-%d")}
            ]
        }

@app.get("/carbon-analysis")
def carbon_analysis():
    try:
        # Get latest AI agent analysis data
        latest_doc = db.ai_agent_results.find_one(sort=[("timestamp", -1)])
        
        total_emissions = 0
        trend = "N/A"
        recommendation = "No data available"
        monthly_data = []
        
        if latest_doc and latest_doc.get("summary"):
            # Calculate total emissions
            for item in latest_doc["summary"]:
                emission_limit = item.get("emission_limit_tons_per_year")
                try:
                    total_emissions += float(emission_limit or 0)
                except (ValueError, TypeError):
                    pass
            
            # Create trend analysis based on alerts
            alerts_count = len(latest_doc.get("alerts", []))
            if alerts_count == 0:
                trend = "stable"
                recommendation = "Continue current monitoring strategy"
            elif alerts_count <= 2:
                trend = "increasing"
                recommendation = "Monitor closely and consider additional measures"
            else:
                trend = "concerning"
                recommendation = "Immediate action required to reduce emissions"
            
            # Generate monthly data (simplified for demonstration)
            import calendar
            current_month = datetime.utcnow().month
            base_emissions = total_emissions / 12 if total_emissions > 0 else 1000
            
            for i in range(3):  # Last 3 months
                month_num = (current_month - 2 + i) % 12 + 1
                month_name = calendar.month_abbr[month_num]
                # Simulate variation
                variation = 1.0 - (i * 0.02)  # Slight decrease over time
                emissions = int(base_emissions * variation)
                monthly_data.append({
                    "month": month_name,
                    "emissions": emissions
                })
        
        return {
            "analysis": {
                "total_emissions": round(total_emissions),
                "trend": trend,
                "recommendation": recommendation,
                "monthly_data": monthly_data if monthly_data else [
                    {"month": "Jan", "emissions": 0},
                    {"month": "Feb", "emissions": 0},
                    {"month": "Mar", "emissions": 0}
                ]
            }
        }
    
    except Exception as e:
        print(f"Carbon analysis error: {e}")
        # Fallback to default values
        return {
            "analysis": {
                "total_emissions": 0,
                "trend": "unknown",
                "recommendation": "Unable to analyze data",
                "monthly_data": [
                    {"month": "Jan", "emissions": 0},
                    {"month": "Feb", "emissions": 0},
                    {"month": "Mar", "emissions": 0}
                ]
            }
        }

@app.get("/regulatory-scanner")
def regulatory_scanner():
    try:
        # Get latest AI agent results and regulatory scanner results
        latest_doc = db.ai_agent_results.find_one(sort=[("timestamp", -1)])
        scanner_results = db.regulatory_scanner_results.find_one(sort=[("timestamp", -1)])
        
        regulations = []
        
        if latest_doc and latest_doc.get("summary"):
            # Create regulations based on stored data
            countries_seen = set()
            for idx, item in enumerate(latest_doc["summary"]):
                country = item.get("country")
                if country and country not in countries_seen:
                    countries_seen.add(country)
                    
                    # Determine status based on compliance level and alerts
                    compliance_level = item.get("compliance_level", "")
                    alerts = latest_doc.get("alerts", [])
                    country_alerts = [a for a in alerts if country in a.get("message", "")]
                    
                    if len(country_alerts) == 0:
                        status = "Compliant"
                    elif len(country_alerts) <= 1:
                        status = "Under Review"
                    else:
                        status = "Non-Compliant"
                    
                    # Generate next review date (simulate)
                    import datetime
                    next_review_date = datetime.datetime.utcnow() + datetime.timedelta(days=30 + (idx * 15))
                    
                    regulations.append({
                        "id": idx + 1,
                        "name": f"{country} Environmental Standards",
                        "status": status,
                        "next_review": next_review_date.strftime("%Y-%m-%d")
                    })
        
        # If no data from database, provide defaults
        if not regulations:
            regulations = [
                {"id": 1, "name": "General Compliance Framework", "status": "Active", "next_review": (datetime.utcnow() + timedelta(days=30)).strftime("%Y-%m-%d")},
                {"id": 2, "name": "Carbon Reporting Standards", "status": "Under Review", "next_review": (datetime.utcnow() + timedelta(days=45)).strftime("%Y-%m-%d")}
            ]
        
        return {"regulations": regulations}
    
    except Exception as e:
        print(f"Regulatory scanner error: {e}")
        # Fallback to default regulations
        return {
            "regulations": [
                {"id": 1, "name": "System Monitoring", "status": "Active", "next_review": datetime.utcnow().strftime("%Y-%m-%d")}
            ]
        }

@app.post("/ai-agent/analyze")
async def ai_agent_analyze(file: UploadFile = File(None), url: str = Form(None)):
    """
    Accepts a file upload (CSV/JSON) or a URL, runs the AI agent logic, stores results in MongoDB, and returns the processed data.
    """
    # Step 1: Fetch data
    records = []
    source = None
    if file:
        content = await file.read()
        try:
            # Try to parse as JSON
            records = json.loads(content)
            source = "file-json"
        except Exception:
            # Fallback: try CSV (World Bank format)
            import pandas as pd
            import io
            df = pd.read_csv(io.BytesIO(content))
            # Convert DataFrame to list of dicts
            records = df.to_dict(orient="records")
            source = "file-csv"
    elif url:
        response = requests.get(url)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Unable to fetch data from URL: {url}")
        try:
            data = response.json()
            # World Bank API returns a list, second element is data
            if isinstance(data, list) and len(data) > 1:
                records = data[1][:5]
            else:
                records = data
            source = "url-json"
        except Exception:
            # Try CSV
            import pandas as pd
            import io
            df = pd.read_csv(io.StringIO(response.text))
            records = df.to_dict(orient="records")
            source = "url-csv"
    else:
        raise HTTPException(status_code=400, detail="No file or URL provided.")

    # Step 2: AI Agent Logic (extract, summarize, determine relevance/urgency)
    summary = []
    alerts = []
    for record in records:
        country = record.get("Country/Region")
        industry = record.get("Industry")
        compliance = record.get("Compliance Level")
        emission_limit = record.get("Emission Limit (tons CO2/year)")
        last_updated = record.get("Last Updated")
        summary.append({
            "country": country,
            "industry": industry,
            "compliance_level": compliance,
            "emission_limit_tons_per_year": emission_limit,
            "last_updated": last_updated
        })
        # Always generate an alert if compliance level is present
        if compliance and str(compliance).strip():
            alerts.append({
                "type": "Compliance Alert",
                "message": f"{industry} in {country} ({last_updated}): Compliance level is {compliance}.",
                "urgency": str(compliance).strip().capitalize(),
                "timestamp": datetime.utcnow()
            })

    # Step 3: Store in MongoDB
    result_doc = {
        "source": source,
        "raw_records": records,
        "summary": summary,
        "alerts": alerts,
        "timestamp": datetime.utcnow()
    }
    result_id = db.ai_agent_results.insert_one(result_doc).inserted_id

    # Step 4: Return processed data and MongoDB ID
    return {
        "_id": str(result_id),
        "summary": summary,
        "alerts": alerts,
        "raw_records": records
    }

@app.post("/ai-agent/save")
async def ai_agent_save(
    payload: dict = Body(...)
):
    """
    Save summary and alerts to regulatory_scanner_results collection.
    """
    summary = payload.get("summary", [])
    alerts = payload.get("alerts", [])
    doc = {
        "summary": summary,
        "alerts": alerts,
        "timestamp": datetime.utcnow()
    }
    result_id = db.regulatory_scanner_results.insert_one(doc).inserted_id
    return {"message": "Saved successfully", "_id": str(result_id)}

@app.get("/ai-agent/latest")
def get_latest_ai_agent_result():
    doc = db.ai_agent_results.find_one(sort=[("timestamp", -1)])
    if not doc:
        return {"summary": [], "alerts": [], "raw_records": []}
    doc["_id"] = str(doc["_id"])
    return doc



# New endpoint to provide data for frontend dashboard components
@app.get("/dashboard/data")
def get_dashboard_data():
    """
    Returns formatted data for frontend dashboard components (StatCards, BarChart, ComplianceTable)
    """
    try:
        latest_doc = db.ai_agent_results.find_one(sort=[("timestamp", -1)])
        
        if not latest_doc or not latest_doc.get("summary"):
            return {
                "data": [],
                "message": "No data available. Please upload data through the AI Agent or Regulatory Scanner."
            }
        
        # Format data for frontend components
        formatted_data = []
        for item in latest_doc["summary"]:
            industry_name = item.get("industry", "Unknown")
            emissions_value = str(item.get("emission_limit_tons_per_year", 0))
            compliance_value = item.get("compliance_level", "Unknown")
            
            formatted_item = {
                "Industry": industry_name,
                "Emissions": emissions_value,
                "Country": item.get("country", "Unknown"),
                "Compliance": compliance_value,
                "Status": compliance_value.capitalize() if compliance_value else "Unknown",
                "Due": item.get("last_updated", ""),
                "Regulation": f"{item.get('country', 'General')} Standards",
                # Use different key names to avoid duplicates
                "industry_name": industry_name,
                "emissions_amount": emissions_value,
                "compliance_status": compliance_value
            }
            formatted_data.append(formatted_item)
        
        return {
            "data": formatted_data,
            "message": f"Loaded {len(formatted_data)} records from database",
            "last_updated": latest_doc.get("timestamp", datetime.utcnow()).isoformat() if isinstance(latest_doc.get("timestamp"), datetime) else str(latest_doc.get("timestamp", ""))
        }
    
    except Exception as e:
        print(f"Dashboard data error: {e}")
        return {
            "data": [],
            "message": "Error retrieving data from database"
        }

@app.get("/ai-agent/analysis")
def get_ai_agent_analysis():
    doc = db.ai_agent_results.find_one(sort=[("timestamp", -1)])
    if not doc or not doc.get("summary"):
        return {
            "total_emissions": 0,
            "emissions_by_industry": {},
            "emissions_trend": "N/A",
            "emissions_by_year": {},
            "percent_change": None
        }
    summary = doc["summary"]
    # Total emissions
    total_emissions = 0
    emissions_by_industry = {}
    emissions_by_year = {}
    for row in summary:
        val = row.get("emission_limit_tons_per_year")
        try:
            val = float(val)
        except Exception:
            val = 0
        total_emissions += val
        industry = row.get("industry") or "Unknown"
        emissions_by_industry[industry] = emissions_by_industry.get(industry, 0) + val
        year = str(row.get("last_updated") or "Unknown")
        emissions_by_year[year] = emissions_by_year.get(year, 0) + val
    # Trend and percent change
    sorted_years = sorted(emissions_by_year.keys())
    percent_change = None
    emissions_trend = "N/A"
    if len(sorted_years) > 1:
        first = emissions_by_year[sorted_years[0]]
        last = emissions_by_year[sorted_years[-1]]
        if first != 0:
            percent_change = ((last - first) / first) * 100
        if last > first:
            emissions_trend = "increasing"
        elif last < first:
            emissions_trend = "decreasing"
        else:
            emissions_trend = "stable"
    return {
        "total_emissions": total_emissions,
        "emissions_by_industry": emissions_by_industry,
        "emissions_trend": emissions_trend,
        "emissions_by_year": emissions_by_year,
        "percent_change": percent_change
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 