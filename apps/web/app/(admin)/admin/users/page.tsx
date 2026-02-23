'use client';

import { trpc } from '@cronkwaters/trpc/client/react';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  HardDrive,
  Loader2,
  MoreVertical,
  Music4,
  Search,
  Shield,
  Users,
  UserX,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type SortField = 'createdAt' | 'name' | 'email' | 'subscriptionTier';
type SortOrder = 'asc' | 'desc';
type TierFilter = 'all' | 'free' | 'creator' | 'studio';

function UserRow({ user, onSelect }: { user: any; onSelect: (id: string) => void }) {
  const [showMenu, setShowMenu] = useState(false);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'studio':
        return {
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
        };
      case 'creator':
        return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' };
      default:
        return { bg: 'bg-zinc-500/20', text: 'text-zinc-400', border: 'border-zinc-500/30' };
    }
  };

  const tierStyle = getTierColor(user.subscriptionTier);

  return (
    <tr className="group border-b border-white/5 transition-colors hover:bg-white/2">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {user.image ? (
            <img src={user.image} alt="" className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-red-500 text-sm font-medium text-white">
              {user.name?.[0] || user.email?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{user.name || 'No name'}</span>
              {user.isOwner && (
                <span title="Platform Owner">
                  <Crown className="h-4 w-4 text-amber-400" />
                </span>
              )}
            </div>
            <span className="text-sm text-zinc-500">{user.email}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
        >
          {user.subscriptionTier === 'studio' && <Shield className="h-3 w-3" />}
          {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            user.subscriptionStatus === 'active'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-zinc-500/20 text-zinc-400'
          }`}
        >
          {user.subscriptionStatus || 'none'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-zinc-400">
        <div className="flex items-center gap-4">
          <span title="Songs" className="flex items-center gap-1">
            <Music4 className="h-3.5 w-3.5" /> {user._count?.songs || 0}
          </span>
          <span title="Posts" className="flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" /> {user._count?.authoredPosts || 0}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-zinc-400">
        <div className="flex items-center gap-3">
          <span title="AI Requests" className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" /> {user.aiRequestsUsed || 0}
          </span>
          <span title="Storage" className="flex items-center gap-1">
            <HardDrive className="h-3.5 w-3.5" /> {Number(user.storageUsedGB || 0).toFixed(2)}GB
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-zinc-400">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-lg p-2 opacity-0 transition-all hover:bg-white/10 group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4 text-zinc-400" />
          </button>

          <>
            {showMenu && (
              <div
                className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border"
                style={{
                  background: 'rgba(20, 20, 25, 0.98)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                }}
              >
                <Link
                  href={`/admin/users/${user.id}`}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/10"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Link>
                <button
                  onClick={() => onSelect(user.id)}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/10"
                >
                  <Edit className="h-4 w-4" />
                  Edit User
                </button>
                <div className="border-t border-white/10" />
                <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10">
                  <UserX className="h-4 w-4" />
                  Suspend User
                </button>
              </div>
            )}
          </>
        </div>
      </td>
    </tr>
  );
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState<TierFilter>('all');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data, isLoading, refetch } = trpc.admin.getUsers.useQuery({
    page,
    limit: 20,
    search: search || undefined,
    tier,
    sortBy,
    sortOrder,
  });

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-sm text-zinc-500">View and manage all platform users</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10">
            <Download className="h-4 w-4" />
            Export Users
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 transition-colors focus:border-orange-500/50 focus:outline-hidden"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
              showFilters
                ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                : 'border-white/10 text-white hover:bg-white/5'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {tier !== 'all' && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                1
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <>
        {showFilters && (
          <div
            className="overflow-hidden rounded-xl border"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)',
              borderColor: 'rgba(255, 255, 255, 0.06)',
            }}
          >
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-400">
                    Subscription Tier
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'free', 'creator', 'studio'] as TierFilter[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTier(t)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          tier === t
                            ? 'bg-orange-500 text-white'
                            : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>

      {/* Stats Bar */}
      {data && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div
            className="rounded-xl border p-4"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.06)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <p className="text-sm text-zinc-500">Total Users</p>
            <p className="text-2xl font-bold text-white">{data.pagination.total}</p>
          </div>
          <div
            className="rounded-xl border p-4"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.06)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <p className="text-sm text-zinc-500">Current Page</p>
            <p className="text-2xl font-bold text-white">
              {data.pagination.page} / {data.pagination.totalPages}
            </p>
          </div>
          <div
            className="rounded-xl border p-4"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.06)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <p className="text-sm text-zinc-500">Per Page</p>
            <p className="text-2xl font-bold text-white">{data.pagination.limit}</p>
          </div>
          <div
            className="rounded-xl border p-4"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.06)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            <p className="text-sm text-zinc-500">Filter Active</p>
            <p className="text-2xl font-bold text-white">{tier !== 'all' ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className="overflow-hidden rounded-xl border"
        style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr
                className="border-b border-white/10"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white"
                  >
                    User
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('subscriptionTier')}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white"
                  >
                    Tier
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Status
                  </span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Content
                  </span>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Usage
                  </span>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white"
                  >
                    Joined
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                      <span className="text-zinc-500">Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-zinc-600" />
                    <p className="mt-2 text-zinc-500">No users found</p>
                  </td>
                </tr>
              ) : (
                data?.users.map((user) => (
                  <UserRow key={user.id} user={user} onSelect={setSelectedUserId} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500">
            Showing {(data.pagination.page - 1) * data.pagination.limit + 1} to{' '}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
            {data.pagination.total} users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (data.pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= data.pagination.totalPages - 2) {
                  pageNum = data.pagination.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      page === pageNum
                        ? 'bg-orange-500 text-white'
                        : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(Math.min(data.pagination.totalPages, page + 1))}
              disabled={page === data.pagination.totalPages}
              className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
