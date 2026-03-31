import { supabase } from '../supabase';
import {
  AdminComment,
  AdminJob,
  AdminMarketItem,
  AdminPartnerRequest,
  AdminPost,
  AdminSnapshot,
  AdminUserProfile,
  AdminWalletTransaction,
} from '../types';

type DbAdminUserProfile = {
  uid: string;
  email: string;
  display_name: string;
  photo_url: string;
  role: 'freelancer' | 'client' | 'admin';
  location?: string | null;
  created_at?: string | null;
};

type DbAdminPartnerRequest = {
  id: string;
  user_uid: string;
  company_name: string;
  company_logo_url: string;
  website_url?: string | null;
  social_links?: string[] | null;
  about: string;
  location: string;
  registration_urls?: string[] | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

type DbAdminJob = {
  id: string;
  client_uid: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  is_remote: boolean;
  status: 'open' | 'closed';
  created_at: string;
};

type DbAdminMarketItem = {
  id: string;
  seller_uid: string;
  title: string;
  category: string;
  price: number;
  price_currency?: string | null;
  stock_quantity: number;
  is_anonymous: boolean;
  created_at: string;
};

type DbAdminPost = {
  id: string;
  author_uid: string;
  author_name: string;
  content: string;
  type: 'social' | 'job';
  created_at: string;
};

type DbAdminComment = {
  id: string;
  post_id: string;
  user_uid: string;
  author_name: string;
  content: string;
  created_at: string;
};

type DbAdminWalletTransaction = {
  id: string;
  user_uid: string;
  currency: 'USD' | 'NGN' | 'EUR';
  type: 'topup' | 'withdraw';
  method: 'card' | 'transfer';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  reference?: string | null;
  created_at: string;
};

function mapUser(row: DbAdminUserProfile): AdminUserProfile {
  return {
    uid: row.uid,
    email: row.email,
    displayName: row.display_name,
    photoURL: row.photo_url,
    role: row.role,
    location: row.location || undefined,
    createdAt: row.created_at || undefined,
  };
}

function mapPartnerRequest(row: DbAdminPartnerRequest): AdminPartnerRequest {
  return {
    id: row.id,
    userUid: row.user_uid,
    companyName: row.company_name,
    companyLogoUrl: row.company_logo_url,
    websiteUrl: row.website_url || undefined,
    socialLinks: row.social_links || [],
    about: row.about,
    location: row.location,
    registrationUrls: row.registration_urls || [],
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapJob(row: DbAdminJob): AdminJob {
  return {
    id: row.id,
    clientUid: row.client_uid,
    title: row.title,
    description: row.description,
    category: row.category,
    budget: row.budget,
    isRemote: row.is_remote,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapMarketItem(row: DbAdminMarketItem): AdminMarketItem {
  return {
    id: row.id,
    sellerUid: row.seller_uid,
    title: row.title,
    category: row.category,
    price: row.price,
    priceCurrency: row.price_currency || 'USD',
    stockQuantity: row.stock_quantity,
    isAnonymous: row.is_anonymous,
    createdAt: row.created_at,
  };
}

function mapPost(row: DbAdminPost): AdminPost {
  return {
    id: row.id,
    authorUid: row.author_uid,
    authorName: row.author_name,
    content: row.content,
    type: row.type,
    createdAt: row.created_at,
  };
}

function mapComment(row: DbAdminComment): AdminComment {
  return {
    id: row.id,
    postId: row.post_id,
    userUid: row.user_uid,
    authorName: row.author_name,
    content: row.content,
    createdAt: row.created_at,
  };
}

function mapWalletTransaction(row: DbAdminWalletTransaction): AdminWalletTransaction {
  return {
    id: row.id,
    userUid: row.user_uid,
    currency: row.currency,
    type: row.type,
    method: row.method,
    amount: row.amount,
    status: row.status,
    reference: row.reference || undefined,
    createdAt: row.created_at,
  };
}

async function runQuery<T>(promise: any, context: string): Promise<T> {
  const { data, error } = await promise;
  if (error) {
    throw new Error(error.message || `Failed to ${context}.`);
  }
  return data;
}

async function getCount(table: string, filter?: (query: any) => any): Promise<number> {
  const base = supabase.from(table).select('*', { count: 'exact', head: true });
  const query = filter ? filter(base) : base;
  const { count, error } = await query;
  if (error) {
    throw new Error(error.message || `Failed to count ${table}.`);
  }
  return count || 0;
}

export const adminService = {
  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message || 'Unable to sign in.');
    }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message || 'Unable to sign out.');
    }
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(error.message || 'Unable to get session.');
    }
    return data.session;
  },

  async getAdminProfile(uid: string): Promise<AdminUserProfile | null> {
    const row = await runQuery<DbAdminUserProfile | null>(
      supabase.from('users').select('uid,email,display_name,photo_url,role,location,created_at').eq('uid', uid).maybeSingle(),
      'load admin profile'
    );
    return row ? mapUser(row) : null;
  },

  async getSnapshot(): Promise<AdminSnapshot> {
    const [overviewCounts, users, partnerRequests, jobs, marketItems, posts, comments, walletTransactions] = await Promise.all([
      Promise.all([
        getCount('users'),
        getCount('users', (query) => query.eq('role', 'admin')),
        getCount('company_partner_requests', (query) => query.eq('status', 'pending')),
        getCount('jobs', (query) => query.eq('status', 'open')),
        getCount('market_items'),
        getCount('posts'),
        getCount('post_comments'),
        getCount('wallet_transactions'),
      ]),
      runQuery<DbAdminUserProfile[]>(
        supabase.from('users').select('uid,email,display_name,photo_url,role,location,created_at').order('created_at', { ascending: false }).limit(50),
        'load users'
      ),
      runQuery<DbAdminPartnerRequest[]>(
        supabase.from('company_partner_requests').select('*').order('created_at', { ascending: false }).limit(50),
        'load partner requests'
      ),
      runQuery<DbAdminJob[]>(
        supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(50),
        'load jobs'
      ),
      runQuery<DbAdminMarketItem[]>(
        supabase.from('market_items').select('id,seller_uid,title,category,price,price_currency,stock_quantity,is_anonymous,created_at').order('created_at', { ascending: false }).limit(50),
        'load market items'
      ),
      runQuery<DbAdminPost[]>(
        supabase.from('posts').select('id,author_uid,author_name,content,type,created_at').order('created_at', { ascending: false }).limit(50),
        'load posts'
      ),
      runQuery<DbAdminComment[]>(
        supabase.from('post_comments').select('id,post_id,user_uid,author_name,content,created_at').order('created_at', { ascending: false }).limit(50),
        'load comments'
      ),
      runQuery<DbAdminWalletTransaction[]>(
        supabase.from('wallet_transactions').select('id,user_uid,currency,type,method,amount,status,reference,created_at').order('created_at', { ascending: false }).limit(50),
        'load wallet transactions'
      ),
    ]);

    const [totalUsers, totalAdmins, pendingPartners, openJobs, totalMarketItems, totalPosts, totalComments, totalWalletTransactions] =
      overviewCounts;

    return {
      overview: {
        totalUsers,
        totalAdmins,
        pendingPartners,
        openJobs,
        marketItems: totalMarketItems,
        posts: totalPosts,
        comments: totalComments,
        walletTransactions: totalWalletTransactions,
      },
      users: users.map(mapUser),
      partnerRequests: partnerRequests.map(mapPartnerRequest),
      jobs: jobs.map(mapJob),
      marketItems: marketItems.map(mapMarketItem),
      posts: posts.map(mapPost),
      comments: comments.map(mapComment),
      walletTransactions: walletTransactions.map(mapWalletTransaction),
    };
  },

  subscribeToAdminChanges(onChange: () => void) {
    const tables = ['users', 'company_partner_requests', 'jobs', 'market_items', 'posts', 'post_comments', 'wallet_transactions'];
    const channels = tables.map((table) =>
      supabase.channel(`admin-watch:${table}`).on('postgres_changes', { event: '*', schema: 'public', table }, onChange).subscribe()
    );

    return () => {
      channels.forEach((channel) => {
        void supabase.removeChannel(channel);
      });
    };
  },

  async updatePartnerRequestStatus(id: string, status: 'approved' | 'rejected') {
    await runQuery(supabase.from('company_partner_requests').update({ status }).eq('id', id), 'update partner request');
  },

  async deleteJob(id: string) {
    await runQuery(supabase.from('jobs').delete().eq('id', id), 'delete job');
  },

  async updateJobStatus(id: string, status: 'open' | 'closed') {
    await runQuery(supabase.from('jobs').update({ status }).eq('id', id), 'update job status');
  },

  async deleteMarketItem(id: string) {
    await runQuery(supabase.from('market_items').delete().eq('id', id), 'delete market item');
  },

  async deletePost(id: string) {
    await runQuery(supabase.from('posts').delete().eq('id', id), 'delete post');
  },

  async deleteComment(id: string) {
    await runQuery(supabase.from('post_comments').delete().eq('id', id), 'delete comment');
  },
};
