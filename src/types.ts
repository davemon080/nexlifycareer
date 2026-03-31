export type AdminTab = 'overview' | 'users' | 'partners' | 'jobs' | 'market' | 'feed' | 'wallet';

export interface AdminUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'freelancer' | 'client' | 'admin';
  location?: string;
  createdAt?: string;
}

export interface AdminPartnerRequest {
  id: string;
  userUid: string;
  companyName: string;
  companyLogoUrl: string;
  websiteUrl?: string;
  socialLinks: string[];
  about: string;
  location: string;
  registrationUrls: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface AdminJob {
  id: string;
  clientUid: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  isRemote: boolean;
  status: 'open' | 'closed';
  createdAt: string;
}

export interface AdminMarketItem {
  id: string;
  sellerUid: string;
  title: string;
  category: string;
  price: number;
  priceCurrency: string;
  stockQuantity: number;
  isAnonymous: boolean;
  createdAt: string;
}

export interface AdminPost {
  id: string;
  authorUid: string;
  authorName: string;
  content: string;
  type: 'social' | 'job';
  createdAt: string;
}

export interface AdminComment {
  id: string;
  postId: string;
  userUid: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface AdminWalletTransaction {
  id: string;
  userUid: string;
  currency: 'USD' | 'NGN' | 'EUR';
  type: 'topup' | 'withdraw';
  method: 'card' | 'transfer';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
  createdAt: string;
}

export interface AdminOverview {
  totalUsers: number;
  totalAdmins: number;
  pendingPartners: number;
  openJobs: number;
  marketItems: number;
  posts: number;
  comments: number;
  walletTransactions: number;
}

export interface AdminSnapshot {
  overview: AdminOverview;
  users: AdminUserProfile[];
  partnerRequests: AdminPartnerRequest[];
  jobs: AdminJob[];
  marketItems: AdminMarketItem[];
  posts: AdminPost[];
  comments: AdminComment[];
  walletTransactions: AdminWalletTransaction[];
}
