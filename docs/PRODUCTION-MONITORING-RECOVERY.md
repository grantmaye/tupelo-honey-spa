# Production Monitoring and Recovery

**System:** Tupelo Honey Spa digital platform  
**Operational owner:** M1 Software  
**Status:** Open implementation program  
**Last updated:** July 20, 2026

## Confirmed production baseline

- The public Next.js application is live on Vercel.
- Square Production is the system of record for bookings, payments, and digital gift cards.
- A controlled true-card website booking completed successfully end to end on July 20, 2026.
- A controlled production gift-card transaction completed successfully end to end on July 20, 2026.
- WordPress remains the editorial CMS at `cms.tupelohoneyspa.com`.
- Cloudflare is authoritative DNS; the domain remains client-owned.
- DMARC is in monitoring mode and DNSSEC has not yet been completed.
- Durable alerting, cron visibility, documented backup recovery, a restore rehearsal, and a rollback drill remain open.

This document defines the required evidence. It does not claim that an item is active until its checkbox is completed and a non-secret evidence link is recorded.

## Data-handling boundary

Monitoring must never capture:

- card numbers, security codes, expiry dates, raw payment payloads, or payment tokens;
- customer names, email addresses, phone numbers, gift messages, or appointment notes;
- access tokens, API keys, webhook secrets, environment values, recovery codes, or session cookies.

Allowed operational fields include event name, timestamp, environment, deployment/commit identifier, route, provider status code, sanitized error class, correlation/request identifier, duration, retry count, and an internal Square object identifier only when access is tightly restricted and retention is justified.

Logs, alerts, issues, pull requests, Notion pages, screenshots, and incident summaries must use sanitized evidence.

## Severity and response targets

| Severity | Trigger | Initial response | Primary action |
| --- | --- | --- | --- |
| SEV-0 | Suspected credential exposure, customer/card-data leakage, or duplicate/incorrect charges | Immediate | Disable affected path, preserve evidence, rotate/reconcile, notify required parties |
| SEV-1 | Booking or gift-card purchase unavailable or repeatedly failing in production | 15 minutes during coverage | Triage latest deploy/provider state; roll back if the fault cannot be restored quickly |
| SEV-2 | Missed cron run, transactional email degradation, CMS publishing failure, or noncritical integration errors | Same business day | Repair, rerun safely, and document impact |
| SEV-3 | Warning, capacity trend, isolated recoverable failure, or maintenance finding | Planned queue | Track and address before threshold becomes customer-visible |

Finalize on-call coverage and notification destinations in the private operations register, not in source control.

## Workstream 1 — Booking, payment, and gift-card alerts

### Required instrumentation

- [ ] Emit one sanitized server event at each critical boundary: request accepted, validation rejected, Square request started, Square request succeeded, Square request failed, email requested, and email failed.
- [ ] Separate booking, payment, gift-card activation, and delivery failures so one provider issue does not hide another.
- [ ] Attach environment, deployment/commit, route, safe error class, upstream status, duration, retry count, and correlation ID.
- [ ] Preserve idempotency behavior and alert on duplicate-prevention events without exposing the idempotency key.
- [ ] Capture client-side Square tokenization failures as a sanitized event; do not capture form fields or payment tokens.
- [ ] Verify alerts against a controlled failure in Preview before enabling Production notifications.

### Initial alert policy

- [ ] **Immediate SEV-1:** five critical booking/payment/gift-card failures in five minutes, or a failure ratio above 20% with at least five attempts.
- [ ] **Immediate SEV-0:** any duplicate-charge/duplicate-booking indicator or suspected sensitive-data event.
- [ ] **SEV-2:** three transactional-email failures in fifteen minutes.
- [ ] **SEV-3:** isolated failure with successful retry; retain for trend review without waking an operator.
- [ ] Suppress synthetic checks from customer conversion metrics and label them clearly.

Tune thresholds after two weeks of production volume; do not lower them merely to eliminate noisy alerts.

### Acceptance evidence

- Alert provider/project: ____________________
- Safe event schema reviewed: ____________________
- Preview failure test: ____________________
- Production routing test: ____________________
- Runbook link: ____________________
- Owner and coverage window: ____________________

## Workstream 2 — Cron and scheduled-job visibility

First inventory every scheduled job from Vercel configuration, provider dashboards, source routes, and third-party automation. Do not assume the repository search alone is complete.

For each job record:

| Job | Schedule/time zone | Purpose | Idempotent | Expected duration | Retry rule | Manual rerun | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |

Required controls:

- [ ] Every run emits a sanitized start, success, skipped, and failure event with a unique run ID.
- [ ] A heartbeat alert fires if a job has not completed within its expected window.
- [ ] Non-2xx responses, timeouts, partial results, and repeated retries alert independently.
- [ ] The operator can distinguish “not invoked” from “invoked and failed.”
- [ ] Manual reruns are documented, authenticated, idempotent, and protected from accidental duplication.
- [ ] A monthly report shows scheduled runs, successes, failures, missed windows, and manual reruns.
- [ ] At least one controlled missed-heartbeat test and one safe manual rerun are recorded.

Evidence:

- Job inventory: ____________________
- Dashboard/log view: ____________________
- Missed-run alert test: ____________________
- Manual rerun test: ____________________

## Workstream 3 — Backup coverage

Backups must cover recoverability, not just data existence.

| Asset | Owner | Method | Minimum cadence | Retention target | Restore target |
| --- | --- | --- | --- | --- | --- |
| GitHub source and history | M1 | Provider history plus approved export/mirror | Before material release and quarterly continuity check | Per M1 policy | Clean clone at approved commit |
| Vercel configuration | M1 | Document project/domain/config inventory; secure environment backup through approved vault/process | After material config change | Current plus prior known-good record | Recreate project without exposing secrets |
| WordPress database | Client; M1 manages | Cloudways/provider backup plus export where supported | Daily and before material change | Confirm provider policy | Restore to isolated rehearsal target |
| WordPress media | Client; M1 manages | Provider/application backup | Daily and before material change | Confirm provider policy | Representative media restored and served |
| Cloudflare DNS zone | Client | Zone export and configuration record | After DNS change and quarterly | Current plus prior version | Recreate records and validation state |
| Square business records | Client | Provider-native retention/exports per business and legal needs | Confirm with account owner | Confirm policy | Reconcile/export access verified |
| Operations documentation | Mixed by asset | Notion export/continuity process | Quarterly | Per M1/client policy | Critical runbooks readable during provider outage |

Controls:

- [ ] Backup owner, cadence, retention, encryption, and deletion policy are verified for every asset.
- [ ] Backup jobs or provider states have failure alerts where supported.
- [ ] Secrets are backed up only through an approved vault/process, never in documentation exports.
- [ ] A pre-change backup is required for DNS, CMS schema/content, destructive data work, and major production configuration changes.
- [ ] A quarterly review identifies backups that exist but have never been restored.

## Workstream 4 — Restore rehearsal

Run the first rehearsal after backup coverage is verified, then at least quarterly or after a material architecture/provider change.

### Rehearsal scope

- [ ] Create an isolated restore target that cannot send production emails, create Square bookings, or charge cards.
- [ ] Restore the WordPress database and representative media.
- [ ] Build/serve the application from an approved GitHub commit.
- [ ] Recreate non-secret Vercel project/domain configuration in a safe target.
- [ ] Validate CMS admin/API, representative page content, images, application build, and internal links.
- [ ] Validate DNS zone export readability without changing public authority.
- [ ] Measure recovery point and recovery time.
- [ ] Destroy or secure the rehearsal target after evidence is captured.

### Record

- Date: ____________________
- Scenario: ____________________
- Backup timestamp used: ____________________
- Recovery point achieved: ____________________
- Recovery time achieved: ____________________
- Gaps found: ____________________
- Corrective issues: ____________________
- Approver: ____________________

## Workstream 5 — Vercel rollback drill

The drill must test the real operational path without intentionally breaking public production.

1. Select the current production deployment and one explicitly identified last known-good deployment.
2. Confirm operator access, MFA, recovery, project scope, domain attachments, and rollback/promote controls.
3. In Preview or a controlled maintenance window, rehearse promotion/rollback using a harmless visible version marker or other safe validation signal.
4. Verify critical pages, CMS content, Square health, booking availability, gift-card form load, and contact path.
5. Confirm the rollback does not silently attach stale or incorrect environment configuration.
6. Record detection time, decision time, rollback time, validation time, and any manual steps.
7. If public DNS rollback remains part of disaster recovery, rehearse the decision tree separately; do not change DNS merely to prove application rollback.

Evidence:

- Drill date: ____________________
- Current deployment/commit: ____________________
- Last known-good deployment/commit: ____________________
- Rollback time: ____________________
- Validation result: ____________________
- Follow-up issues: ____________________

## Workstream 6 — DNSSEC

Current state: authoritative Cloudflare DNS is active, but a registrar DS record has not been confirmed.

Implementation sequence:

- [ ] Export the live Cloudflare zone and record current nameservers, registrar, recovery owners, and DNS validation.
- [ ] Confirm no stale DS record exists at the parent before enabling DNSSEC.
- [ ] Enable DNSSEC in Cloudflare and copy the exact provider-issued DS parameters through the secure operational session.
- [ ] Publish the DS record in the client-owned Namecheap account.
- [ ] Verify the DS chain and DNSSEC validation from at least two independent resolvers/tools.
- [ ] Recheck website, CMS, email, Square-related domain verification, and transactional sending.
- [ ] Record enablement time and non-secret validation evidence.
- [ ] Document rollback: remove the registrar DS first if Cloudflare signing must be disabled, then verify resolution before changing anything else.

Do not paste provider credentials, recovery codes, or screenshots containing account/private data into the evidence record.

## Workstream 7 — Staged DMARC enforcement

Current state: `p=none` monitoring. Enforcement must be evidence-led to avoid blocking legitimate mail.

### Stage 0 — Monitor and inventory

- [ ] Confirm the aggregate-report destination is monitored and reports are retained.
- [ ] Collect at least 2–4 weeks of representative DMARC data.
- [ ] Inventory every authorized sender, including human mail, forwarding behavior, Resend, CMS/plugin mail, Square, and marketing tools.
- [ ] Confirm SPF and DKIM alignment for every legitimate sender.
- [ ] Remove unauthorized or obsolete senders and duplicate SPF mechanisms.
- [ ] Define the emergency rollback owner and change window.

### Stage 1 — Quarantine ramp

Advance only when legitimate aligned traffic is clean:

- [ ] `p=quarantine; pct=10`
- [ ] `p=quarantine; pct=25`
- [ ] `p=quarantine; pct=50`
- [ ] `p=quarantine; pct=100`

Hold each step long enough to cover normal sending patterns. Review aggregate reports, delivery complaints, forwarding, and transactional delivery before advancing.

### Stage 2 — Reject ramp

- [ ] `p=reject; pct=10`
- [ ] `p=reject; pct=25`
- [ ] `p=reject; pct=50`
- [ ] `p=reject; pct=100`

Rollback to the last safe policy if legitimate aligned mail is rejected or a critical sender was omitted. DNS changes must be documented with time, approver, before/after policy, report evidence, and validation.

Evidence:

- Report review location: ____________________
- Sender inventory: ____________________
- SPF/DKIM alignment review: ____________________
- Current stage: ____________________
- Last change/result: ____________________
- Next review date: ____________________

## Monthly operating review

- [ ] Booking/payment/gift-card failure rate and alert quality reviewed.
- [ ] Cron runs, missed heartbeats, and manual reruns reviewed.
- [ ] Vercel errors, latency, deployment changes, and rollback readiness reviewed.
- [ ] Square and Resend provider incidents/reconciliation reviewed.
- [ ] Backup success, retention, and most recent restore evidence reviewed.
- [ ] Domain expiration, MFA, recovery, DNSSEC, and email-authentication state reviewed.
- [ ] Access list and departed users reviewed.
- [ ] Open risks and corrective actions synchronized to Notion and GitHub.

## Definition of done

This program is complete only when:

- production alerts exist and have been exercised with safe controlled failures;
- every cron/scheduled job has success/failure/absence visibility and a tested rerun;
- every critical asset has verified backup ownership, cadence, retention, and recovery instructions;
- a restore rehearsal meets documented recovery targets;
- a Vercel rollback drill is timed and validated;
- DNSSEC validates end to end;
- DMARC reaches an evidence-supported enforcement level;
- owners, coverage, escalation, and quarterly review dates are recorded;
- non-secret evidence is linked in Notion and GitHub, with sensitive evidence kept only in approved restricted systems.
