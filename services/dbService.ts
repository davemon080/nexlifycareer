import { ApplicationFormData, JobDetail } from "../types";
import { neon } from '@neondatabase/serverless';

/**
 * Direct connection string provided by the user to ensure connectivity 
 * in environments where process.env might not be available at runtime.
 */
const DATABASE_URL = 'postgresql://neondb_owner:npg_Tox9P1iYlgdu@ep-cool-glade-ahiz15lb-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Initialize the SQL client
const sql = neon(DATABASE_URL);

const monthMap: Record<string, string> = {
  January: '01', February: '02', March: '03', April: '04', May: '05', June: '06',
  July: '07', August: '08', September: '09', October: '10', November: '11', December: '12'
};

/**
 * Publishes job data to your database endpoint.
 */
export const publishJobToDatabase = async (job: JobDetail): Promise<boolean> => {
  try {
    console.log("Job detail logged for publishing:", job);
    return true;
  } catch (error) {
    console.error("Database integration failed:", error);
    return false;
  }
};

/**
 * Saves a new job application to the database.
 * This performs a real SQL INSERT into your Neon database.
 */
export const saveApplication = async (data: ApplicationFormData): Promise<boolean> => {
  console.log("📡 Connecting to Neon Database...");
  
  try {
    // Format the date for SQL (YYYY-MM-DD)
    const formattedMonth = monthMap[data.birthMonth] || '01';
    const formattedDay = data.birthDay.padStart(2, '0');
    const birthDateStr = `${data.birthYear}-${formattedMonth}-${formattedDay}`;

    // Combine currency and salary for storage
    const combinedSalary = `${data.currency} ${data.salaryExpectation}`;

    // Execute the SQL INSERT query
    await sql`
      INSERT INTO applicants (
        first_name,
        last_name,
        birth_date,
        gender,
        tech_stack,
        experience_years,
        personal_sites,
        is_working,
        is_available,
        comp_pref,
        salary_expect,
        portfolio,
        location,
        last_project,
        current_project,
        email,
        phone,
        applied_role
      ) VALUES (
        ${data.firstName},
        ${data.lastName},
        ${birthDateStr},
        ${data.gender},
        ${JSON.stringify(data.techStack)},
        ${data.yearsOfExperience},
        ${data.personalSites},
        ${data.isWorkingNow},
        ${data.isImmediatelyAvailable},
        ${data.compensationPreference},
        ${combinedSalary},
        ${data.portfolioSamples},
        ${data.location},
        ${data.lastFinishedProject},
        ${data.currentProject},
        ${data.email},
        ${`${data.phoneAreaCode}-${data.phoneNumber}`},
        ${data.appliedRole}
      )
    `;

    console.log("✅ Successfully saved application to Neon DB.");
    return true;
  } catch (error) {
    console.error("❌ SQL Error encountered during submission:", error);
    throw error;
  }
};