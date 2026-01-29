
import { RoleType, JobDetail } from './types';

export const JOB_DETAILS: Record<RoleType, JobDetail> = {
  [RoleType.SOFTWARE_DEVELOPER]: {
    title: 'Senior Software Architect',
    description: 'Lead the technical vision for Nexlify. Build high-traffic, distributed systems from the ground up.',
    requirements: [
      'Full-stack expertise (React/Node.js/Python)',
      'Experience with AWS/GCP and microservices',
      'Proven track record with high-performance databases',
      'Comfortable with equity-based compensation models'
    ],
    equityTerms: 'Significant early-stage equity package (Employee Agreement basis).'
  }
};
