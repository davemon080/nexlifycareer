<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Nexlify Job Portal - Database Integration

This application is now linked to your Neon PostgreSQL database.

## Database Setup

Run the following SQL in your **Neon SQL Editor** to create the table required to store applicant data:

```sql
-- SQL to create the applicants table in your Neon Database
CREATE TABLE applicants (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    gender VARCHAR(20),
    tech_stack JSONB NOT NULL, -- Stores proficient technologies as a JSON array
    experience_years VARCHAR(50),
    personal_sites TEXT,
    is_working VARCHAR(10),
    is_available VARCHAR(10),
    comp_pref VARCHAR(50),
    salary_expect TEXT,
    portfolio TEXT,
    location TEXT,
    last_project TEXT,
    current_project TEXT,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    applied_role VARCHAR(100),
    cv_data TEXT, -- Stores base64 encoded CV file
    cv_name VARCHAR(255), -- Stores the name of the file
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email searches
CREATE INDEX idx_applicant_email ON applicants(email);
```

## Database Connection Details

The app is currently linked with:
- **Host:** `ep-cool-glade-ahiz15lb-pooler.c-3.us-east-1.aws.neon.tech`
- **Database:** `neondb`
- **User:** `neondb_owner`

### Security Note
In a production environment, database credentials should be stored on a server-side environment (Node.js/Next.js backend) to prevent them from being visible in the browser's network tab. CV data is stored as a Base64 string in the `cv_data` column.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set your environment variables in `.env.local`.
3. Run the app:
   `npm run dev`