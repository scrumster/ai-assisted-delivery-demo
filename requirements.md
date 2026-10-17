# CommerceFlow: Product Requirements Specification

| Item | Value |
|---|---|
| Version | 0.3 (revised after CTO review) |
| Date | 2026-10-17 |
| Owner | Product Owner |
| Technical guidance | CTO |
| Supersedes | v0.2 |
| Status | **Proposed for CTO approval. Requirements only. Nothing in this document has been implemented or tested.** |

## 1. Business Objective

CommerceFlow is a demo eCommerce application built to showcase an AI-assisted software delivery lifecycle.

It demonstrates how business requirements are written in Markdown, translated into code, and tested and verified before public release.

CommerceFlow is a demonstration. It is not a production shop, and it does not claim production-grade behaviour (see Section 10).

## 2. Target Users

- **Customer:** browses products and places a simulated order.
- **Hiring managers and recruiters:** explore the application and its engineering evidence.

## 3. Release 1 Scope and Constraints

- Release 1 is a **static website** (HTML, CSS and JavaScript files only).
- **Hosting:** Cloudflare Pages is the proposed platform for the public demo, **subject to verification of its free-tier requirements** (checklist in `docs/assumptions-and-limitations.md`, Section 3). If verification fails, another free static host is used. The requirements do not change.
- **Source and CI:** GitHub remains the source repository and the CI platform. The repository is already public, so anything pushed to it, including its history, is visible to everyone immediately. The secrets and personal-data rules in NFR-007 therefore apply to every push, not only to release.
- Release 1 has **no backend, no database and no user accounts**. Pages Functions and other server-side features are not used.
- A custom domain is not required and is not purchased. Release 1 uses the address the host provides.
- Browser storage is used only for the cart (FR-016).
- All catalogue, cart, stock and order logic runs in the visitor's browser.
- Introducing a backend or database requires a written justification (a short architecture decision record) showing which requirement cannot otherwise be met.
- Work follows the phased plan in Section 12. The phases sequence the work. They do not change any requirement or acceptance criterion.

## 4. Conventions and Definitions

### 4.1 Identifier scheme

| Prefix | Meaning | Example |
|---|---|---|
| FR-nnn | Functional requirement | FR-004 |
| NFR-nnn | Non-functional requirement | NFR-001 |
| RAC-nnn | Release acceptance criterion | RAC-003 |
| TC-nnn | Planned test case (defined in `docs/traceability-matrix.md`) | TC-014 |
| REG-nnn | Regression test added after a defect is fixed | REG-001 |
| A-nn / L-nn | Assumption / limitation (in `docs/assumptions-and-limitations.md`) | L-01 |

Identifiers are permanent. A retired requirement is marked "Withdrawn", not renumbered. FR-001 to FR-009 keep the meaning they had in v0.1.

### 4.2 Definitions

| Term | Definition |
|---|---|
| Cents | Money is held as a whole number of Australian cents (A$12.50 is 1250). |
| AUD | Australian dollars, the only currency in Release 1. |
| Valid quantity | A positive whole number that passes FR-003, FR-004 and FR-012. |
| MAX_QTY_PER_LINE | The maximum quantity of one product in the cart. Release 1 value: **10**. |
| Cart line | One product ID with one quantity. |
| In-session state | State held in memory for the current page load. It is lost on reload. |
| Order | The record created by a successful checkout. |
| Test case (TC) | A planned test in the traceability matrix, identified by a TC ID. A TC is a planning unit. One TC may be implemented as one or more individual automated tests. |
| Individual automated test | A single test written in code (for example, one input value checked inside a parameterised test). Counts are known only after the tests are written. |
| Test suite | A group of related individual automated tests, typically one file. Proposed suites are listed in the matrix. |
| CI check | A check run by the CI workflow on GitHub (for example, "run all gating tests in Node.js"). A CI check is not itself a unit test. |
| Gating test | An automated test that must pass for a release. Optional tests are not gating. |
| Public release | Publishing the demo site on the host so visitors can use it. It does not refer to the GitHub repository, which is already public. |

## 5. Functional Requirements

### FR-001: Product Catalogue
The application shall display a built-in sample catalogue (Appendix A).
- Each product shows: ID, name, description, category, price (AUD) and available stock.
- Products are grouped under their category headings.
- The catalogue has 3 categories and at least 8 products, with stock levels that vary. At least one product has stock 0, and at least one has stock 1 to 3.
- A product with stock 0 is labelled "Out of stock" and cannot be added to the cart.
- A product with stock 1 to 3 is labelled "Low stock".
- The catalogue is a static data file in the repository. No network call is needed to load it.

### FR-002: Cart Management
Customers shall be able to add products to the cart, change quantities and remove products.
- Adding a product that is already in the cart merges into the existing line. There is never more than one line per product.
- The cart shows, per line: product name, unit price, quantity and line total. It also shows the cart total.
- Every change updates the cart display immediately, without a page reload.

### FR-003: Quantity Validation
Only positive whole-number quantities shall be accepted.
- Quantities entered as text are trimmed of leading and trailing spaces, then must consist only of digits, with no sign, decimal point, exponent or separator, and must not start with 0. As a pattern: `^[1-9][0-9]*$`.
- Rejected values include:
  - `0`.
  - Negative numbers (`-1`).
  - Decimals (`1.5`, `2.0`).
  - Missing values (undefined, null, empty text, spaces only).
  - Non-numeric values (`abc`, NaN, Infinity).
  - Other number formats (`1e1`, `0x10`, `+2`, `1,000`, `007`).
- This rule applies when adding, updating, loading a saved cart and checking out.
- A rejected operation leaves the cart unchanged.

### FR-004: Stock Validation
Quantities that exceed available stock shall be rejected.
- The check uses the resulting quantity (existing cart quantity plus the amount being added) against the product's available stock.
- A quantity equal to available stock is accepted.
- A product with stock 0 cannot be added.
- The check applies when adding, updating and checking out.
- A rejected operation leaves the cart unchanged.

### FR-005: Catalogue-Based Price Calculation
The application logic shall calculate line totals and order totals from catalogue prices and quantities only.
- A cart line holds only a product ID and a quantity.
- Any price or total present in stored cart data, form input or the page address is ignored by the calculation logic.
- **Browser-side logic cannot guarantee tamper-proof prices.** All code and data run in the visitor's browser, so anyone using browser developer tools can alter prices, totals or any other value. This requirement describes how the application calculates totals. It is not a security control and must not be presented as one (L-01).
- Release 1 makes no claim of server-side price enforcement.
- Tests for this requirement (TC-022, TC-023) show that the calculation uses catalogue prices and ignores supplied prices. They do not show that prices cannot be tampered with.

### FR-006: Simulated Checkout
Customers shall be able to submit a valid order without logging in or making a real payment.
- Checkout is a single "Place demo order" action.
- Checkout collects no name, address, email, phone number or payment details.
- Checkout validates the whole cart against FR-003, FR-004, FR-010, FR-011 and FR-012 before doing anything else.
- On success: an order is created (FR-014, FR-015), inventory is deducted (FR-018), the cart is cleared and the confirmation is shown (FR-007).
- The checkout screen and the confirmation screen display the demo notices D5 and D6 defined in FR-019.

### FR-007: Order Confirmation
After successful checkout the application shall display:
- the order reference;
- the status "Confirmed";
- each purchased item (name, quantity, unit price, line total);
- the order total.

All amounts are shown in AUD and use the prices that applied at checkout. The confirmation is not saved. After a page reload it is no longer shown (L-03), and the confirmation screen says so (notice D6, FR-019).

### FR-008: Failed Order Integrity
A failed checkout shall not create a successful order or deduct inventory.
- On any validation failure: no order exists, no confirmation is shown, no product's stock changes, and the cart is left as it was.
- Checkout is all-or-nothing. If one line is invalid, no other line is processed.
- The order reference (FR-014) is generated before any inventory is deducted. If a reference cannot be generated, the checkout fails under this requirement.

### FR-009: Engineering Showcase
The application shall provide public access, without login, to an engineering showcase reachable from the main navigation in one click.
- The showcase contains or links to:
  - the requirements (`requirements.md`);
  - an architecture overview;
  - the AI workflow description;
  - the traceability matrix;
  - test evidence;
  - CI results;
  - the public GitHub repository;
  - the assumptions and limitations.
- Test evidence means results from actual test runs, showing the date, the commit identifier and pass/fail counts. Manual test results state who ran them and when.
- No page may state that something is implemented or tested unless a recorded run supports it.

### FR-010: Empty Cart Validation
Checkout of an empty cart shall be rejected.
- An empty cart is one that has never had items and also one whose items have all been removed.
- A rejection creates no order and changes no stock.

### FR-011: Unknown Product Validation
Any product ID that is not in the catalogue shall be rejected.
- This applies when adding, updating, checking out and loading a saved cart.
- A rejection changes no state.

### FR-012: Maximum Quantity per Product Line
The quantity of any one product in the cart shall not exceed MAX_QTY_PER_LINE (10).
- The effective limit for a product is the lower of 10 and its available stock.
- The limit is defined in exactly one place in the code, so it can be changed in one edit.
- The check applies to the resulting quantity (existing plus added).
- Rationale: see Section 11, decision 2.

### FR-013: Money Representation and Display
All monetary calculations shall use whole numbers of Australian cents.
- Catalogue prices are positive whole numbers of cents.
- Totals are sums of (unit price × quantity). Floating-point arithmetic is not used for money.
- Amounts are displayed in AUD with two decimal places, the dollar sign and thousands separators (1250 shows as `$12.50`, 0 as `$0.00`, 123456 as `$1,234.56`).
- The interface states once, prominently, that all prices are in AUD.
- Worked example: 2 × 2995 + 1 × 4950 = 10940, displayed as `$109.40`.
- Release 1 has no tax, discount or shipping calculations. Any later feature involving percentages must first define rounding (A-03).

### FR-014: Order Reference
Every successful order shall receive a unique, non-sequential reference.
- Format: `CF-` followed by 8 characters, for example `CF-7K2M9QXD`.
- The 8 characters come from this 32-character alphabet: `0123456789ABCDEFGHJKMNPQRSTVWXYZ` (no I, L, O or U, to avoid look-alike characters).
- **Generation rule.** A random source supplies 8 whole numbers from 0 to 31. Character *i* of the reference is the alphabet character at position *i*'s number. In the application the random source is the browser's secure random source where available. In tests it is replaced by a fixed sequence, so every result is exactly predictable.
- The reference is not derived from a counter, the clock or the contents of the order.
- **Collision handling.** The new reference is compared with the references of all orders created in the current session. If it matches one, it is discarded and a new one is generated.
- A maximum of 10 attempts is made per order. If all 10 collide, checkout fails with ERR_ORDER_REFERENCE. No order is created, inventory is unchanged and the cart is unchanged (FR-008).
- Uniqueness is guaranteed within a session only (L-04).
- The statistical behaviour of the real random source is not a requirement and not a release gate. An optional sanity test exists (TC-060).

### FR-015: Order Status
Release 1 supports exactly one order status: `Confirmed`.
- Every successfully created order has status `Confirmed`.
- There are no other statuses and no status transitions.

### FR-016: Cart Persistence
The cart shall survive a page refresh and a browser restart, using browser storage.
- Storage holds only product IDs and quantities, with a storage-format version number (never prices or totals).
- On load, the stored cart is re-validated against the current catalogue and stock:
  - Lines with unknown product IDs are removed.
  - Lines with invalid quantities are removed.
  - Lines above the effective limit (FR-012) are reduced to it, or removed if the limit is 0.
  - If anything was changed, the visitor sees notice D4 (FR-019) listing what changed.
- Corrupt or unreadable stored data produces an empty cart and notice D4, never a crash.
- If browser storage is unavailable (for example, blocked by browser settings), the application works with an in-memory cart and shows notice D3.
- The stored cart is cleared after a successful checkout.
- Inventory and orders are not persisted (FR-018, L-02, L-03).
- The visitor is told how this works in the application itself (FR-019, notices D1 and D2).

### FR-017: Validation Feedback
Every rejection shall produce a clear, visible message in the same view.
- The message states what went wrong and what the customer can do, naming the product and the relevant number where applicable.
- Raw system errors, stack traces and internal codes are never shown to customers.
- Each failure type has a stable error code, used by the tests:

| Code | Trigger | Message (template) |
|---|---|---|
| ERR_QTY_INVALID | FR-003 violation | "Quantity must be a whole number of 1 or more, for example 2." |
| ERR_QTY_EXCEEDS_MAX | FR-012 violation | "You can order at most {limit} of {product}. Your cart already has {n}." |
| ERR_QTY_EXCEEDS_STOCK | FR-004 violation | "Only {stock} of {product} in stock." |
| ERR_OUT_OF_STOCK | Adding a stock-0 product | "{product} is out of stock." |
| ERR_UNKNOWN_PRODUCT | FR-011 violation | "That product is not available." |
| ERR_EMPTY_CART | FR-010 violation | "Your cart is empty. Add a product before checking out." |
| ERR_ORDER_REFERENCE | FR-014: no unique reference after 10 attempts | "We couldn't create your order reference, so nothing was ordered. Please try again." |

- Informational notices (cart adjusted on load, storage unavailable) are shown as notices, not errors.

### FR-018: Inventory Deduction on Success
A successful checkout shall reduce each purchased product's available stock by the purchased quantity.
- The updated stock is shown immediately in the catalogue.
- Inventory is in-session state. It returns to the seed values when the page is reloaded (L-02).
- The visitor is told this in the application (FR-019, notices D1, D5 and D6).

### FR-019: Visitor-Facing Demo Behaviour
The application shall tell visitors, in the interface, how cart persistence and order and inventory reset behave.

| ID | Statement (proposed default wording) | Where shown | When |
|---|---|---|---|
| D1 | "Demo store. All prices are in AUD. Stock levels and orders are not saved and reset to their starting values when you reload the page." plus a link to the limitations page | Persistent banner or footer on every screen | Always |
| D2 | "Your cart is saved in this browser. It will still be here if you refresh or come back later, unless you clear your browser data or use private browsing." | Cart view | When the cart has at least one line and storage is available |
| D3 | "Your cart can't be saved in this browser and will be lost when you refresh or leave." | Cart view | When storage is unavailable |
| D4 | "We updated your cart because some items changed: {list of changes}." | Cart view | When loading changed or discarded any stored line |
| D5 | "Demo only. No payment is taken. This order will not be saved, and stock levels reset when you reload the page." | Checkout screen, next to the order button | Always |
| D6 | "This is a demo order. It is not saved. If you reload this page, this confirmation will disappear and stock levels will return to their starting values. No payment was taken." | Confirmation screen | Always |

- Each notice is visible without clicking, hovering or expanding anything, including at 375 px width.
- Wording may be refined at build time with the product owner's approval, provided every fact in the statement is kept.
- Behaviour after a page reload, stated to visitors and published in the showcase:

| Item | After reload |
|---|---|
| Cart | Kept, after re-validation (FR-016) |
| Stock levels | Reset to starting values (FR-018) |
| Orders and confirmation | Gone (FR-007) |

## 6. Non-Functional Requirements

| ID | Requirement | Measure |
|---|---|---|
| NFR-001 | **HTTPS.** The published application uses HTTPS. | The published URL starts with `https://`; plain HTTP redirects or is unavailable; no mixed-content warnings. |
| NFR-002 | **No account.** Visitors never need an account. | The whole customer journey is possible with no registration, login or sign-in prompt. |
| NFR-003 | **Desktop and mobile.** The application is usable on both. | Journey completes at 1280×800 and 375×667; no horizontal scrolling at 375 px width; interactive controls are at least 44×44 CSS pixels on mobile. |
| NFR-004 | **No paid services.** Release 1 costs nothing to build, host or run. | Hosting is on the free plan of the proposed host, and its free-tier verification checklist is completed and recorded before publishing. GitHub, CI and tooling are free. No paid custom domain, paid API key or paid hosting feature is used. |
| NFR-005 | **Independently testable business logic.** Cart, validation, pricing and order logic is separate from the user interface. | Business-logic tests run in a plain Node.js environment with no browser. Browser storage is accessed only through a replaceable interface. |
| NFR-006 | **Automated tests locally and in CI.** | One documented command runs all automated tests locally. CI runs them on every push and pull request. |
| NFR-007 | **No secrets or personal data in the repository.** | A secrets scan finds 0 secrets at the Phase 1 baseline and again before public release (TC-052). No `.env` files are committed. The app collects no personal customer data, and all sample data is synthetic. |
| NFR-008 | **Static-only architecture.** | The published output contains only static files. No server-side code, database or runtime third-party API. |
| NFR-009 | **Browser support.** Latest stable Chrome, Edge, Firefox and Safari. | The main journey is verified in at least two of them. |
| NFR-010 | **Basic accessibility.** | The journey is operable by keyboard alone; every input has a visible label; validation messages are announced to assistive technology; body-text contrast ratio is at least 4.5:1. |
| NFR-011 | **Transparency about limitations.** | The demo nature and key limitations are visible in the application and in the showcase (see FR-009 and Section 10). |
| NFR-012 | **Beginner-runnable setup.** | The README lets someone with VS Code and Node.js install dependencies and run the tests in at most 3 documented commands. |

## 7. Testing Requirements

### 7.1 Approach
- **Automated unit-level tests** (Node.js) cover all business logic. Each gating TC is implemented as one or more individual automated tests, grouped into test suites. Gating tests must pass for a release.
- **CI checks** confirm that the gating tests run in Node.js on every push and pull request, and that the latest run on the main branch passes.
- **Manual checklist tests** cover user-interface behaviour, visitor notices, mobile layout, accessibility, publishing checks and repository hygiene. Repository hygiene (TC-052) is run twice: a baseline at the end of Phase 1 and a final run in Phase 3 before public release. Results are recorded in the repository with date, tester and commit.
- **Optional tests** (currently one statistical test, TC-060) run separately and never gate a release.
- **Counting rule.** Counts in project documents refer to planned test cases (TC IDs) unless stated otherwise. Counts of individual tests and suites are quoted only from real run output after the tests exist. No count is quoted as a result before a run.
- Unit tests use their own small fixture catalogue, so editing the sample catalogue does not break them. TC-001 separately validates the real sample catalogue.
- Planned test cases and their requirement mapping are in `docs/traceability-matrix.md`. Every FR and NFR maps to at least one test.

### 7.2 Required scenarios
All of these must be covered by planned tests:
- Successful checkout.
- Empty cart rejection.
- Invalid quantity rejection (zero, negative, decimal, missing, non-numeric).
- Maximum quantity rejection and boundary.
- Unknown product rejection.
- Insufficient stock and out-of-stock rejection.
- Correct total calculation using catalogue prices, with tampered prices ignored.
- Money held and displayed correctly as integer cents and AUD.
- Cart quantity updates and item removal.
- Failed checkout leaves inventory and cart unchanged, including multi-line atomicity.
- Order reference format, collision handling, retry exhaustion and non-sequential generation, all tested deterministically. A large-sample statistical check is optional and not a gate.
- Cart persistence, corrupt storage and unavailable storage.
- Visitor-facing demo notices, and cart, stock and confirmation behaviour after a reload.

### 7.3 Regression policy
Every defect that is corrected gets a regression test with an ID of the form REG-nnn. It is recorded in the traceability matrix against the requirement it protects.

## 8. Release Acceptance Criteria

Every criterion below is pass/fail. Evidence is recorded against the planned tests in `docs/traceability-matrix.md`.

| ID | Criterion |
|---|---|
| RAC-001 | **Public access.** In a private/incognito window with no prior state, the published `https://` URL loads and shows the catalogue with no login, registration or sign-in prompt. |
| RAC-002 | **Working shopping journey.** A tester can, in one session on desktop (1280×800), add two different products, change one quantity, remove one product, check out and see a confirmation with an order reference, with no error displayed. This works in at least two supported browsers. |
| RAC-003 | **Business validation.** Each of these is rejected with a visible message (FR-017) and no change to cart, inventory or orders: quantity 0, negative, decimal, missing, non-numeric, above the maximum, above stock, out-of-stock product, unknown product, empty-cart checkout. A failed checkout leaves all stock values unchanged. |
| RAC-004 | **Engineering evidence.** Every item listed in FR-009 is reachable from the showcase in one click from the main navigation, every link returns a page (no 404), and the GitHub repository is public. |
| RAC-005 | **Automated quality checks.** The CI workflow runs on every push and pull request. The latest CI run on the main branch passes, with every gating automated test executed, zero failures and none skipped. The same tests pass locally using the documented command. Optional tests are excluded from this criterion. |
| RAC-006 | **Mobile usability.** At 375×667 the full journey (browse, cart, checkout, confirmation) completes, no screen scrolls horizontally, and interactive controls are at least 44×44 CSS pixels. |
| RAC-007 | **Cost control and static architecture.** Every item of the hosting free-tier verification checklist is recorded as verified before publishing. No paid service or paid custom domain is required to build, host or run the release. The published output is static files only, with no server code, no Pages Functions and no database. |
| RAC-008 | **Money integrity.** All displayed amounts are in AUD, and all displayed totals equal the expected cents-based totals across the test scenarios, with no floating-point artefacts. |
| RAC-009 | **Cart persistence.** A cart with two lines is still present after a page refresh and after closing and reopening the browser, and the cart view shows notice D2. Corrupt stored data shows notice D4 and unavailable storage shows notice D3, and neither crashes the application. |
| RAC-010 | **Honest limitations and visible demo behaviour.** The showcase lists every limitation in `docs/assumptions-and-limitations.md`. Notices D1 to D6 appear where FR-019 requires. After a reload the application behaves as the FR-019 table states (cart kept, stock reset, confirmation gone). No page or document claims production-grade inventory consistency, server-side price enforcement or tamper-proof prices. |
| RAC-011 | **Order reference.** Every confirmation shows a reference matching the FR-014 format. The deterministic tests for format, collision handling and retry exhaustion pass. An optional 10,000-reference statistical test, if run, is recorded separately and is not a release gate. |
| RAC-012 | **Repository hygiene.** A secrets scan reports 0 findings twice: at the Phase 1 baseline, and again on the release commit before public release. On both occasions no `.env` or credential files are committed and no personal data appears in the repository. |
| RAC-013 | **Basic accessibility.** The full journey can be completed by keyboard alone, every input has a label, and validation messages are announced to assistive technology. |

## 9. Out of Scope for Release 1

- Real payment processing.
- Customer authentication and accounts.
- Backend services and databases.
- Persistent orders, order history and order lookup.
- Order statuses other than `Confirmed`, and status transitions.
- Production inventory management and production-grade concurrent order processing.
- Server-side price enforcement.
- Shipping, tax/GST calculation, discounts and multiple currencies.
- Product images, search, filtering and sorting.
- Admin or management screens.

## 10. Limitations (summary)

Release 1 is browser-only. Because of this:
- It does **not** provide production-grade inventory consistency.
- It does **not** provide secure server-side price enforcement.
- Orders and inventory are not saved between page loads.

The full list is in `docs/assumptions-and-limitations.md` (L-01 onwards) and is published in the showcase.

## 11. Decision Log (resolution of v0.1 open questions)

| # | Question | Decision |
|---|---|---|
| 1 | Which product categories best demonstrate eCommerce? | Three categories (Home Office, Kitchen, Outdoors) with varied stock levels (Appendix A). |
| 2 | What maximum quantity per line? | **10.** It is a realistic per-customer limit, it is above or near most sample stock levels so it rarely hides the stock rule, and it makes boundary tests simple (10 accepted, 11 rejected). It keeps demo totals small and believable, and it is one constant in one place (FR-012). The effective limit is the lower of 10 and stock. |
| 3 | Which order status transitions? | None. A single status, `Confirmed` (FR-015). |
| 4 | How do demo orders behave after refresh? | The cart persists (FR-016). Orders, confirmation and inventory do not; they reset on reload (FR-007, FR-018, L-02, L-03). This is stated to visitors in the interface (FR-019). |
| 5 | What engineering evidence should the showcase display? | The items in FR-009. |
| 6 | Where is the demo hosted? | Cloudflare Pages is proposed, subject to verification of free-tier requirements. GitHub is the source repository and CI platform. If verification fails, another free static host is used and no requirement changes. |
| 7 | How are persistence and reset behaviour made visible to visitors? | Notices D1 to D6 and the reload behaviour table (FR-019). |

## 12. Phased Implementation Plan

All requirements and all 13 acceptance criteria stay in force. This plan only sequences the work. A phase starts when the previous phase's exit criteria are recorded in the traceability matrix evidence log.

### Phase 1: Business logic and unit tests (no user interface)
- **Scope:** logic for FR-002 to FR-005, FR-008, FR-010 to FR-015, FR-016 (storage behind a replaceable interface), FR-017 (codes and messages as data), FR-018, and order creation for FR-006 and FR-007. Also: a README with test instructions; a `.gitignore` that excludes environment and credential files, in place before any application files are committed; a free secrets-scanning tool chosen and run before any further commits are pushed (the repository is already public); and the CI workflow running the gating tests (NFR-005, NFR-006, NFR-007, NFR-012).
- **Tests:** all gating unit-level TCs, the CI checks TC-040 and TC-051, TC-052 (first run, the baseline), TC-057, and optionally TC-060.
- **Repository hygiene baseline (TC-052, first run):** at the end of Phase 1 the scan covers the working tree and, where the chosen tool supports it, the full commit history. A manual review confirms no `.env` or credential files and no personal data. The tool, its scope and the result are recorded against a commit. Because the repository is public, any finding is treated as already exposed. The credential is revoked or replaced at its source, then removed from the repository, and the scan is re-run before Phase 2 starts. Removing it from later commits alone is not sufficient.
- **Exit:** all gating tests pass locally and in CI, and the TC-052 baseline reports 0 findings, with evidence recorded against a commit.

### Phase 2: Storefront
- **Scope:** catalogue display (FR-001), cart and checkout screens (FR-002, FR-006, FR-007), validation messages (FR-017), browser-storage wiring (FR-016), visitor notices (FR-019), money formatting (FR-013), responsive layout and basic accessibility (NFR-003, NFR-009, NFR-010).
- **Tests:** TC-041 to TC-047, TC-055, TC-056 and TC-061, run on a local build.
- **Exit:** the full journey completes locally on desktop and mobile viewports, and manual results are recorded.

### Phase 3: Publishing and release verification
- **Scope:** complete the hosting free-tier checklist, connect the GitHub repository to the host, publish, build the showcase (FR-009) with architecture and AI workflow pages, and publish the limitations page.
- **Tests:** TC-048, TC-049, TC-050, TC-052 (second run, the final scan on the release commit before public release), TC-053, TC-054, closure of TC-058, and re-runs of TC-046, TC-047, TC-056 and TC-061 on the published address.
- **Release rule:** only a commit on the main branch whose CI run passed is treated as the release. The final TC-052 run must report 0 findings on that commit before the commit is published. If it finds anything, publication is blocked until the finding is resolved and the scan re-run. Release verification is recorded against that commit.
- **Exit:** all 13 acceptance criteria pass, with evidence recorded.

### Acceptance criteria by phase

| Criterion | Built in | Formally verified in |
|---|---|---|
| RAC-001 | Phase 3 | Phase 3 |
| RAC-002 | Phase 2 | Phase 3 (published address) |
| RAC-003 | Phase 1 (rules), Phase 2 (messages) | Phase 2, re-run in Phase 3 |
| RAC-004 | Phase 3 | Phase 3 |
| RAC-005 | Phase 1 | Phase 1, re-confirmed in Phase 3 |
| RAC-006 | Phase 2 | Phase 3 (published address) |
| RAC-007 | Phase 3 | Phase 3 |
| RAC-008 | Phase 1 | Phase 1, display confirmed in Phase 2 |
| RAC-009 | Phase 1 (logic), Phase 2 (browser storage) | Phase 3 |
| RAC-010 | Phase 2 (notices), Phase 3 (showcase) | Phase 3 |
| RAC-011 | Phase 1 | Phase 1 |
| RAC-012 | Phase 1 (baseline scan) | Phase 1 (baseline) and Phase 3 (final scan before public release) |
| RAC-013 | Phase 2 | Phase 3 |

## Appendix A: Sample Catalogue (seed data for Release 1)

Prices are in cents. These values are the starting point and may be adjusted before build.

| ID | Category | Name | Price (cents) | Display | Stock | Notes |
|---|---|---|---|---|---|---|
| HO-001 | Home Office | Wireless Mouse | 2995 | $29.95 | 25 | High stock |
| HO-002 | Home Office | Desk Lamp | 4950 | $49.50 | 10 | Stock equals max quantity |
| HO-003 | Home Office | Laptop Stand | 6900 | $69.00 | 2 | Low stock |
| KT-001 | Kitchen | Ceramic Mug | 1450 | $14.50 | 40 | High stock |
| KT-002 | Kitchen | Chef's Knife | 8995 | $89.95 | 5 | Medium stock |
| KT-003 | Kitchen | Cast Iron Pan | 5500 | $55.00 | 0 | Out of stock |
| OD-001 | Outdoors | Insulated Bottle | 3495 | $34.95 | 18 | |
| OD-002 | Outdoors | Camping Headlamp | 2250 | $22.50 | 3 | Low stock |
| OD-003 | Outdoors | Picnic Blanket | 3999 | $39.99 | 12 | |

Descriptions are one short sentence each and are written at build time.

## Appendix B: Changes

### Changes in v0.2 (from v0.1)
- Added FR-010 and FR-011 (empty cart, unknown product).
- Added FR-012 to FR-018 (maximum quantity, money, order reference, status, persistence, validation feedback, inventory deduction).
- Expanded FR-001, FR-003, FR-005, FR-006, FR-007, FR-009.
- Added NFR identifiers and NFR-008 to NFR-012.
- Added RAC-008 to RAC-013, and made all criteria measurable.
- Resolved the open questions (Section 11).
- Corrected typographical errors, and changed "Employers / hiring managers / recruiters" to "Hiring managers and recruiters".

### Changes in v0.3 (CTO review)
- Cloudflare Pages proposed as hosting, subject to free-tier verification. GitHub remains repository and CI (Section 3, NFR-004, RAC-007).
- FR-005 renamed "Catalogue-Based Price Calculation", with an explicit statement that browser-side logic cannot guarantee tamper-proof prices.
- FR-014 reworked for deterministic testing, with collision handling and a 10-attempt limit. Added ERR_ORDER_REFERENCE.
- Added FR-019 (visitor-facing demo behaviour). Updated FR-006, FR-007, FR-016, FR-018.
- Added test terminology (4.2) and a counting rule (7.1).
- Added the phased plan (Section 12) and decision log rows 6 and 7.
- Updated RAC-005, RAC-007, RAC-009, RAC-010 and RAC-011. All 13 criteria are retained.
- TC-052 scheduled twice: a baseline in Phase 1 and a final run in Phase 3 before public release (NFR-007, RAC-012, Section 7.1, Section 12).
- Recorded that the GitHub repository is already public (Section 3), with a "Public release" definition (4.2) and Phase 1 handling of already-exposed findings (Section 12).