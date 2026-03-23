"""
TalentIQ — Dataset Generator
Generates 6 CSV files totalling 6,100+ rows of realistic HR data.
Run: python3 generate_datasets.py
"""
import random, csv, os
from datetime import datetime, timedelta

random.seed(42)
OUTPUT_DIR = "data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ── Lookup tables ──────────────────────────────────────────────────────────────
FIRST_NAMES = ["James","Mary","John","Patricia","Robert","Jennifer","Michael","Linda",
    "William","Barbara","David","Susan","Richard","Jessica","Joseph","Sarah","Thomas",
    "Karen","Charles","Lisa","Christopher","Nancy","Daniel","Betty","Matthew","Margaret",
    "Anthony","Sandra","Mark","Ashley","Donald","Dorothy","Steven","Kimberly","Paul",
    "Emily","Andrew","Donna","Joshua","Michelle","Kenneth","Carol","Kevin","Amanda",
    "Brian","Melissa","George","Deborah","Timothy","Stephanie","Ronald","Rebecca",
    "Edward","Sharon","Jason","Laura","Jeffrey","Cynthia","Ryan","Kathleen","Jacob",
    "Amy","Gary","Angela","Nicholas","Shirley","Eric","Anna","Jonathan","Brenda",
    "Stephen","Emma","Larry","Pamela","Justin","Nicole","Scott","Helen","Benjamin",
    "Samantha","Samuel","Katherine","Raymond","Christine","Gregory","Debra","Frank","Rachel"]

LAST_NAMES = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis",
    "Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas",
    "Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris",
    "Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King",
    "Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson",
    "Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts","Turner","Phillips",
    "Evans","Collins","Stewart","Morris","Murphy","Cook","Rogers","Morgan","Peterson",
    "Cooper","Reed","Bailey","Bell","Gomez","Kelly","Howard","Ward","Cox","Diaz",
    "Richardson","Wood","Watson","Brooks","Bennett","Gray","James","Reyes","Cruz",
    "Hughes","Price","Myers","Long","Foster","Sanders","Ross","Morales","Powell"]

DEPARTMENTS = ["Engineering","Product","Design","Marketing","Sales","HR","Finance",
    "Legal","Operations","Customer Success","Data Science","DevOps","QA","Security","Research"]

ROLES = {
    "Engineering":["Software Engineer I","Software Engineer II","Senior Software Engineer",
        "Staff Engineer","Principal Engineer","Engineering Manager","VP Engineering","CTO"],
    "Product":["Associate PM","Product Manager","Senior PM","Group PM","Director of Product",
        "VP Product","CPO"],
    "Design":["UX Designer","UI Designer","Senior Designer","Lead Designer","Design Manager","VP Design"],
    "Marketing":["Marketing Coordinator","Marketing Specialist","Senior Marketer",
        "Marketing Manager","Director of Marketing","CMO"],
    "Sales":["Sales Development Rep","Account Executive","Senior AE","Sales Manager",
        "Director of Sales","VP Sales","CRO"],
    "HR":["HR Coordinator","HR Specialist","HR Business Partner","HR Manager","Director of HR","CHRO"],
    "Finance":["Financial Analyst","Senior Analyst","Finance Manager","Controller","CFO"],
    "Legal":["Legal Counsel","Senior Counsel","General Counsel"],
    "Operations":["Operations Analyst","Operations Manager","Director of Operations","COO"],
    "Customer Success":["CS Specialist","CS Manager","Director of CS","VP CS"],
    "Data Science":["Data Analyst","Data Scientist","Senior Data Scientist","ML Engineer","Head of Data"],
    "DevOps":["DevOps Engineer","Senior DevOps","Platform Engineer","DevOps Manager"],
    "QA":["QA Engineer","Senior QA","QA Lead","QA Manager"],
    "Security":["Security Analyst","Security Engineer","Security Architect","CISO"],
    "Research":["Research Scientist","Senior Researcher","Research Director"],
}

SKILLS = ["Python","JavaScript","React","Node.js","TypeScript","SQL","AWS","Azure","GCP",
    "Docker","Kubernetes","Machine Learning","Deep Learning","NLP","Data Analysis",
    "Product Management","UX Research","Figma","Adobe XD","Marketing Analytics",
    "Salesforce","HubSpot","Communication","Leadership","Project Management",
    "Agile","Scrum","Java","Go","Rust","C++","Data Visualization","Tableau",
    "Power BI","Excel","Financial Modeling","Legal Research","HR Analytics",
    "Recruitment","Performance Management","Customer Success","Account Management"]

CITIES = [("New York","NY"),("San Francisco","CA"),("Austin","TX"),("Chicago","IL"),
    ("Seattle","WA"),("Boston","MA"),("Los Angeles","CA"),("Denver","CO"),
    ("Atlanta","GA"),("Miami","FL"),("Remote","N/A"),("Portland","OR")]

EDUCATION = ["High School","Associate's","Bachelor's","Master's","PhD","MBA","JD"]
UNIVERSITIES = ["MIT","Stanford","Harvard","UC Berkeley","Carnegie Mellon","Georgia Tech",
    "UT Austin","University of Michigan","Cornell","Columbia","NYU","UCLA","Duke"]
PERFORMANCE = ["Outstanding","Exceeds Expectations","Meets Expectations",
    "Needs Improvement","Below Expectations"]
STATUS_WEIGHTS = ["Active"]*70 + ["Terminated"]*15 + ["On Leave"]*10 + ["Probation"]*5

def rand_date(y1=2010, y2=2024):
    s = datetime(y1,1,1); e = datetime(y2,12,31)
    return (s + timedelta(days=random.randint(0,(e-s).days))).strftime("%Y-%m-%d")

def rand_salary(dept, role):
    base = {"Engineering":120000,"Product":115000,"Design":95000,"Marketing":85000,
        "Sales":90000,"HR":75000,"Finance":95000,"Legal":110000,"Operations":80000,
        "Customer Success":70000,"Data Science":125000,"DevOps":115000,"QA":90000,
        "Security":120000,"Research":110000}.get(dept, 80000)
    mult = 1 + 0.5*("Senior" in role) + 0.8*("Director" in role or "VP" in role) \
           + 1.5*any(x in role for x in ["CTO","CPO","CMO","CFO","CRO","COO","CHRO","CISO","Head"])
    return int(base * mult * random.uniform(0.85,1.20))

# ── 1. Employees (1,200) ───────────────────────────────────────────────────────
print("Generating employees.csv ...")
employees = []
for i in range(1200):
    dept = random.choice(DEPARTMENTS)
    role = random.choice(ROLES[dept])
    city, state = random.choice(CITIES)
    fn, ln = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
    employees.append({
        "employee_id": f"EMP{str(i+1001).zfill(5)}",
        "first_name": fn, "last_name": ln,
        "email": f"{fn.lower()}.{ln.lower()}{random.randint(1,99)}@talentiq.com",
        "department": dept, "role": role,
        "hire_date": rand_date(2010,2024),
        "salary": rand_salary(dept, role),
        "city": city, "state": state,
        "education_level": random.choice(EDUCATION),
        "university": random.choice(UNIVERSITIES) if random.random() > 0.2 else "",
        "years_experience": random.randint(0,25),
        "skills": "|".join(random.sample(SKILLS, random.randint(3,8))),
        "performance_rating": random.choices(PERFORMANCE,[20,45,10,20,5])[0],
        "employment_status": random.choice(STATUS_WEIGHTS),
        "manager_id": f"EMP{str(random.randint(1001,1100)).zfill(5)}",
        "remote_work": random.choice(["Yes","No","Hybrid"]),
        "satisfaction_score": round(random.uniform(1,10),1),
        "tenure_months": random.randint(1,180),
        "promotions_count": random.randint(0,5),
        "training_hours_ytd": random.randint(0,120),
        "overtime_hours_monthly": random.randint(0,40),
    })
with open(f"{OUTPUT_DIR}/employees.csv","w",newline="") as f:
    w = csv.DictWriter(f, fieldnames=employees[0].keys()); w.writeheader(); w.writerows(employees)
print(f"  ✓ {len(employees)} rows")

# ── 2. Job Applications (1,500) ───────────────────────────────────────────────
print("Generating job_applications.csv ...")
JOB_TITLES = ["Software Engineer","Product Manager","Data Scientist","DevOps Engineer",
    "UX Designer","Marketing Manager","Sales Executive","HR Business Partner",
    "Security Engineer","QA Engineer"]
SOURCES = ["LinkedIn","Indeed","Referral","Company Website","Glassdoor",
    "Campus Recruitment","Headhunter","AngelList"]
STATUSES = ["Applied","Screening","Phone Interview","Technical Interview",
    "Offer Extended","Hired","Rejected","Withdrawn"]
STATUS_W = [5,10,15,20,10,15,20,5]

apps = []
for i in range(1500):
    status = random.choices(STATUSES, weights=STATUS_W)[0]
    fn, ln = random.choice(FIRST_NAMES), random.choice(LAST_NAMES)
    apps.append({
        "application_id": f"APP{str(i+10001).zfill(6)}",
        "candidate_name": f"{fn} {ln}",
        "email": f"{fn.lower()}.{ln.lower()}@email.com",
        "job_title": random.choice(JOB_TITLES),
        "department": random.choice(DEPARTMENTS),
        "applied_date": rand_date(2022,2024),
        "source": random.choice(SOURCES),
        "status": status,
        "years_experience": random.randint(0,20),
        "education_level": random.choice(EDUCATION),
        "skills_match_score": round(random.uniform(30,100),1),
        "ai_compatibility_score": round(random.uniform(40,100),1),
        "interview_score": round(random.uniform(1,10),1) if status not in ["Applied","Screening"] else "",
        "resume_keywords_matched": random.randint(5,40),
        "expected_salary": random.randint(60000,200000),
        "location_preference": random.choice(["Remote","Hybrid","On-site"]),
        "referral_employee_id": employees[random.randint(0,49)]["employee_id"] if random.random()<0.2 else "",
        "time_to_hire_days": random.randint(7,90) if status=="Hired" else "",
        "rejection_reason": random.choice(["Skills mismatch","Salary expectations","Culture fit","Better candidate"]) if status=="Rejected" else "",
    })
with open(f"{OUTPUT_DIR}/job_applications.csv","w",newline="") as f:
    w = csv.DictWriter(f, fieldnames=apps[0].keys()); w.writeheader(); w.writerows(apps)
print(f"  ✓ {len(apps)} rows")

# ── 3. Performance Reviews (1,000) ────────────────────────────────────────────
print("Generating performance_reviews.csv ...")
active_ids = [e["employee_id"] for e in employees if e["employment_status"]=="Active"]
PERIODS = ["Q1 2024","Q2 2024","Q3 2024","Q4 2023","Q4 2024","Annual 2023","Annual 2024"]
STRENGTHS = ["Strong technical skills","Great communicator","Problem solver","Team player",
    "Innovative thinker","Reliable and consistent","Leadership potential","Customer focused"]
IMPROVEMENTS = ["Time management","Communication clarity","Technical depth",
    "Stakeholder management","Strategic thinking","Documentation"]

reviews = []
for i in range(1000):
    eid = random.choice(active_ids)
    reviews.append({
        "review_id": f"REV{str(i+1).zfill(5)}",
        "employee_id": eid,
        "review_period": random.choice(PERIODS),
        "reviewer_id": f"EMP{str(random.randint(1001,1100)).zfill(5)}",
        "overall_rating": random.choices([1,2,3,4,5],weights=[5,10,30,35,20])[0],
        "goals_achieved_pct": random.randint(40,120),
        "communication_score": random.randint(1,10),
        "technical_score": random.randint(1,10),
        "leadership_score": random.randint(1,10),
        "collaboration_score": random.randint(1,10),
        "innovation_score": random.randint(1,10),
        "strengths": random.choice(STRENGTHS),
        "areas_for_improvement": random.choice(IMPROVEMENTS),
        "promotion_recommended": random.choice(["Yes","No","No","No"]),
        "salary_increase_recommended_pct": random.randint(0,20),
        "ai_sentiment_score": round(random.uniform(1,10),2),
        "review_date": rand_date(2023,2024),
    })
with open(f"{OUTPUT_DIR}/performance_reviews.csv","w",newline="") as f:
    w = csv.DictWriter(f, fieldnames=reviews[0].keys()); w.writeheader(); w.writerows(reviews)
print(f"  ✓ {len(reviews)} rows")

# ── 4. Training Records (800) ─────────────────────────────────────────────────
print("Generating training_records.csv ...")
COURSES = ["Python for Data Science","Leadership Fundamentals","Agile & Scrum",
    "AWS Certification","Communication Skills","Security Awareness","Excel Advanced",
    "SQL Mastery","Machine Learning Basics","Product Management 101","Financial Analysis",
    "UX Design Thinking","Conflict Resolution","React Development","Docker & Kubernetes",
    "Legal Compliance 2024","Mental Health at Work","Diversity & Inclusion",
    "Public Speaking","Data Privacy (GDPR)"]
T_STATUS = ["Completed","In Progress","Enrolled","Dropped","Passed","Failed"]
T_W = [45,20,15,5,10,5]

training = []
for i in range(800):
    status = random.choices(T_STATUS, weights=T_W)[0]
    training.append({
        "training_id": f"TRN{str(i+1).zfill(5)}",
        "employee_id": random.choice(active_ids),
        "course_name": random.choice(COURSES),
        "provider": random.choice(["Coursera","Udemy","LinkedIn Learning","Internal","Pluralsight","Skillsoft"]),
        "category": random.choice(["Technical","Soft Skills","Compliance","Leadership","Domain"]),
        "start_date": rand_date(2023,2024),
        "completion_date": rand_date(2023,2024) if status in ["Completed","Passed"] else "",
        "status": status,
        "score_pct": random.randint(60,100) if status in ["Completed","Passed","Failed"] else "",
        "hours_spent": random.randint(2,80),
        "cost_usd": random.randint(0,2000),
        "certificate_earned": "Yes" if status=="Passed" else "No",
        "mandatory": random.choice(["Yes","No"]),
        "ai_recommended": random.choice(["Yes","No","Yes"]),
        "skill_gap_addressed": random.choice(SKILLS),
    })
with open(f"{OUTPUT_DIR}/training_records.csv","w",newline="") as f:
    w = csv.DictWriter(f, fieldnames=training[0].keys()); w.writeheader(); w.writerows(training)
print(f"  ✓ {len(training)} rows")

# ── 5. Attrition Data (600) ───────────────────────────────────────────────────
print("Generating attrition_data.csv ...")
attrition = []
for i in range(600):
    dept = random.choice(DEPARTMENTS)
    role = random.choice(ROLES[dept])
    left = random.choice(["Yes","No","No","No"])
    attrition.append({
        "record_id": f"ATT{str(i+1).zfill(5)}",
        "department": dept, "role": role,
        "age": random.randint(22,65),
        "gender": random.choice(["Male","Female","Non-binary","Prefer not to say"]),
        "years_at_company": random.randint(0,20),
        "salary": rand_salary(dept, role),
        "job_satisfaction": random.randint(1,10),
        "work_life_balance": random.randint(1,10),
        "manager_relationship": random.randint(1,10),
        "career_growth_opportunity": random.randint(1,10),
        "commute_distance_miles": random.randint(0,60),
        "overtime_frequency": random.choice(["Never","Rarely","Sometimes","Often","Always"]),
        "remote_work_policy": random.choice(["Fully Remote","Hybrid","On-site"]),
        "last_promotion_years_ago": random.randint(0,10),
        "competing_offer": random.choice(["Yes","No","No","No","No"]),
        "left_company": left,
        "attrition_risk_score": round(random.uniform(0,1),3),
        "exit_reason": random.choice(["Better opportunity","Relocation","Compensation","Work-life balance","Management"]) if left=="Yes" else "",
        "months_before_leaving": random.randint(1,36) if left=="Yes" else "",
    })
with open(f"{OUTPUT_DIR}/attrition_data.csv","w",newline="") as f:
    w = csv.DictWriter(f, fieldnames=attrition[0].keys()); w.writeheader(); w.writerows(attrition)
print(f"  ✓ {len(attrition)} rows")

# ── 6. Payroll Data (1,000) ───────────────────────────────────────────────────
print("Generating payroll_data.csv ...")
MONTHS = ["Jan 2024","Feb 2024","Mar 2024","Apr 2024","May 2024","Jun 2024",
    "Jul 2024","Aug 2024","Sep 2024","Oct 2024","Nov 2024","Dec 2024"]

payroll = []
for i in range(1000):
    emp = random.choice(employees)
    base = emp["salary"] / 12
    bonus = base * random.uniform(0,0.25)
    overtime = random.randint(0,20) * random.uniform(30,80)
    deductions = base * random.uniform(0.20,0.35)
    payroll.append({
        "payroll_id": f"PAY{str(i+1).zfill(6)}",
        "employee_id": emp["employee_id"],
        "pay_period": random.choice(MONTHS),
        "base_salary_monthly": round(base,2),
        "bonus": round(bonus,2),
        "overtime_pay": round(overtime,2),
        "gross_pay": round(base+bonus+overtime,2),
        "tax_deduction": round(deductions*0.6,2),
        "health_insurance": round(random.uniform(200,800),2),
        "retirement_401k": round(base*random.uniform(0.03,0.10),2),
        "other_deductions": round(random.uniform(0,200),2),
        "net_pay": round(base+bonus+overtime-deductions,2),
        "payment_method": random.choice(["Direct Deposit","Check"]),
        "department": emp["department"],
        "currency": "USD",
    })
with open(f"{OUTPUT_DIR}/payroll_data.csv","w",newline="") as f:
    w = csv.DictWriter(f, fieldnames=payroll[0].keys()); w.writeheader(); w.writerows(payroll)
print(f"  ✓ {len(payroll)} rows")

total = len(employees)+len(apps)+len(reviews)+len(training)+len(attrition)+len(payroll)
print(f"\n✅ Done! Total rows generated: {total:,}")
print(f"   Files saved to: {OUTPUT_DIR}/")
