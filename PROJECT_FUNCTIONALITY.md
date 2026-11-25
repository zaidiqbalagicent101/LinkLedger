# LinkLedger — Project Functionality

## Overview

LinkLedger is a role-based marketplace that connects advertisers with publishers for sponsored content and link-building services.

The application currently supports three account types:

- **Advertiser** — discovers publisher websites and services, makes direct purchases, sends custom collaboration requests, and tracks requests and orders.
- **Publisher** — completes a publisher profile, submits websites for review, creates publishing services, and manages incoming collaboration requests.
- **Administrator** — reviews website submissions, manages user account statuses, and monitors platform activity.
 
## Technology

- Next.js 16.4.6 with the App Router
- React 19.3.0
- TypeScript
- Prisma 7.10.1 with MySQL/MariaDB
- Zod for form and server-action validation
- bcryptjs for password hashing
- iron-session for encrypted HTTP-only session cookies
- Tailwind-style utility classes and custom CSS
- lucide-react icons

## Authentication and Accounts

- Separate registration flows are available for advertisers and publishers.
- Registration validates and securely hashes passwords.
- Login verifies the email and password and checks whether the account is active.
- Successful login creates or replaces a database-backed session.
- Sessions expire after one day or thirty days when “Remember me” is selected.
- The session is stored in an encrypted, HTTP-only cookie.
- Logout removes the session and clears the cookie.
- Active sessions are validated for both existence and account status on protected requests.
- The account dashboard and access checks redirect users according to their role.
- A publisher must complete a valid publisher profile before continuing to most publisher features.

## Roles and Route Protection

Server-side authorization checks protect actions and pages based on the signed-in role:

- `ADVERTISER` — advertiser marketplace, requests, and order pages
- `PUBLISHER` — publisher profile, websites, services, and collaboration requests
- `ADMIN` — administration dashboard, website reviews, and user management

Inactive accounts are rejected at login and active database sessions are removed when an administrator deactivates a user.

## Publisher Profile

Publishers can create or update profile information, including:

- Publisher name
- Business name
- Country
- Contact number
- Profile description

A completed profile is required for normal publisher access. The profile is stored in `PublisherProfile` and linked one-to-one with the publisher user.

## Publisher Website Management

Publishers can:

- Submit a new website
- View all submitted websites
- Open a website detail page
- Edit website information
- Track the website approval status
- View rejection reasons where applicable

Submitted website data includes:

- Website name and URL
- Niche
- Monthly traffic
- Language
- Target audience country
- Description
- Optional website logo
- Optional domain rating
- Optional domain authority

Every new or edited website starts with or returns to `PENDING` approval. Website URLs must be unique. Editing a previously reviewed website clears the previous review result and sends it back for administrator review.

## Website Approval Workflow

A website has one of these approval states:

- `PENDING`
- `APPROVED`
- `REJECTED`

Administrators can:

- View all pending, approved, and rejected websites
- Open individual website detail pages
- Approve a website
- Reject a website with a rejection reason
- Review website and publisher information before a decision

Each review is stored as a `WebsiteReview` record, linked to the administrator and the submitted website. Re-review information is also copied back to the publisher website record.

Only approved publisher websites can provide active services in the advertiser marketplace.

## Publisher Services and Pricing

Publishers can add and manage services for each approved or submitted website.

Supported service types:

- Guest post
- Sponsored article
- Link insertion
- Banner advertisement

Each service can include:

- Service name and description
- Price and ISO-style currency
- Delivery time in days
- Whether content writing is included
- Dofollow, nofollow, both, or not applicable link type
- Maximum number of links
- Homepage-link availability
- Publishing guidelines
- Additional conditions

Publishers can:

- Create a service
- View service details
- Edit a service
- Activate or deactivate a service
- Archive a service

Archived services are marked inactive. Deactivated or archived services do not appear as available marketplace listings.

## Advertiser Marketplace

Advertisers can browse active publishing services offered through approved publisher websites.

Marketplace listings can be filtered by:

- Website or service search text
- Country
- Language
- Content type/service type
- Link type
- Minimum/maximum price
- Currency
- Minimum monthly traffic
- Minimum domain rating
- Minimum domain authority

The marketplace also exposes a dedicated website detail page showing publisher website information and the active services belonging to that website.

## Direct Purchases

An advertiser can purchase an active service directly from the marketplace.

The purchase action:

1. Checks the signed-in role and validates the service ID and UUID idempotency key.
2. Confirms that the service is active, not archived, and belongs to an approved website.
3. Creates an order snapshot so later publisher, website, or service edits do not change the original purchase terms.
4. Creates the order as `CONFIRMED` with payment status `PENDING`.
5. Uses the idempotency key to prevent duplicate purchase records.

The snapshot stores the website details, service details, price, currency, delivery time, content-writing option, link type, link limits, homepage-link availability, publishing guidelines, and additional conditions.

## Direct Order Tracking

Advertisers can view:

- A list of their direct and custom orders
- Individual order details
- Order status
- Payment status
- The agreed and/or original service terms

The order status model supports:

- `CONFIRMED`
- `IN_PROGRESS`
- `CONTENT_SUBMITTED`
- `REVISION_REQUESTED`
- `APPROVED`
- `PUBLISHED`
- `COMPLETED`
- `CANCELLATION_REQUESTED`
- `CANCELLED`

Payment status supports:

- `PENDING`
- `PAID`
- `REFUNDED`

The order model also records order source, cancellation history, published date, and completion date. Order snapshots preserve the commercial terms at the time of purchase or deal acceptance.

## Custom Collaboration Requests

Advertisers can send a custom request for a specific publisher service from the marketplace website detail flow or related service flow.

A request captures:

- Publisher website and service snapshots
- Original price and currency
- Topic
- Target URL
- Anchor text
- Proposed budget and currency
- Content requirements
- Additional instructions

A custom request is stored separately from an order. It can later be converted into a linked order after acceptance through the collaboration/deal workflow.

## Collaboration Negotiation Workflow

A collaboration request moves through these states:

- `PENDING`
- `ACCEPTED`
- `REJECTED`
- `NEGOTIATION`
- `CANCELLED`

### Publisher actions

A publisher can:

- View incoming requests
- Open an individual request
- Accept a request
- Reject a request
- Enter negotiation mode
- Set a revised price and currency
- Add revised terms and a response

Publishers can only respond to a pending request belonging to their own website.

### Advertiser actions

An advertiser can:

- View all sent requests
- Open request details
- Cancel a pending or negotiation request
- Accept a publisher’s revised proposal
- Reject a publisher’s revised proposal

When the publisher proposes revised terms, the advertiser decision is limited to requests that are in `NEGOTIATION` and belong to that advertiser.

## Administrator Capabilities

The admin workspace includes:

- An admin dashboard
- User list and filtering
- Individual user detail pages
- Website list and filtering
- Pending, approved, and rejected website pages
- Individual website review pages

Administrators can:

- Activate or deactivate users
- Search and filter users by role or account status
- Search and filter websites by status or text criteria
- Approve or reject websites
- Record rejection reasons
- Review account, website, and publishing activity

An administrator cannot deactivate their own admin account.

## Main Application Routes

### Public and shared

- `/` — landing page
- `/login` — login
- `/register/advertiser` — advertiser registration
- `/register/publisher` — publisher registration

### Publisher

- `/publisher/dashboard` — publisher dashboard
- `/publisher/onboarding` — publisher profile setup
- `/publisher/websites` — website management
- `/publisher/websites/add` — add a website
- `/publisher/websites/[websiteId]` — website details
- `/publisher/websites/[websiteId]/edit` — edit a website
- `/publisher/websites/[websiteId]/services` — service list
- `/publisher/websites/[websiteId]/services/add` — add a service
- `/publisher/websites/[websiteId]/services/[serviceId]` — service details
- `/publisher/websites/[websiteId]/services/[serviceId]/edit` — edit a service
- `/publisher/requests` — incoming collaboration requests
- `/publisher/requests/[requestId]` — request decision page

### Advertiser

- `/advertiser/dashboard` — advertiser dashboard
- `/advertiser/marketplace` — marketplace search and filters
- `/advertiser/marketplace/[websiteId]` — website and service detail
- `/advertiser/requests` — sent collaboration requests
- `/advertiser/orders` — order list
- `/advertiser/orders/[id]` — order details

### Administrator

- `/admin/dashboard` — admin overview
- `/admin/users` — user management
- `/admin/users/[userId]` — user detail
- `/admin/websites` — all submitted websites
- `/admin/websites/pending` — pending submissions
- `/admin/websites/approved` — approved submissions
- `/admin/websites/rejected` — rejected submissions
- `/admin/websites/[websiteId]` — website review detail

## Database and Relations

LinkLedger uses MySQL/MariaDB through Prisma. The datasource is configured with `provider = "mysql"`, and Prisma generates the typed database client in `generated/prisma`.

### Database Tables

| Prisma model | Physical table | Purpose |
|---|---|---|
| `User` | `users` | Stores advertisers, publishers, and administrators, including login credentials and account status. |
| `Session` | `sessions` | Stores database-backed login sessions and their expiry. |
| `PublisherProfile` | `publisher_profiles` | Stores the completed profile belonging to a publisher account. |
| `PublisherWebsite` | `publisher_websites` | Stores publisher website submissions and admin approval status. |
| `WebsiteReview` | `website_reviews` | Stores a permanent history of administrator decisions for websites. |
| `PublisherService` | `publisher_services` | Stores publishing services and pricing offered for a website. |
| `CollaborationRequest` | `collaboration_requests` | Stores custom requests and negotiated deals between advertisers and publishers. |
| `Order` | `orders` | Stores direct purchases and accepted custom deals with commercial snapshots. |

### User and Session

#### `User`

Main fields:

- `id` — unique CUID primary key
- `fullName` — user's display name
- `email` — unique login email
- `password` — bcrypt password hash
- `role` — `ADVERTISER`, `PUBLISHER`, or `ADMIN`
- `status` — `ACTIVE` or `INACTIVE`
- `country`
- `lastLoginAt`
- `createdAt` and `updatedAt`

Relations:

- A user has zero or one `PublisherProfile`.
- A user can have many `Session` records.
- A user can submit many `CollaborationRequest` records as an advertiser.
- A user can place many `Order` records as an advertiser.
- An admin user can review many `PublisherWebsite` records.
- An admin user can create many `WebsiteReview` records.

Deleting a user deletes its related sessions and publisher profile. Advertiser requests and orders use restricted deletion to preserve transaction records.

#### `Session`

Main fields:

- `id` — CUID session identifier
- `userId` — owner of the session
- `expiresAt` — session expiration date
- `createdAt`

Relationship:

- `Session.userId` references `User.id`.
- Deleting the user cascades and deletes all of its sessions.

Indexes support quick lookup by user and expiry time. Inactive users have their sessions removed.

### Publisher Data

#### `PublisherProfile`

Main fields:

- `publisherName`
- `businessName`
- Optional `contactNumber`
- `country`
- `description`
- Optional `profileImage`
- `createdAt` and `updatedAt`

Relationship:

- One `PublisherProfile` belongs to exactly one `User`.
- `PublisherProfile.userId` is unique, making the relationship one-to-one.
- A publisher profile can own many `PublisherWebsite` records.
- Deleting the publisher profile cascades and deletes its owned websites.

#### `PublisherWebsite`

Main fields:

- `publisherProfileId` — owning publisher profile
- `websiteName` and unique `websiteUrl`
- `websiteNiche`, `monthlyTraffic`, `websiteLanguage`, and `targetAudienceCountry`
- `websiteDescription`
- Optional `websiteLogo`, `domainRating`, and `domainAuthority`
- `metricsVerified`
- `approvalStatus` — `PENDING`, `APPROVED`, or `REJECTED`
- Optional `rejectionReason`, `reviewedAt`, and `reviewedById`

Relationships:

- Belongs to one `PublisherProfile` through `publisherProfileId`.
- Cascades from `PublisherProfile` deletion.
- May be reviewed by one admin through `reviewedById`.
- Can have many `WebsiteReview` history records.
- Can have many `PublisherService` records.
- Can participate in many `CollaborationRequest` and `Order` records.

When the review relationship is removed, `reviewedById` is set to `null`; deleting the website cascades into its reviews and owned services. `CollaborationRequest` and `Order` relations use `SetNull` so snapshot records remain available even if a website is deleted.

#### `PublisherService`

Main fields:

- `publisherWebsiteId` — owning website
- `serviceName` and `serviceType`
- `price` and three-letter `currency`
- `deliveryTimeDays`
- `contentWritingIncluded`
- `linkType` — `DOFOLLOW`, `NOFOLLOW`, `BOTH`, or `NOT_APPLICABLE`
- Optional `maximumLinks`
- `homepageLinkAvailable`
- `description`
- Optional `publishingGuidelines` and `additionalConditions`
- `isActive`
- Optional `archivedAt`

Relationships:

- Belongs to one `PublisherWebsite`.
- Deleting a website cascades and deletes its services.
- Can have many collaboration requests and orders.
- When a service is deleted, related requests and orders keep their snapshot data while their service foreign key is set to `null`.

### Website Review

#### `WebsiteReview`

Main fields:

- `publisherWebsiteId`
- `adminId`
- `status` — the approval decision
- Optional `rejectionReason`
- `reviewedAt`

Relationships:

- Belongs to one `PublisherWebsite`; deleting the website cascades and deletes review history.
- Belongs to one admin `User` through `adminId`.
- Admin deletion is restricted because review records must not be silently removed.

This table provides an audit trail even though the latest decision is also stored directly on `PublisherWebsite`.

### Collaboration and Orders

#### `CollaborationRequest`

Main fields:

- `advertiserId` — requesting advertiser
- Optional `publisherWebsiteId` and `publisherServiceId`
- Website and service snapshot fields
- Original price and currency
- Topic, target URL, and anchor text
- Proposed budget and currency
- Content requirements and additional instructions
- `status` — `PENDING`, `ACCEPTED`, `REJECTED`, `NEGOTIATION`, or `CANCELLED`
- Publisher response, revised price/currency/terms, and negotiation timestamps
- Optional cancellation/completion timestamps
- Optional unique `dealId`

Relationships:

- Belongs to one advertiser `User`; advertiser deletion is restricted.
- May reference one `PublisherWebsite` or one `PublisherService`; deletion sets these foreign keys to `null`.
- Snapshot fields preserve the website and service terms even after source records change or are removed.
- Can have one related `Order`.

#### `Order`

Main fields:

- Unique `idempotencyKey`, preventing duplicate direct purchases
- `source` — `DIRECT_PURCHASE` or `CUSTOM_DEAL`
- `status` — confirmed through completed/cancelled lifecycle states
- `paymentStatus` — `PENDING`, `PAID`, or `REFUNDED`
- Advertiser, website, service, and custom-request foreign keys
- Complete website and service snapshots
- Original and agreed commercial terms
- Topic, target URL, anchor text, content requirements, and instructions
- Cancellation reason and response history
- Published and completed timestamps

Relationships:

- Belongs to one advertiser `User`; advertiser deletion is restricted.
- May reference one `PublisherWebsite`; deleting the website sets it to `null`.
- May reference one `PublisherService`; deleting the service sets it to `null`.
- May reference one `CollaborationRequest` through unique `customRequestId`; deleting the request sets it to `null`.
- The collaboration request can have exactly one matching order through the reverse `Order` relation.

### Enum Types

The schema defines these database enum types:

- `UserRole`: `ADVERTISER`, `ADMIN`, `PUBLISHER`
- `AccountStatus`: `ACTIVE`, `INACTIVE`
- `WebsiteApprovalStatus`: `PENDING`, `APPROVED`, `REJECTED`
- `PublisherServiceType`: `GUEST_POST`, `SPONSORED_ARTICLE`, `LINK_INSERTION`, `BANNER_ADVERTISEMENT`
- `ServiceLinkType`: `DOFOLLOW`, `NOFOLLOW`, `BOTH`, `NOT_APPLICABLE`
- `CollaborationRequestStatus`: `PENDING`, `ACCEPTED`, `REJECTED`, `NEGOTIATION`, `CANCELLED`
- `OrderSource`: `DIRECT_PURCHASE`, `CUSTOM_DEAL`
- `OrderStatus`: `CONFIRMED`, `IN_PROGRESS`, `CONTENT_SUBMITTED`, `REVISION_REQUESTED`, `APPROVED`, `PUBLISHED`, `COMPLETED`, `CANCELLATION_REQUESTED`, `CANCELLED`
- `PaymentStatus`: `PENDING`, `PAID`, `REFUNDED`

### Database Relationship Summary

```text
User 1 ── 0..1 PublisherProfile
User 1 ── * Session
User 1 ── * CollaborationRequest (as advertiser)
User 1 ── * Order (as advertiser)
User 1 ── * PublisherWebsite (as reviewing admin)
User 1 ── * WebsiteReview (as reviewing admin)

PublisherProfile 1 ── * PublisherWebsite
PublisherWebsite 1 ── * PublisherService
PublisherWebsite 1 ── * WebsiteReview
PublisherWebsite 1 ── * CollaborationRequest
PublisherWebsite 1 ── * Order

PublisherService 1 ── * CollaborationRequest
PublisherService 1 ── * Order
CollaborationRequest 1 ── 0..1 Order
```

### Database Integrity Rules

- `User.email` and `PublisherWebsite.websiteUrl` are unique.
- `PublisherProfile.userId` is unique, enforcing one profile per publisher.
- `Order.idempotencyKey` is unique to prevent duplicate purchases.
- `CollaborationRequest.dealId` and `Order.customRequestId` are unique where populated.
- Website URLs, request IDs, service IDs, and order IDs use CUID-style Prisma identifiers where applicable.
- Composite indexes optimize queries for publisher websites, service status, user activity, order status, payment status, and review/request history.
- Snapshot fields on collaboration requests and orders preserve historical marketplace data rather than dynamically depending on later edits.

### Prisma Migrations

Checked-in migrations correspond to the platform modules:

- `20261119104204_linkledger` — initial LinkLedger schema and core authentication/content models.
- `20261119112511_publisher_admin_module` — publisher profiles and administrator website review models.
- `20261120055929_publisher_services_pricing` — publisher service and pricing functionality.
- `20261120065232_collaboration_requests` — custom collaboration requests and negotiation fields.
- `20261120093658_direct_orders_custom_deals` — direct orders and custom-deal support.
- `20261120093822_order_cancellation_history` — order cancellation and history fields.

## Data Model Summary

The database entities are `User`, `Session`, `PublisherProfile`, `PublisherWebsite`, `WebsiteReview`, `PublisherService`, `CollaborationRequest`, and `Order`. The schema combines relational ownership with historical snapshots so direct purchases and custom deals remain traceable when source website or service information changes.
