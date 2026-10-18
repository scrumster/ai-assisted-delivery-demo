# CommerceFlow: Assumptions and Technical Limitations

| Item | Value |
|---|---|
| Version | 0.3 (revised after CTO review) |
| Date | 2026-10-17 |
| Status | **Proposed for CTO approval. Planning document. Nothing described has been implemented or tested.** |

## 1. Assumptions

| ID | Assumption |
|---|---|
| A-01 | Hosting: Cloudflare Pages (free plan) is proposed for the public demo, subject to the verification checklist in Section 3. GitHub is the source repository (public) and CI platform. If verification fails, another free static host is used. Requirements are unaffected. |
| A-02 | The proposed tools have free usage options; applicable quotas and limits must be checked before use. |
| A-03 | Currency is AUD only. Displayed prices are treated as final. No GST breakdown, shipping, discount or rounding rules are needed in Release 1. |
| A-04 | Sample catalogue data is synthetic, static and stored in the repository. No product images are required. |
| A-05 | The maximum of 10 per product line is a demonstration business rule, held in one constant. |
| A-06 | A single visitor uses one browser at a time. Modern browsers provide local browser storage, and the app degrades gracefully if it is blocked (FR-016). |
| A-07 | No personal customer data is collected, requested or stored. |
| A-08 | Visitors are treated as honest or curious. Release 1 has no adversarial threat model (L-01, L-09). |
| A-09 | Manual tests are run by the product owner (or a named tester), and results are recorded in the repository with date, tester and commit. |
| A-10 | The interface language is English (Australia). |
| A-11 | Supporting documents (`docs/architecture.md`, `docs/ai-workflow.md`) will be written during the build, so the showcase (FR-009) has content to link to. They are not part of this requirements exercise. |
| A-12 | AI-generated code and documents are reviewed by a human before being committed. |
| A-13 | Unit tests use a fixture catalogue separate from the sample catalogue, except TC-001, which checks the real sample data. |
| A-14 | If Cloudflare Pages is selected, the project owner needs a free Cloudflare account to publish.|
| A-15 | The GitHub repository is already public. Anything pushed to it, including its commit history, is publicly visible from the moment it is pushed. |

## 2. Technical Limitations

These are published in the engineering showcase (FR-009, NFR-011, RAC-010).

| ID | Limitation | Consequence |
|---|---|---|
| L-01 | **No server-side price enforcement, and no tamper-proof prices.** Browser-side logic cannot guarantee tamper-proof prices. All pricing logic runs in the visitor's browser. | A visitor using developer tools can alter prices, totals or any other browser-side value. FR-005 means the calculation logic uses catalogue prices and ignores supplied ones. It is not a security control. |
| L-02 | **Inventory is not production-grade.** Stock is in-memory state, per page load. It is not shared across visitors, devices or tabs, and it resets to the seed values on reload. There is no concurrency control. | Two visitors can each buy the "last" item. Stock deducted by a checkout reappears after a reload. |
| L-03 | **Orders are not saved.** Orders and confirmations exist only in memory. There is no order history or lookup. `Confirmed` means only that the demo accepted the order. | After a reload, the confirmation cannot be retrieved. No order is transmitted anywhere. |
| L-04 | **Order reference uniqueness is local.** References are random 8-character codes checked only against orders in the current session. After 10 collisions in a row, checkout fails safely (FR-014). There is no central registry. | References suit a demo, not global identification, and must not be used for authentication. Release evidence relies on deterministic tests, not on the statistical behaviour of the random source. |
| L-05 | **Cart storage is user-editable.** The cart is kept in browser storage, which is unencrypted, per browser profile, and can be edited or cleared by the user. | The app validates the stored cart on load (FR-016) but cannot prevent tampering. Private browsing or blocked storage means the cart is not saved. |
| L-06 | **Cart and inventory can disagree after reload.** The cart persists but inventory resets. | The app re-validates the cart on load and tells the customer what changed. |
| L-07 | **Multiple tabs.** Tabs share the stored cart but not inventory or orders. | Last write wins. No live cross-tab synchronisation is guaranteed. |
| L-08 | **No real commerce features.** No payment, authentication, shipping, tax, discounts or currency conversion. | The demo cannot be used for real sales. |
| L-09 | **No security testing.** Release 1 has had no penetration test, rate limiting or formal threat model. | The application must not be used for real customer data. |
| L-10 | **Accessibility is basic.** Release 1 meets the checks in NFR-010 only. It is not a formal accessibility audit. | Some accessibility issues may remain. |
| L-11 | **Test evidence has limited scope.** Automated functional tests cover business logic; interface, mobile and publishing checks are manual. | Results apply to the recorded commit and date only. Browser-based UI automation is not part of Release 1. |
| L-12 | **Free hosting has no service guarantee, and its terms and limits can change.** | Availability depends on the free provider. Checklist results record the date they were verified and may go out of date. |
| L-13 | **Publishing is not automatically tied to CI results.** Git-connected hosts normally deploy on push. | Without a rule, a commit could be published before its tests pass. The release rule (requirements Section 12) and checklist item H-12 address this. |

## 3. Hosting Free-Tier Verification Checklist (Cloudflare Pages)

Complete before Phase 3 publishing. Record the result, date and person for each item. Every row below is currently **Not yet verified**. If any row fails, evaluate another free static host before publishing.

| # | Check | How to verify | Result / date / by |
|---|---|---|---|
| H-1 | A free plan is available and sufficient for static hosting | Cloudflare pricing and Pages documentation | |
| H-2 | Sign-up requirements for the free plan, including whether a payment card is needed | Sign-up flow and documentation. If a card is required, the CTO decides whether this is acceptable under NFR-004. | |
| H-3 | Which Cloudflare route (Pages or Workers Static Assets) is currently documented for new static sites; the choice stays static and free | Cloudflare documentation | |
| H-4 | Current limits fit the project: builds per month, concurrent builds, build timeout, files per site, maximum file size | Cloudflare Pages limits page. Record the values and the date seen. | |
| H-5 | Static requests and bandwidth carry no charge on the free plan | Cloudflare documentation and billing page | |
| H-6 | The provided address uses HTTPS, and plain HTTP is redirected or refused (NFR-001) | Open the address; test an `http://` request | |
| H-7 | No Functions or server-side features are enabled, and the billing page shows no paid items (NFR-004, NFR-008) | Dashboard and billing page | |
| H-8 | The public GitHub repository connects, with `main` as the production branch | Dashboard. Record how deployments are triggered. | |
| H-9 | The address opens in a private window with no login and no access gate (NFR-002) | Private-window test | |
| H-10 | No custom domain is needed or purchased | Dashboard | |
| H-11 | Free-tier terms and acceptable-use rules reviewed for a demo site | Cloudflare terms. Record the review date. | |
| H-12 | A verified release gate prevents changes from reaching the production branch before CI passes | Configure a required GitHub Actions status check for `main`. Verify that a failing check blocks a merge. If this cannot be enforced, document the alternative release control and its limitations. Record the decision and verify it works in Phase 3. | |

## 4. Statements the Project Will Not Make

Unless the architecture changes and the requirements are updated, CommerceFlow documents and pages will **not** claim:
- production-grade inventory consistency;
- secure, server-side or tamper-proof price enforcement;
- persistent or retrievable orders;
- global uniqueness of order references;
- security, accessibility or load testing beyond what is recorded as done;
- that any requirement is implemented or tested without a recorded run to support it.