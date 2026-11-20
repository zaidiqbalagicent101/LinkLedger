
import Link from "next/link";
import { connection } from "next/server";
import {
  Search,
  UserRound,
  Users,
  ShieldCheck,
  CalendarDays,
  Clock3,
  Inbox,
  ArrowRight,
  Building2,
} from "lucide-react";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

type AdminUsersPageProps = {
  searchParams: Promise<{ q?: string; role?: string }>;
};

const roleSchema = z.enum(["ADMIN", "PUBLISHER", "ADVERTISER"]);

const roleStyles: Record<string, string> = {
  ADMIN: "border-purple-200 bg-purple-50 text-purple-700",
  PUBLISHER: "border-blue-200 bg-blue-50 text-blue-700",
  ADVERTISER: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const statusStyles: Record<string, string> = {
  ACTIVE: "border-green-200 bg-green-50 text-green-700",
  INACTIVE: "border-gray-200 bg-gray-100 text-gray-600",
  SUSPENDED: "border-red-200 bg-red-50 text-red-700",
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
};

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  await connection();

  const params = await searchParams;
  const query = params.q?.trim().slice(0, 120) ?? "";
  const role = roleSchema.safeParse(params.role);

  const users = await prisma.user.findMany({
    where: {
      ...(role.success ? { role: role.data } : {}),
      ...(query
        ? {
            OR: [
              { fullName: { contains: query } },
              { email: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      lastLoginAt: true,
      publisherProfile: { select: { publisherName: true } },
      _count: { select: { sessions: true } },
    },
  });

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-7 sm:py-10 lg:px-9">
      {/* Page Heading */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dcebe3] bg-[#eaf5ef] px-3 py-1 text-[11px] font-semibold text-[#0a6149]">
            <ShieldCheck size={13} />
            Account directory
          </span>

          <h1 className="mt-4 text-[28px] font-semibold tracking-[-1px] text-[#12211c] sm:text-[34px]">
            Manage users
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-[#5f6f69]">
            Search accounts, inspect details, and manage account access.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#e5eae8] bg-white px-4 py-3">
          <Users size={17} className="text-[#0e7a5a]" />
          <span className="text-sm font-semibold tabular-nums text-[#203d33]">
            {users.length}
          </span>
          <span className="text-xs text-[#82918b]">users found</span>
        </div>
      </div>

      {/* Search and Filters */}
      <form
        className="mb-6 flex flex-col gap-3 rounded-xl border border-[#e5eae8] bg-white p-4 sm:flex-row sm:items-center sm:p-5"
        action="/admin/users"
      >
        <label className="relative flex min-h-11 min-w-0 flex-1 items-center">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 text-[#82918b]"
          />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by name or email..."
            className="h-11 w-full rounded-lg border border-[#e5eae8] bg-[#fbfcfb] pl-10 pr-4 text-sm text-[#12211c] outline-none transition-colors placeholder:text-[#a0aaa4] focus:border-[#0e7a5a] focus:bg-white"
          />
        </label>

        <select
          name="role"
          defaultValue={role.success ? role.data : "ALL"}
          aria-label="Filter by role"
          className="h-11 w-full rounded-lg border border-[#e5eae8] bg-white px-3 text-sm text-[#203d33] outline-none transition-colors focus:border-[#0e7a5a] sm:w-[180px]"
        >
          <option value="ALL">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="PUBLISHER">Publisher</option>
          <option value="ADVERTISER">Advertiser</option>
        </select>

        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#0e7a5a] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0a6149]"
          type="submit"
        >
          <Search size={15} />
          Filter users
        </button>
      </form>

      {/* Users Table */}
      {users.length ? (
        <div className="overflow-hidden rounded-xl border border-[#e5eae8] bg-white shadow-[0_8px_30px_-25px_rgba(18,33,28,0.2)]">
          <div className="flex items-center justify-between border-b border-[#e5eae8] px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-sm font-semibold text-[#203d33]">
                User accounts
              </h2>
              <p className="mt-1 text-xs text-[#82918b]">
                Account information and activity
              </p>
            </div>

            <span className="hidden items-center gap-1.5 text-xs text-[#82918b] sm:inline-flex">
              <Users size={14} />
              Latest registrations
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#e5eae8] bg-[#f8faf9]">
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b] sm:px-6">
                    User
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                    Created
                  </th>
                  <th className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                    Last login
                  </th>
                  <th className="px-5 py-3.5 text-right text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#edf1ee]">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-[#fbfcfb]"
                  >
                    {/* User */}
                    <td className="max-w-[280px] px-5 py-4 sm:px-6">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-[#eaf5ef] text-[#0e7a5a]">
                          <UserRound size={17} />
                        </div>

                        <div className="min-w-0">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="block break-words text-[13px] font-semibold text-[#203d33] transition-colors hover:text-[#0e7a5a]"
                          >
                            {user.fullName}
                          </Link>

                          <p className="mt-1 break-all text-[11px] text-[#82918b]">
                            {user.email}
                          </p>

                          {user.publisherProfile && (
                            <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#0e7a5a]">
                              <Building2 size={11} />
                              {user.publisherProfile.publisherName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                          roleStyles[user.role] ??
                          "border-gray-200 bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.role.toLowerCase()}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                          statusStyles[user.status] ??
                          "border-gray-200 bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {user.status.toLowerCase()}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] text-[#5f6f69]">
                        <CalendarDays
                          size={13}
                          className="text-[#a0aaa4]"
                        />
                        {user.createdAt.toLocaleDateString()}
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] text-[#5f6f69]">
                        <Clock3 size={13} className="text-[#a0aaa4]" />
                        {user.lastLoginAt?.toLocaleDateString() ?? "Never"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        title="View user"
                        aria-label={`View ${user.fullName}`}
                        className="inline-flex size-9 items-center justify-center rounded-lg border border-[#e5eae8] text-[#5f6f69] transition-all hover:border-[#b8d9cb] hover:bg-[#eaf5ef] hover:text-[#0e7a5a]"
                      >
                        <ArrowRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#e5eae8] bg-[#fbfcfb] px-5 py-3.5 sm:px-6">
            <p className="text-[11px] leading-relaxed text-[#82918b]">
              Showing up to 100 matching users. Password hashes are never
              selected for this view.
            </p>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-xl border border-dashed border-[#cbd7cf] bg-white px-6 py-14 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#eaf5ef] text-[#0e7a5a]">
            <Inbox size={27} />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-[#12211c]">
            No users found
          </h2>

          <p className="mx-auto mt-2 max-w-[360px] text-sm leading-relaxed text-[#78847e]">
            No accounts match your current search or role filter. Try changing
            your search criteria.
          </p>

          <Link
            href="/admin/users"
            className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#e5eae8] px-4 text-sm font-semibold text-[#0e7a5a] transition-colors hover:bg-[#eaf5ef]"
          >
            View all users
            <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </section>
  );
}
