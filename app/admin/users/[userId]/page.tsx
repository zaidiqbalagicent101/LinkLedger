
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowLeft,
  ExternalLink,
  UserRound,
  ShieldCheck,
  CalendarDays,
  Clock3,
  Globe2,
  Building2,
  Phone,
  Mail,
  FileText,
  Globe,
  Inbox,
} from "lucide-react";
import { notFound } from "next/navigation";
import { AdminUserStatusForm } from "@/components/admin/AdminUserStatusForm";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AdminUserPageProps = {
  params: Promise<{ userId: string }>;
};

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

const websiteStatusStyles: Record<string, string> = {
  APPROVED: "border-green-200 bg-green-50 text-green-700",
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
};

export default async function AdminUserDetailsPage({
  params,
}: AdminUserPageProps) {
  await connection();

  const admin = await requireRole("ADMIN");
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      country: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      publisherProfile: {
        include: {
          websites: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              websiteName: true,
              websiteUrl: true,
              approvalStatus: true,
              createdAt: true,
            },
          },
        },
      },
    },
  });

  if (!user) notFound();

  return (
    <section className="mx-auto w-full max-w-[1200px] px-5 py-8 sm:px-7 sm:py-10 lg:px-9">
      {/* Back Navigation */}
      <Link
        href="/admin/users"
        className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-[#5f6f69] transition-colors hover:text-[#0e7a5a]"
      >
        <ArrowLeft size={16} />
        Manage users
      </Link>

      {/* Page Heading */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dcebe3] bg-[#eaf5ef] px-3 py-1 text-[11px] font-semibold text-[#0a6149]">
            <ShieldCheck size={13} />
            User account
          </span>

          <h1 className="mt-4 break-words text-[28px] font-semibold tracking-[-1px] text-[#12211c] sm:text-[34px]">
            {user.fullName}
          </h1>

          <p className="mt-2 flex items-center gap-2 break-all text-sm text-[#5f6f69]">
            <Mail size={15} className="shrink-0 text-[#82918b]" />
            {user.email}
          </p>
        </div>

        <span
          className={`inline-flex w-fit items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${
            roleStyles[user.role] ??
            "border-gray-200 bg-gray-100 text-gray-600"
          }`}
        >
          {user.role.toLowerCase()}
        </span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* Account Details */}
        <section className="overflow-hidden rounded-xl border border-[#e5eae8] bg-white shadow-[0_8px_30px_-25px_rgba(18,33,28,0.2)]">
          <div className="flex items-center gap-3 border-b border-[#e5eae8] px-5 py-4 sm:px-6">
            <div className="grid size-10 place-items-center rounded-lg bg-[#eaf5ef] text-[#0e7a5a]">
              <UserRound size={19} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-[#203d33]">
                Account details
              </h2>
              <p className="mt-0.5 text-xs text-[#82918b]">
                User information and account activity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                Account status
              </p>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                  statusStyles[user.status] ??
                  "border-gray-200 bg-gray-100 text-gray-600"
                }`}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {user.status.toLowerCase()}
              </span>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                Country
              </p>
              <p className="flex items-center gap-2 text-sm font-medium text-[#203d33]">
                <Globe2 size={15} className="text-[#82918b]" />
                {user.country}
              </p>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                Created
              </p>
              <p className="flex items-center gap-2 text-sm text-[#5f6f69]">
                <CalendarDays size={15} className="text-[#82918b]" />
                {user.createdAt.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                Last updated
              </p>
              <p className="flex items-center gap-2 text-sm text-[#5f6f69]">
                <Clock3 size={15} className="text-[#82918b]" />
                {user.updatedAt.toLocaleString()}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                Last login
              </p>
              <p className="flex items-center gap-2 text-sm text-[#5f6f69]">
                <Clock3 size={15} className="text-[#82918b]" />
                {user.lastLoginAt?.toLocaleString() ?? "Never"}
              </p>
            </div>
          </div>

          <div className="border-t border-[#e5eae8] bg-[#fbfcfb] p-5 sm:p-6">
            <h3 className="mb-1 text-sm font-semibold text-[#203d33]">
              Manage account access
            </h3>
            <p className="mb-4 text-xs leading-relaxed text-[#82918b]">
              Update this user's account status using the controls below.
            </p>

            <AdminUserStatusForm
              userId={user.id}
              status={user.status}
              isSelf={admin.id === user.id}
            />
          </div>
        </section>

        {/* Publisher Profile */}
        {user.publisherProfile && (
          <section className="overflow-hidden rounded-xl border border-[#e5eae8] bg-white shadow-[0_8px_30px_-25px_rgba(18,33,28,0.2)]">
            <div className="flex items-center gap-3 border-b border-[#e5eae8] px-5 py-4 sm:px-6">
              <div className="grid size-10 place-items-center rounded-lg bg-[#eaf5ef] text-[#0e7a5a]">
                <Building2 size={19} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#203d33]">
                  Publisher profile
                </h2>
                <p className="mt-0.5 text-xs text-[#82918b]">
                  Business and publisher information
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                  Publisher name
                </p>
                <p className="text-sm font-semibold text-[#203d33]">
                  {user.publisherProfile.publisherName}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                  Business name
                </p>
                <p className="text-sm text-[#5f6f69]">
                  {user.publisherProfile.businessName ?? "Not provided"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                  Country
                </p>
                <p className="flex items-center gap-2 text-sm text-[#5f6f69]">
                  <Globe2 size={14} className="text-[#82918b]" />
                  {user.publisherProfile.country}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                  Contact
                </p>
                <p className="flex items-center gap-2 text-sm text-[#5f6f69]">
                  <Phone size={14} className="text-[#82918b]" />
                  {user.publisherProfile.contactNumber ?? "Not provided"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[1px] text-[#82918b]">
                  Description
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#5f6f69]">
                  {user.publisherProfile.description}
                </p>
              </div>
            </div>

            {/* Publisher Websites */}
            <div className="border-t border-[#e5eae8]">
              <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
                <div>
                  <h3 className="text-sm font-semibold text-[#203d33]">
                    Submitted websites
                  </h3>
                  <p className="mt-1 text-xs text-[#82918b]">
                    Publisher website directory
                  </p>
                </div>

                <span className="rounded-full bg-[#eaf5ef] px-2.5 py-1 text-xs font-semibold tabular-nums text-[#0a6149]">
                  {user.publisherProfile.websites.length}
                </span>
              </div>

              {user.publisherProfile.websites.length ? (
                <ul className="divide-y divide-[#edf1ee]">
                  {user.publisherProfile.websites.map((website) => (
                    <li
                      key={website.id}
                      className="flex flex-col justify-between gap-3 px-5 py-4 transition-colors hover:bg-[#fbfcfb] sm:flex-row sm:items-center sm:px-6"
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/admin/websites/${website.id}`}
                          className="inline-flex max-w-full items-center gap-1.5 break-words text-sm font-semibold text-[#203d33] transition-colors hover:text-[#0e7a5a]"
                        >
                          {website.websiteName}
                          <ExternalLink
                            size={13}
                            className="shrink-0 text-[#82918b]"
                          />
                        </Link>

                        <a
                          href={website.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block break-all text-xs text-[#82918b] transition-colors hover:text-[#0e7a5a]"
                        >
                          {website.websiteUrl}
                        </a>

                        <p className="mt-1 text-[11px] text-[#a0aaa4]">
                          Submitted {website.createdAt.toLocaleDateString()}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit shrink-0 items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                          websiteStatusStyles[website.approvalStatus] ??
                          "border-gray-200 bg-gray-100 text-gray-600"
                        }`}
                      >
                        {website.approvalStatus.toLowerCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-5 pb-7 pt-3 text-center sm:px-6">
                  <div className="mx-auto grid size-11 place-items-center rounded-xl bg-[#f1f5f2] text-[#82918b]">
                    <Inbox size={21} />
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#5f6f69]">
                    No websites submitted.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
