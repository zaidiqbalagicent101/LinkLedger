
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowRight,
  ExternalLink,
  Plus,
  Globe2,
  LayoutGrid,
  Clock3,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { requirePublisherProfile } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const pageStyles = `
.publisher-page {
  --ink: #12211c;
  --muted: #5f6f69;
  --line: #e5eae8;
  --soft: #f6f8f7;
  --accent: #0e7a5a;
  --accent-dark: #0a6149;

  min-height: 100vh;
  background: #fff;
  color: var(--ink);
  font-family: inherit;
  -webkit-font-smoothing: antialiased;
}

.publisher-page * {
  box-sizing: border-box;
}

.publisher-page a {
  color: inherit;
  text-decoration: none;
}

.publisher-page a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 5px;
}

.publisher-wrap {
  width: min(1040px, 100% - 40px);
  margin-inline: auto;
}

/* Header */

.publisher-header {
  border-bottom: 1px solid var(--line);
  background: white;
}

.publisher-header-inner {
  min-height: 68px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.publisher-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -.4px;
}

.publisher-brand-mark {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: var(--accent);
  color: white;
  font-size: 16px;
}

.publisher-nav {
  display: flex;
  align-items: center;
  gap: 24px;
  font-size: 14px;
  color: var(--muted);
}

.publisher-nav a:hover {
  color: var(--ink);
}

/* Main content */

.publisher-content {
  padding-top: 58px;
  padding-bottom: 72px;
}

.publisher-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
  margin-bottom: 36px;
}

.publisher-eyebrow {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.1px;
  text-transform: uppercase;
}

.publisher-heading {
  margin: 0;
  font-size: clamp(30px, 4vw, 38px);
  font-weight: 650;
  letter-spacing: -1.3px;
  line-height: 1.15;
}

.publisher-intro {
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 15.5px;
  line-height: 1.6;
}

/* Buttons */

.publisher-primary-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: var(--accent);
  color: white !important;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  transition: background .15s;
}

.publisher-primary-btn:hover {
  background: var(--accent-dark);
}

/* Website table */

.publisher-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 15px 40px -35px rgba(18, 33, 28, .3);
}

.publisher-table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.publisher-table th {
  padding: 14px 17px;
  background: var(--soft);
  color: var(--muted);
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
}

.publisher-table td {
  padding: 17px;
  border-top: 1px solid var(--line);
  vertical-align: middle;
}

.publisher-table tbody tr {
  transition: background .15s;
}

.publisher-table tbody tr:hover {
  background: #fafcfb;
}

.publisher-website-name {
  display: block;
  margin-bottom: 5px;
  color: var(--ink);
  font-weight: 650;
}

.publisher-website-name:hover {
  color: var(--accent);
}

.publisher-website-url {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--muted) !important;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.publisher-website-url:hover {
  color: var(--accent) !important;
}

.publisher-traffic {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.publisher-services-dropdown > summary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--accent-dark);
  font-size: 13px;
  font-weight: 650;
  white-space: nowrap;
  list-style: none;
}

.publisher-services-dropdown > summary::-webkit-details-marker {
  display: none;
}

.publisher-services-dropdown[open] > summary svg {
  transform: rotate(180deg);
}

.publisher-services-list {
  display: grid;
  gap: 7px;
  min-width: 150px;
  max-width: 230px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}

.publisher-services-list a,
.publisher-services-manage,
.publisher-services-empty {
  color: var(--accent-dark) !important;
  font-size: 12px;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.publisher-services-manage {
  display: inline-block;
  margin-top: 9px;
}

.publisher-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--soft);
  color: var(--muted);
  font-size: 12px;
  font-weight: 650;
  text-transform: capitalize;
  white-space: nowrap;
}

.publisher-status--approved {
  border-color: #cce9dc;
  background: #eaf6f0;
  color: #0a6149;
}

.publisher-status--pending {
  border-color: #f0dfb9;
  background: #fff8e9;
  color: #936313;
}

.publisher-status--rejected {
  border-color: #f0d2d2;
  background: #fff0f0;
  color: #a33d3d;
}

.publisher-edit-link {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--line);
  border-radius: 8px;
  color: var(--muted) !important;
  transition: all .15s;
}

.publisher-edit-link:hover {
  border-color: var(--accent);
  background: #eaf6f0;
  color: var(--accent) !important;
}

/* Empty state */

.publisher-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 310px;
  padding: 40px 20px;
  border: 1px dashed #cfd8d4;
  border-radius: 12px;
  background: #fcfdfc;
  text-align: center;
}

.publisher-empty-icon {
  display: grid;
  place-items: center;
  width: 54px;
  height: 54px;
  margin-bottom: 20px;
  border-radius: 14px;
  background: #e4f3ed;
  color: var(--accent);
}

.publisher-empty h2 {
  margin: 0;
  font-size: 21px;
  font-weight: 650;
  letter-spacing: -.4px;
}

.publisher-empty p {
  margin: 9px 0 22px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
}

.publisher-empty-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--accent) !important;
  font-size: 14px;
  font-weight: 650;
}

.publisher-empty-link:hover {
  color: var(--accent-dark) !important;
}

/* Disclaimer */

.publisher-disclaimer {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 20px;
  color: var(--muted);
  font-size: 12px;
}

@media(max-width: 680px) {
  .publisher-content {
    padding-top: 38px;
    padding-bottom: 48px;
  }

  .publisher-title-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 25px;
  }

  .publisher-primary-btn {
    width: 100%;
  }

  .publisher-nav {
    gap: 15px;
    font-size: 13px;
  }

  .publisher-header-inner {
    min-height: 62px;
  }

  .publisher-brand {
    font-size: 16px;
  }

  .publisher-disclaimer {
    align-items: flex-start;
    line-height: 1.5;
  }
}
`;

export default async function PublisherWebsitesPage() {
  await connection();

  const user = await requirePublisherProfile();

  const websites = await prisma.publisherWebsite.findMany({
    where: {
      publisherProfile: { userId: user.id },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      websiteName: true,
      websiteUrl: true,
      websiteNiche: true,
      monthlyTraffic: true,
      approvalStatus: true,
      createdAt: true,
      services: {
        orderBy: { serviceName: "asc" },
        select: { id: true, serviceName: true },
      },
    },
  });

  return (
    <main className="publisher-page">
      <style dangerouslySetInnerHTML={{ __html: pageStyles }} />

      <header className="publisher-header">
        <div className="publisher-wrap publisher-header-inner">
          <Link className="publisher-brand" href="/" aria-label="LinkLedger home">
            <span className="publisher-brand-mark">L</span>
            <span>LinkLedger</span>
          </Link>

          <nav className="publisher-nav" aria-label="Publisher navigation">
            <Link href="/publisher/dashboard">Dashboard</Link>
            <Link href="/publisher/onboarding">Profile</Link>
          </nav>
        </div>
      </header>

      <section className="publisher-wrap publisher-content">
        <div className="publisher-title-row">
          <div>
            <p className="publisher-eyebrow">Publisher workspace</p>

            <h1 className="publisher-heading">My websites</h1>

            <p className="publisher-intro">
              Manage your publications and review their submission status.
            </p>
          </div>

          <Link
            className="publisher-primary-btn"
            href="/publisher/websites/add"
          >
            <Plus size={17} />
            Add website
          </Link>
        </div>

        {websites.length ? (
          <div className="publisher-table-wrap">
            <table className="publisher-table">
              <thead>
                <tr>
                  <th>Website</th>
                  <th>Niche</th>
                  <th>Monthly traffic</th>
                  <th>Services</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {websites.map((website) => {
                  const status = website.approvalStatus.toLowerCase();

                  return (
                    <tr key={website.id}>
                      <td>
                        <Link
                          className="publisher-website-name"
                          href={`/publisher/websites/${website.id}`}
                        >
                          {website.websiteName}
                        </Link>

                        <a
                          className="publisher-website-url"
                          href={website.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {website.websiteUrl}
                          <ExternalLink size={12} />
                        </a>
                      </td>

                      <td>{website.websiteNiche}</td>

                      <td className="publisher-traffic">
                        {website.monthlyTraffic.toLocaleString()}
                      </td>

                      <td>
                        {website.services.length ? (
                          <details className="publisher-services-dropdown">
                            <summary>
                              {website.services.length} service{website.services.length === 1 ? "" : "s"}
                              <ChevronDown size={14} />
                            </summary>
                            <ul className="publisher-services-list">
                              {website.services.map((service) => (
                                <li key={service.id}>
                                  <Link href={`/publisher/websites/${website.id}/services/${service.id}`}>
                                    {service.serviceName}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            <Link className="publisher-services-manage" href={`/publisher/websites/${website.id}/services`}>
                              Manage services
                            </Link>
                          </details>
                        ) : (
                          <Link className="publisher-services-empty" href={`/publisher/websites/${website.id}/services/add`}>
                            Add first service
                          </Link>
                        )}
                      </td>

                      <td>
                        <span
                          className={`publisher-status publisher-status--${status}`}
                        >
                          {status === "approved" ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <Clock3 size={13} />
                          )}
                          {status}
                        </span>
                      </td>

                      <td>
                        {website.createdAt.toLocaleDateString()}
                      </td>

                      <td>
                        <Link
                          className="publisher-edit-link"
                          href={`/publisher/websites/${website.id}/edit`}
                          title="Edit website"
                          aria-label={`Edit ${website.websiteName}`}
                        >
                          <ArrowRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="publisher-empty">
            <span className="publisher-empty-icon">
              <Globe2 size={25} />
            </span>

            <h2>No websites submitted</h2>

            <p>
              Add your first publication to begin the review process.
            </p>

            <Link
              className="publisher-empty-link"
              href="/publisher/websites/add"
            >
              Add a website
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        <p className="publisher-disclaimer">
          <LayoutGrid size={14} />
          Traffic and domain metrics are self-reported and not independently verified.
        </p>
      </section>
    </main>
  );
}
