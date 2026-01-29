import React, { useState } from 'react';
import { RoleType, ApplicationFormData, JobDetail } from './types';
import { JOB_DETAILS } from './constants';
import { saveApplication } from './services/dbService';

const TECH_OPTIONS = [
  'React', 'Angular', 'Vue', 'JavaScript', 'TypeScript',
  'HTML / CSS', 'Node.js', 'Python', 'Java',
  'RESTful APIs', 'GraphQL', 'Microservices',
  'PostgreSQL', 'MySQL', 'MongoDB',
  'AWS', 'Azure', 'Google Cloud',
  'Performance Tuning', 'Security Implementation', 'Caching Strategies', 'Distributed Systems'
];

const EXPERIENCE_OPTIONS = [
  'Less than 1 year',
  '1 - 3 years',
  '3 - 5 years',
  '5 - 10 years',
  '10+ years'
];

const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'NGN', symbol: '₦' },
  { code: 'INR', symbol: '₹' },
  { code: 'CAD', symbol: 'C$' },
  { code: 'AUD', symbol: 'A$' }
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const YEARS = Array.from({ length: 80 }, (_, i) => (2025 - i).toString());

const App: React.FC = () => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const jobInfo: JobDetail = JOB_DETAILS[RoleType.SOFTWARE_DEVELOPER];

  const initialFormData: ApplicationFormData = {
    firstName: '',
    lastName: '',
    birthMonth: '',
    birthDay: '',
    birthYear: '',
    gender: '',
    techStack: [],
    yearsOfExperience: '',
    personalSites: '',
    isWorkingNow: '',
    isImmediatelyAvailable: '',
    compensationPreference: '',
    salaryExpectation: '',
    currency: 'USD',
    portfolioSamples: '',
    location: '',
    lastFinishedProject: '',
    currentProject: '',
    email: '',
    phoneAreaCode: '',
    phoneNumber: '',
    appliedRole: RoleType.SOFTWARE_DEVELOPER
  };

  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => {
        const stack = [...prev.techStack];
        if (checked) {
          if (!stack.includes(value)) stack.push(value);
        } else {
          return { ...prev, techStack: stack.filter(item => item !== value) };
        }
        return { ...prev, techStack: stack };
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const clearForm = () => {
    if (window.confirm("Are you sure you want to clear all fields?")) {
      setFormData(initialFormData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.techStack.length === 0) {
      alert("Please select at least one technology from your Tech Stack.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await saveApplication(formData);
      if (success) {
        setStep('success');
      } else {
        alert("There was an issue submitting your application. Please try again.");
      }
    } catch (err) {
      console.error("Critical submission error:", err);
      setStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const SectionTitle = ({ title, sub, required }: { title: string; sub?: string; required?: boolean }) => (
    <div className="mb-4">
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-1">
        {title}
        {required && <span className="text-rose-500 font-black">*</span>}
      </h3>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );

  const InputSubtext = ({ text }: { text: string }) => (
    <span className="text-[10px] text-slate-400 mt-1 block px-1 font-medium">{text}</span>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 pb-20">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setStep('form')}>
            <div className="w-8 h-8 bg-indigo-600 rounded shadow-sm flex items-center justify-center font-black text-white transform transition-transform group-hover:scale-105">N</div>
            <span className="font-bold text-lg tracking-tight">Nexlify <span className="text-indigo-600">Careers</span></span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-widest">
              {step === 'form' ? 'Active Vacancy' : 'Submission Received'}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {step === 'form' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-400">
            <div className="mb-10 text-center">
              <h1 className="text-3xl md:text-5xl font-black mb-3 text-slate-900 tracking-tight">{jobInfo.title}</h1>
              <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">{jobInfo.description}</p>
            </div>

            {jobInfo.equityTerms && (
              <div className="mb-12 bg-white border border-indigo-100 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 animate-in fade-in zoom-in duration-700">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Proposed Equity Package</h4>
                  <p className="text-slate-700 font-medium text-base whitespace-pre-wrap">{jobInfo.equityTerms}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
              <div className="p-6 md:p-12 space-y-12">
                <div className="space-y-4">
                  <SectionTitle title="Full Name" required />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="w-full">
                      <input required name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-base shadow-sm" />
                      <InputSubtext text="First Name" />
                    </div>
                    <div className="w-full">
                      <input required name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-base shadow-sm" />
                      <InputSubtext text="Last Name" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle title="Birth Date" required />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <select required name="birthMonth" value={formData.birthMonth} onChange={handleInputChange} className="w-full px-3 py-3 bg-white border border-slate-300 rounded text-base outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm">
                        <option value="">Month</option>
                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <select required name="birthDay" value={formData.birthDay} onChange={handleInputChange} className="w-full px-3 py-3 bg-white border border-slate-300 rounded text-base outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm">
                        <option value="">Day</option>
                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <select required name="birthYear" value={formData.birthYear} onChange={handleInputChange} className="w-full px-3 py-3 bg-white border border-slate-300 rounded text-base outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm">
                        <option value="">Year</option>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle title="Gender" required />
                  <select required name="gender" value={formData.gender} onChange={handleInputChange} className="w-full sm:w-1/2 px-3 py-3 bg-white border border-slate-300 rounded text-base outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm">
                    <option value="">Please Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <SectionTitle title="What do you use?" sub="Select your areas of proficiency across our core requirements" required />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 p-6 bg-slate-50 border border-slate-200 rounded-xl">
                    {TECH_OPTIONS.map(tech => (
                      <label key={tech} className="flex items-center gap-3 cursor-pointer group select-none py-1">
                        <input type="checkbox" name="techStack" value={tech} checked={formData.techStack.includes(tech)} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all" />
                        <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">{tech}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <SectionTitle title="Years of Professional Experience" sub="How long have you been working in the tech industry?" required />
                  <select required name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleInputChange} className="w-full sm:w-1/2 px-3 py-3 bg-white border border-slate-300 rounded text-base outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm">
                    <option value="">Please Select</option>
                    {EXPERIENCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="space-y-4">
                  <SectionTitle title="Personal site(s)" sub="e.g. Portfolio, Blog, GitHub" />
                  <input name="personalSites" value={formData.personalSites} onChange={handleInputChange} placeholder="http://" className="w-full px-4 py-3 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-base shadow-sm" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <SectionTitle title="Are you working now?" />
                    <div className="flex gap-8 mt-2">
                      {['Yes', 'No'].map(opt => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                          <input type="radio" name="isWorkingNow" value={opt} checked={formData.isWorkingNow === opt} onChange={handleInputChange} className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                          <span className="text-sm font-medium group-hover:text-indigo-600 transition-colors">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <SectionTitle title="Immediate availability" />
                    <div className="flex gap-8 mt-2">
                      {['Yes', 'No'].map(opt => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                          <input type="radio" name="isImmediatelyAvailable" value={opt} checked={formData.isImmediatelyAvailable === opt} onChange={handleInputChange} className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                          <span className="text-sm font-medium group-hover:text-indigo-600 transition-colors">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <SectionTitle title="Compensation Preferences" sub="Nexlify prioritizes long-term partnership through equity." required />
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-slate-700">How would you prefer to be compensated?</p>
                    <div className="flex flex-col gap-3">
                      {[
                        { id: 'equity', label: 'I am comfortable working for company equity (Long-term growth focus)' },
                        { id: 'salary', label: 'I prefer a paid salary (Immediate liquidity focus)' }
                      ].map(opt => (
                        <label key={opt.id} className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-white transition-all group">
                          <input required type="radio" name="compensationPreference" value={opt.id} checked={formData.compensationPreference === opt.id} onChange={handleInputChange} className="w-5 h-5 mt-0.5 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                          <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <SectionTitle title="What are your salary expectations?" sub="Amount and currency" required />
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <select required name="currency" value={formData.currency} onChange={handleInputChange} className="w-full px-3 py-3 bg-white border border-slate-300 rounded text-base outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm">
                          {CURRENCY_OPTIONS.map(curr => <option key={curr.code} value={curr.code}>{curr.code} ({curr.symbol})</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <input required name="salaryExpectation" value={formData.salaryExpectation} onChange={handleInputChange} placeholder="Amount" className="w-full px-4 py-3 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-base shadow-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <SectionTitle title="Project Portfolio / Links" sub="Explain your role in these projects" />
                    <textarea name="portfolioSamples" value={formData.portfolioSamples} onChange={handleInputChange} rows={6} className="w-full px-4 py-3 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-base shadow-sm resize-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <SectionTitle title="Current Location" required />
                    <input required name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-base shadow-sm" />
                  </div>
                  <div className="space-y-4">
                    <SectionTitle title="Last finished project?" />
                    <input name="lastFinishedProject" value={formData.lastFinishedProject} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-base shadow-sm" />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <SectionTitle title="What project are you working on now?" sub="(fill null if there is none)" />
                    <textarea name="currentProject" value={formData.currentProject} onChange={handleInputChange} rows={4} className="w-full px-4 py-3 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-base shadow-sm resize-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                  <div className="space-y-4">
                    <SectionTitle title="E-mail" required />
                    <input required type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="ex: myname@example.com" className="w-full px-4 py-3 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-base shadow-sm" />
                  </div>
                  <div className="space-y-4">
                    <SectionTitle title="Phone Number" required />
                    <div className="flex items-center gap-3">
                      <div className="w-1/3">
                        <input required name="phoneAreaCode" value={formData.phoneAreaCode} onChange={handleInputChange} placeholder="Code" className="w-full px-3 py-3 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-base shadow-sm" />
                      </div>
                      <span className="text-slate-300 font-bold">-</span>
                      <div className="w-2/3">
                        <input required name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Number" className="w-full px-4 py-3 bg-white border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none text-base shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-10 flex flex-col sm:flex-row items-center gap-4">
                  <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-12 py-4 bg-slate-800 hover:bg-black text-white font-black text-sm uppercase tracking-widest rounded-lg shadow-xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 flex items-center justify-center gap-4">
                    {isSubmitting ? (
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : 'Submit Application'}
                  </button>
                  <button type="button" onClick={clearForm} className="w-full sm:w-auto px-10 py-4 bg-slate-100 border border-slate-200 hover:bg-white text-slate-500 font-bold text-sm uppercase tracking-widest rounded-lg transition-all">
                    Clear Form
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="max-w-xl mx-auto text-center py-20 px-10 bg-white rounded-[3rem] border border-slate-200 shadow-2xl animate-in zoom-in fade-in duration-500">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-10 border border-emerald-100">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-4xl font-black mb-4 text-slate-900">Application Received</h2>
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 mb-10">
               <p className="text-slate-600 leading-relaxed text-lg font-medium">
                Thank you for applying to Nexlify. Your application has been successfully received and our recruitment team will review your details shortly.
               </p>
               <p className="text-slate-500 mt-4 text-sm">
                We appreciate your interest and will be in touch via email if your profile matches our current needs.
               </p>
            </div>
            <button onClick={() => { setStep('form'); setFormData(initialFormData); }} className="px-12 py-4 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all">
              Back to Portal
            </button>
          </div>
        )}
      </main>
      <footer className="py-20 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-t border-slate-200">
        Nexlify Infrastructure Corp &bull; Recruitment Platform 2025
      </footer>
    </div>
  );
};

export default App;