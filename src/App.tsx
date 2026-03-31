import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  BriefcaseBusiness,
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Store,
  Trash2,
  Users,
} from 'lucide-react';
import { adminService } from './services/adminService';
import { supabase } from './supabase';
import { AdminSnapshot, AdminTab, AdminUserProfile } from './types';

const tabs: Array<{ id: AdminTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'partners', label: 'Partners', icon: Building2 },
  { id: 'jobs', label: 'Jobs', icon: BriefcaseBusiness },
  { id: 'market', label: 'Market', icon: Store },
  { id: 'feed', label: 'Feed', icon: Trash2 },
  { id: 'wallet', label: 'Wallet', icon: CreditCard },
];

const emptySnapshot: AdminSnapshot = {
  overview: {
    totalUsers: 0,
    totalAdmins: 0,
    pendingPartners: 0,
    openJobs: 0,
    marketItems: 0,
    posts: 0,
    comments: 0,
    walletTransactions: 0,
  },
  users: [],
  partnerRequests: [],
  jobs: [],
  marketItems: [],
  posts: [],
  comments: [],
  walletTransactions: [],
};

function formatDate(value?: string) {
  if (!value) return 'Unknown';
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return value;
  }
}

function App() {
  const [sessionUid, setSessionUid] = useState<string | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUserProfile | null>(null);
  const [snapshot, setSnapshot] = useState<AdminSnapshot>(emptySnapshot);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [actionState, setActionState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const pendingPartners = useMemo(
    () => snapshot.partnerRequests.filter((item) => item.status === 'pending'),
    [snapshot.partnerRequests]
  );

  const refresh = async (uid = sessionUid) => {
    if (!uid) return;
    setLoadingData(true);
    setError(null);
    try {
      const [profile, nextSnapshot] = await Promise.all([
        adminService.getAdminProfile(uid),
        adminService.getSnapshot(),
      ]);
      setAdminProfile(profile);
      setSnapshot(nextSnapshot);
      if (!profile || profile.role !== 'admin') {
        setError('This account does not have admin access.');
      }
    } catch (nextError: any) {
      setError(nextError?.message || 'Unable to load admin data.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        const session = await adminService.getSession();
        if (mounted) {
          setSessionUid(session?.user?.id || null);
        }
      } catch (nextError: any) {
        if (mounted) {
          setError(nextError?.message || 'Unable to initialize admin session.');
        }
      } finally {
        if (mounted) {
          setLoadingAuth(false);
        }
      }
    };

    void boot();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUid(session?.user?.id || null);
      setError(null);
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionUid) {
      setAdminProfile(null);
      setSnapshot(emptySnapshot);
      return;
    }

    void refresh(sessionUid);
    const unsubscribe = adminService.subscribeToAdminChanges(() => {
      void refresh(sessionUid);
    });
    return unsubscribe;
  }, [sessionUid]);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSigningIn(true);
    setError(null);
    try {
      await adminService.signIn(email.trim(), password);
      const session = await adminService.getSession();
      setSessionUid(session?.user?.id || null);
    } catch (nextError: any) {
      setError(nextError?.message || 'Unable to sign in.');
    } finally {
      setSigningIn(false);
    }
  };

  const runAction = async (label: string, callback: () => Promise<void>) => {
    setActionState(label);
    setError(null);
    try {
      await callback();
      await refresh();
    } catch (nextError: any) {
      setError(nextError?.message || `Unable to ${label.toLowerCase()}.`);
    } finally {
      setActionState(null);
    }
  };

  const handleSignOut = async () => {
    await runAction('Signing out', async () => {
      await adminService.signOut();
      setSessionUid(null);
      setAdminProfile(null);
      setSnapshot(emptySnapshot);
    });
  };

  if (loadingAuth) {
    return <FullScreenMessage title="Opening Connect Admin" body="Checking your session and preparing the dashboard." />;
  }

  if (!sessionUid) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/60 bg-slate-950 p-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.35)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-amber-200">
              <ShieldCheck className="h-4 w-4" />
              Connect Admin
            </div>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              One control room for users, partner approvals, jobs, market items, feed moderation, and wallet activity.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              This lives in a separate `connect_admin` app so we can keep extending the main product and the admin side
              together without mixing those concerns.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Highlight title="Realtime aware" body="Auto-refreshes when the main app tables change." />
              <Highlight title="Moderation ready" body="Approve companies and remove risky content fast." />
              <Highlight title="Built to grow" body="We can keep expanding this panel as the app evolves." />
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200/80 bg-white/92 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
            <h2 className="text-2xl font-semibold text-slate-900">Admin sign in</h2>
            <p className="mt-2 text-sm text-slate-500">Use an account whose `users.role` is set to `admin`.</p>
            <form className="mt-8 space-y-5" onSubmit={handleSignIn}>
              <Field label="Email">
                <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@connect.app" required />
              </Field>
              <Field label="Password">
                <input className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:bg-white" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
              </Field>
              {error ? <ErrorBanner message={error} /> : null}
              <button className="w-full rounded-2xl bg-slate-950 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={signingIn}>
                {signingIn ? 'Signing In...' : 'Sign In to Admin'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (adminProfile && adminProfile.role !== 'admin') {
    return (
      <FullScreenMessage
        title="Admin access required"
        body="This account is signed in, but it is not marked as an admin in the users table."
        action={<button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white" onClick={() => void handleSignOut()}>Sign Out</button>}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <div className="rounded-[28px] bg-slate-950 p-5 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-amber-200">
              <ShieldCheck className="h-4 w-4" />
              Control Room
            </div>
            <h1 className="mt-4 text-2xl font-semibold">Connect Admin</h1>
            <p className="mt-2 text-sm text-slate-300">Built to stay aligned with the user app as we keep shipping.</p>
          </div>

          <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
              <img src={adminProfile?.photoURL || 'https://placehold.co/80x80'} alt={adminProfile?.displayName || 'Admin'} className="h-12 w-12 rounded-2xl object-cover" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{adminProfile?.displayName || 'Admin user'}</p>
                <p className="truncate text-sm text-slate-500">{adminProfile?.email || 'Signed in'}</p>
              </div>
            </div>
          </div>

          <nav className="mt-5 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${active ? 'bg-slate-950 text-white' : 'bg-transparent text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="space-y-5">
          <header className="flex flex-col gap-4 rounded-[32px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">Workspace</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                {activeTab === 'overview' ? 'Operations overview' : `${tabs.find((item) => item.id === activeTab)?.label} management`}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                You can manage the product here while we keep improving both apps side by side.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                onClick={() => void refresh()}
                type="button"
                disabled={loadingData}
              >
                <RefreshCw className={`h-4 w-4 ${loadingData ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                onClick={() => void handleSignOut()}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </header>

          {error ? <ErrorBanner message={error} /> : null}
          {actionState ? <InfoBanner message={`${actionState}...`} /> : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Users" value={snapshot.overview.totalUsers} hint={`${snapshot.overview.totalAdmins} admins in the system`} />
            <MetricCard label="Pending Partners" value={snapshot.overview.pendingPartners} hint="Waiting for approval" />
            <MetricCard label="Open Jobs" value={snapshot.overview.openJobs} hint="Currently visible gigs" />
            <MetricCard label="Market Items" value={snapshot.overview.marketItems} hint="Live marketplace listings" />
          </div>

          {activeTab === 'overview' ? (
            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <SectionCard title="Approval queue" subtitle="Latest companies waiting to partner with Connect.">
                <div className="space-y-3">
                  {pendingPartners.length === 0 ? <EmptyState body="No partner requests are waiting right now." /> : null}
                  {pendingPartners.slice(0, 6).map((item) => (
                    <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <img src={item.companyLogoUrl} alt={item.companyName} className="h-12 w-12 rounded-2xl object-cover" />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">{item.companyName}</p>
                              <p className="text-sm text-slate-500">{item.location} • {formatDate(item.createdAt)}</p>
                            </div>
                          </div>
                          <p className="mt-3 line-clamp-2 text-sm text-slate-600">{item.about}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <ActionButton label="Approve" tone="dark" onClick={() => void runAction('Approving partner request', () => adminService.updatePartnerRequestStatus(item.id, 'approved'))} />
                          <ActionButton label="Reject" tone="light" onClick={() => void runAction('Rejecting partner request', () => adminService.updatePartnerRequestStatus(item.id, 'rejected'))} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Quick pulse" subtitle="Fresh activity snapshots from the platform.">
                <QuickList title="Newest users" items={snapshot.users.slice(0, 5).map((user) => ({ title: user.displayName, subtitle: `${user.role} • ${user.email}`, meta: formatDate(user.createdAt) }))} />
                <QuickList title="Newest jobs" items={snapshot.jobs.slice(0, 5).map((job) => ({ title: job.title, subtitle: `${job.category} • ${job.status}`, meta: formatDate(job.createdAt) }))} />
                <QuickList title="Wallet activity" items={snapshot.walletTransactions.slice(0, 5).map((item) => ({ title: `${item.amount} ${item.currency}`, subtitle: `${item.type} • ${item.method} • ${item.status}`, meta: formatDate(item.createdAt) }))} />
              </SectionCard>
            </div>
          ) : null}

          {activeTab === 'users' ? (
            <SectionCard title="Users" subtitle="Latest user accounts from the main app.">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="px-3 py-3 font-medium">User</th>
                      <th className="px-3 py-3 font-medium">Role</th>
                      <th className="px-3 py-3 font-medium">Location</th>
                      <th className="px-3 py-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.users.map((user) => (
                      <tr key={user.uid} className="border-b border-slate-100 last:border-none">
                        <td className="px-3 py-4">
                          <div className="flex items-center gap-3">
                            <img src={user.photoURL} alt={user.displayName} className="h-11 w-11 rounded-2xl object-cover" />
                            <div className="min-w-0">
                              <p className="truncate font-medium text-slate-900">{user.displayName}</p>
                              <p className="truncate text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4"><StatusPill text={user.role} tone={user.role === 'admin' ? 'dark' : 'light'} /></td>
                        <td className="px-3 py-4 text-slate-600">{user.location || 'No location'}</td>
                        <td className="px-3 py-4 text-slate-600">{formatDate(user.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          ) : null}

          {activeTab === 'partners' ? (
            <SectionCard title="Partner requests" subtitle="Approve or reject company onboarding.">
              <div className="grid gap-4">
                {snapshot.partnerRequests.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-4">
                          <img src={item.companyLogoUrl} alt={item.companyName} className="h-14 w-14 rounded-2xl object-cover" />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="truncate text-lg font-semibold text-slate-900">{item.companyName}</h3>
                              <StatusPill text={item.status} tone={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'} />
                            </div>
                            <p className="text-sm text-slate-500">{item.location} • {formatDate(item.createdAt)}</p>
                          </div>
                        </div>
                        <p className="mt-4 text-sm leading-6 text-slate-600">{item.about}</p>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="rounded-full bg-white px-3 py-2">User UID: {item.userUid}</span>
                          <span className="rounded-full bg-white px-3 py-2">Social links: {item.socialLinks.length}</span>
                          <span className="rounded-full bg-white px-3 py-2">Files: {item.registrationUrls.length}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <ActionButton label="Approve" tone="dark" onClick={() => void runAction('Approving partner request', () => adminService.updatePartnerRequestStatus(item.id, 'approved'))} />
                        <ActionButton label="Reject" tone="light" onClick={() => void runAction('Rejecting partner request', () => adminService.updatePartnerRequestStatus(item.id, 'rejected'))} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {activeTab === 'jobs' ? (
            <SectionCard title="Jobs" subtitle="Manage gigs visible on the jobs page.">
              <div className="grid gap-4">
                {snapshot.jobs.map((job) => (
                  <div key={job.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                          <StatusPill text={job.status} tone={job.status === 'open' ? 'success' : 'light'} />
                        </div>
                        <p className="mt-2 text-sm text-slate-500">{job.category} • {job.isRemote ? 'Remote' : 'On-site'} • Budget {job.budget}</p>
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{job.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <ActionButton
                          label={job.status === 'open' ? 'Close Job' : 'Reopen Job'}
                          tone="light"
                          onClick={() =>
                            void runAction(
                              job.status === 'open' ? 'Closing job' : 'Reopening job',
                              () => adminService.updateJobStatus(job.id, job.status === 'open' ? 'closed' : 'open')
                            )
                          }
                        />
                        <DangerButton
                          label="Delete"
                          onClick={() => {
                            if (window.confirm('Delete this job permanently?')) {
                              void runAction('Deleting job', () => adminService.deleteJob(job.id));
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {activeTab === 'market' ? (
            <SectionCard title="Market items" subtitle="Review live marketplace inventory.">
              <div className="grid gap-4">
                {snapshot.marketItems.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                          <StatusPill text={item.category} tone="light" />
                          {item.isAnonymous ? <StatusPill text="Anonymous" tone="warning" /> : null}
                        </div>
                        <p className="mt-2 text-sm text-slate-500">{item.price} {item.priceCurrency} • Stock {item.stockQuantity}</p>
                        <p className="mt-2 text-sm text-slate-500">Seller UID: {item.sellerUid} • {formatDate(item.createdAt)}</p>
                      </div>
                      <DangerButton
                        label="Delete Listing"
                        onClick={() => {
                          if (window.confirm('Delete this market item permanently?')) {
                            void runAction('Deleting market item', () => adminService.deleteMarketItem(item.id));
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {activeTab === 'feed' ? (
            <div className="grid gap-5 xl:grid-cols-2">
              <SectionCard title="Posts" subtitle="Latest feed posts.">
                <div className="space-y-4">
                  {snapshot.posts.map((post) => (
                    <div key={post.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="font-semibold text-slate-900">{post.authorName}</h3>
                            <StatusPill text={post.type} tone="light" />
                          </div>
                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{post.content}</p>
                          <p className="mt-3 text-xs text-slate-500">{formatDate(post.createdAt)}</p>
                        </div>
                        <button
                          className="rounded-2xl border border-rose-200 bg-white p-3 text-rose-700 transition hover:bg-rose-50"
                          onClick={() => {
                            if (window.confirm('Delete this post permanently?')) {
                              void runAction('Deleting post', () => adminService.deletePost(post.id));
                            }
                          }}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Comments" subtitle="Latest feed comments and replies.">
                <div className="space-y-4">
                  {snapshot.comments.map((comment) => (
                    <div key={comment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="font-semibold text-slate-900">{comment.authorName}</h3>
                            <span className="text-xs text-slate-500">Post {comment.postId}</span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{comment.content}</p>
                          <p className="mt-3 text-xs text-slate-500">{formatDate(comment.createdAt)}</p>
                        </div>
                        <button
                          className="rounded-2xl border border-rose-200 bg-white p-3 text-rose-700 transition hover:bg-rose-50"
                          onClick={() => {
                            if (window.confirm('Delete this comment permanently?')) {
                              void runAction('Deleting comment', () => adminService.deleteComment(comment.id));
                            }
                          }}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          ) : null}

          {activeTab === 'wallet' ? (
            <SectionCard title="Wallet transactions" subtitle="Recent balance movement across the platform.">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="px-3 py-3 font-medium">User UID</th>
                      <th className="px-3 py-3 font-medium">Amount</th>
                      <th className="px-3 py-3 font-medium">Type</th>
                      <th className="px-3 py-3 font-medium">Method</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-3 py-3 font-medium">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshot.walletTransactions.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 last:border-none">
                        <td className="px-3 py-4 text-slate-700">{item.userUid}</td>
                        <td className="px-3 py-4 font-medium text-slate-900">{item.amount} {item.currency}</td>
                        <td className="px-3 py-4 text-slate-600">{item.type}</td>
                        <td className="px-3 py-4 text-slate-600">{item.method}</td>
                        <td className="px-3 py-4">
                          <StatusPill text={item.status} tone={item.status === 'completed' ? 'success' : item.status === 'failed' ? 'danger' : 'warning'} />
                        </td>
                        <td className="px-3 py-4 text-slate-600">{formatDate(item.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          ) : null}
        </main>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.08)]">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Highlight({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
    </div>
  );
}

function FullScreenMessage({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-[32px] border border-slate-200/80 bg-white/92 p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-white">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">{body}</p>
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return <div className="rounded-[24px] bg-rose-50 px-5 py-4 text-sm text-rose-700">{message}</div>;
}

function InfoBanner({ message }: { message: string }) {
  return <div className="rounded-[24px] bg-amber-50 px-5 py-4 text-sm text-amber-800">{message}</div>;
}

function EmptyState({ body }: { body: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">
      {body}
    </div>
  );
}

function StatusPill({
  text,
  tone,
}: {
  text: string;
  tone: 'dark' | 'light' | 'success' | 'warning' | 'danger';
}) {
  const styles =
    tone === 'dark'
      ? 'bg-slate-950 text-white'
      : tone === 'success'
      ? 'bg-emerald-100 text-emerald-700'
      : tone === 'warning'
      ? 'bg-amber-100 text-amber-700'
      : tone === 'danger'
      ? 'bg-rose-100 text-rose-700'
      : 'bg-slate-100 text-slate-700';

  return <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${styles}`}>{text}</span>;
}

function ActionButton({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone: 'dark' | 'light';
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
        tone === 'dark' ? 'bg-slate-950 text-white hover:bg-slate-800' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function DangerButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function QuickList({
  title,
  items,
}: {
  title: string;
  items: Array<{ title: string; subtitle: string; meta: string }>;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? <p className="text-sm text-slate-500">Nothing recent here yet.</p> : null}
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="flex items-start justify-between gap-3 rounded-2xl bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">{item.title}</p>
              <p className="truncate text-sm text-slate-500">{item.subtitle}</p>
            </div>
            <span className="shrink-0 text-xs text-slate-400">{item.meta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
