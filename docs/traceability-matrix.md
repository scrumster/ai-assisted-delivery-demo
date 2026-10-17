# CommerceFlow: Traceability Matrix

| Item | Value |
|---|---|
| Version | 0.3 (revised after CTO review) |
| Date | 2026-10-17 |
| Source | `requirements.md` v0.3 |
| Status | **Proposed for CTO approval. Planned only. No tests have been written or run. Every status below is "Planned".** |

## 1. How to read this document

- **Type:** one type per TC.
  - **U** = gating automated unit-level test (Node.js).
  - **U-opt** = optional automated test, run separately, never gating.
  - **C** = CI check (a workflow-level check, not a unit test).
  - **M** = manual checklist test.
- **Counting rule.** Counts here are counts of planned test cases (TC IDs). They are not counts of individual automated tests, test suites or CI checks, and they are not results. One U test case may become several individual automated tests (for example, TC-010 checks many input values), so the number of individual tests will differ and is known only from real run output.
- **Status values:** Planned, Written, Passing, Failing. All entries start as Planned.
- **Evidence** is filled in only from real runs (date, commit, result). Until then it stays blank.
- Section 2 lists the tests. Section 3 maps requirements to criteria and tests. Section 4 maps acceptance criteria to tests. Section 5 is the coverage check. Section 8 lists proposed suites and phases.

## 2. Planned Test Catalogue

| Test ID | Title | Type | Covers | Pass condition |
|---|---|---|---|---|
| TC-001 | Catalogue data integrity | U | FR-001, FR-013 | Real sample catalogue: unique IDs; every product has name, description, category; price is a positive whole number; stock is a whole number of 0 or more; exactly 3 categories; at least one stock-0 and one stock 1 to 3 product. |
| TC-002 | Add product to empty cart | U | FR-002 | Cart has exactly one line with the correct product and quantity. |
| TC-003 | Re-adding merges lines | U | FR-002 | Adding the same product twice gives one line with summed quantity. |
| TC-004 | Change quantity | U | FR-002 | Line quantity and cart total update to the new correct values. |
| TC-005 | Remove line | U | FR-002 | Line is gone; other lines and total are correct. |
| TC-006 | Reject quantity 0 | U | FR-003 | ERR_QTY_INVALID; cart unchanged. |
| TC-007 | Reject negative quantity | U | FR-003 | ERR_QTY_INVALID for -1 and -100; cart unchanged. |
| TC-008 | Reject decimal quantity | U | FR-003 | ERR_QTY_INVALID for 1.5, "2.0", 0.5; cart unchanged. |
| TC-009 | Reject missing quantity | U | FR-003 | ERR_QTY_INVALID for undefined, null, "", "   "; cart unchanged. |
| TC-010 | Reject non-numeric quantity | U | FR-003 | ERR_QTY_INVALID for "abc", NaN, Infinity, "1e1", "0x10", "+2", "1,000", "007". |
| TC-011 | Accept valid whole-number text | U | FR-003 | "1", "10", " 3 " accepted and read as 1, 10, 3 (stock permitting). |
| TC-012 | Maximum quantity boundary | U | FR-012 | 10 accepted and 11 rejected with ERR_QTY_EXCEEDS_MAX, for a product with stock of at least 11. |
| TC-013 | Cumulative maximum | U | FR-012 | Cart holds 8, adding 3 is rejected; cart still holds 8. |
| TC-014 | Reject quantity above stock | U | FR-004 | Product with stock 3: request for 4 gives ERR_QTY_EXCEEDS_STOCK. |
| TC-015 | Accept quantity equal to stock | U | FR-004 | Product with stock 3: request for 3 accepted. |
| TC-016 | Out-of-stock product | U | FR-004 | Adding a stock-0 product gives ERR_OUT_OF_STOCK; cart unchanged. |
| TC-017 | Cumulative stock check | U | FR-004 | Stock 5, cart holds 4, adding 2 is rejected; cart still holds 4. |
| TC-018 | Rejected update leaves line unchanged | U | FR-002, FR-003, FR-004 | Updating a line to an invalid or over-stock quantity is rejected and the line keeps its previous quantity. |
| TC-019 | Unknown product on add/update | U | FR-011 | ERR_UNKNOWN_PRODUCT; cart unchanged. |
| TC-020 | Unknown product at checkout | U | FR-011 | Checkout with an unknown ID is rejected; no order; stock unchanged. |
| TC-021 | Empty cart checkout | U | FR-010 | Never-filled cart and fully-emptied cart both give ERR_EMPTY_CART; no order; stock unchanged. |
| TC-022 | Total calculation | U | FR-005, FR-013 | Multi-line cart total equals the expected whole number of cents (e.g. 2×2995 + 1×4950 = 10940). |
| TC-023 | Supplied prices ignored by calculation | U | FR-005 | Cart data containing altered prices or totals yields the same total as the catalogue-based calculation. This shows the calculation ignores supplied prices. It does not show tamper resistance. |
| TC-024 | Money is integer; formatting | U | FR-013 | All totals are integers; 1250 shows `$12.50`, 0 shows `$0.00`, 123456 shows `$1,234.56`; no floating-point artefacts. |
| TC-025 | Successful checkout | U | FR-006, FR-007, FR-015 | Valid cart gives an order with reference, status `Confirmed`, correct items and total; cart cleared. |
| TC-026 | No identity or payment data needed | U | FR-006, NFR-002 | Checkout succeeds with only the cart as input. |
| TC-027 | Stock deducted on success | U | FR-018 | Each purchased product's stock falls by exactly the purchased quantity; other products unchanged. |
| TC-028 | Failed checkout creates no order | U | FR-008 | Insufficient-stock checkout returns an error and the order list is unchanged. |
| TC-029 | Failed checkout leaves inventory unchanged | U | FR-008 | Inventory snapshot before equals snapshot after a failed checkout; cart unchanged. |
| TC-030 | Multi-line failure is all-or-nothing | U | FR-008 | Cart with one valid line and one over-stock line: no stock deducted from either. |
| TC-031 | Order reference format (deterministic) | U | FR-014 | With an injected random source supplying known values from 0 to 31, the reference equals `CF-` plus the exact expected 8 alphabet characters. Values 0 and 31 map to the first and last alphabet characters. |
| TC-032 | Reference collision handling (deterministic) | U | FR-014 | The injected source first yields a candidate equal to an existing order's reference, then a different one. The new order gets the second candidate, the existing order's reference is unchanged, and the source was asked for a second candidate. |
| TC-033 | Reference not derived from counter or clock | U | FR-014 | With the same injected source values and no collision, the reference is identical regardless of the number of existing orders and the injected clock value. |
| TC-034 | Single Confirmed status | U | FR-015 | Every created order has status `Confirmed`; no other status value exists. |
| TC-035 | Cart storage round trip | U | FR-016 | Saved cart reloads with identical lines; stored data contains no prices. |
| TC-036 | Corrupt stored cart | U | FR-016 | Invalid JSON or wrong-shaped data gives an empty cart and a notice, with no exception. |
| TC-037 | Stored cart re-validation | U | FR-016, FR-004, FR-011, FR-012 | Unknown product removed; over-limit quantity reduced; zero-limit line removed; notice lists the changes. |
| TC-038 | Storage unavailable | U | FR-016 | When storage throws, cart works in memory and a notice is produced. |
| TC-039 | Error codes and messages | U | FR-017 | Each failure type returns its stable code and a message containing the product name and numbers where the template requires them. |
| TC-040 | Gating tests run in Node.js in CI | C | NFR-005 | The CI job runs every gating test in plain Node.js with no browser or DOM, and fails if any gating test fails. |
| TC-041 | Catalogue display | M | FR-001 | All six fields shown for every product, grouped by category; "Out of stock" and "Low stock" labels shown; add control disabled for stock 0. |
| TC-042 | Cart actions in the interface | M | FR-002 | Add, change quantity and remove work and update totals immediately, with no page reload. |
| TC-043 | Validation messages visible | M | FR-003, FR-017 | Each RAC-003 scenario shows a visible message in the same view and changes nothing. |
| TC-044 | Confirmation screen | M | FR-007, FR-015, FR-019 | Shows reference, `Confirmed`, items with line totals, total in AUD, and notices D5 (on checkout) and D6 (on confirmation). |
| TC-045 | Cart survives refresh | M | FR-016, FR-019 | Two-line cart survives page refresh and browser close/reopen, and the cart view shows notice D2. |
| TC-046 | Desktop journey | M | RAC-002, NFR-009 | Journey completes at 1280×800 with no error, in two supported browsers. |
| TC-047 | Mobile journey | M | NFR-003 | Journey completes at 375×667; no horizontal scroll; controls at least 44×44 CSS px. |
| TC-048 | Public HTTPS access | M | NFR-001, NFR-002 | Private window opens the `https://` URL; no login prompt; no mixed-content warning. |
| TC-049 | Showcase content and links | M | FR-009 | Every FR-009 item is present, reachable in one click, and returns a page; repository is public. |
| TC-050 | Limitations disclosed | M | NFR-011 | Showcase lists all limitations; no page claims production-grade consistency, server-side price enforcement or tamper-proof prices. |
| TC-051 | CI passes | C | NFR-006 | Workflow triggers on push and pull request; latest main run is green. |
| TC-052 | Repository hygiene (run twice) | M | NFR-007 | Two runs, each recorded separately: **Run 1** is the Phase 1 baseline, completed before any new application files or commits are pushed, and **Run 2** is in Phase 3 on the release commit, before public release (publishing the demo site). On each run, a free secrets scan (tool chosen in Phase 1) covers the working tree and, where the tool supports it, the full commit history, with the tool and scope recorded, and reports 0 findings. A manual review confirms no `.env` or credential files and no personal data. Because the repository is public, any finding is treated as already exposed (credential revoked or replaced, then removed, then re-scanned, before any further changes are pushed). TC-052 passes only when both runs pass. |
| TC-053 | Hosting cost and free-tier check | M | NFR-004 | Every item of the hosting free-tier verification checklist is completed and recorded; no paid item appears on any account used; no paid custom domain. |
| TC-054 | Static-only check | M | NFR-008 | Published output has only static files; no server code or database. |
| TC-055 | Keyboard and labels | M | NFR-010 | Journey completable by keyboard only; every input labelled; messages announced; contrast at least 4.5:1. |
| TC-056 | Browser compatibility | M | NFR-009 | Main journey verified in at least two supported browsers. |
| TC-057 | Local run per README | M | NFR-006, NFR-012 | From a fresh clone, following the README, tests run with at most 3 documented commands. |
| TC-058 | Regression policy | M | Section 7.3 | At release, each fixed defect has a REG-nnn test listed in this matrix. |
| TC-059 | Reference retry exhaustion | U | FR-014, FR-008, FR-017 | The injected source always produces an existing reference. After 10 attempts checkout fails with ERR_ORDER_REFERENCE, no order is created, and inventory and cart are unchanged. |
| TC-060 | Statistical reference sanity check (optional) | U-opt | FR-014 | Using the real random source, 10,000 generated references all match the format and contain no duplicates. Run separately. By pure chance a duplicate appears in roughly 1 in 22,000 such runs, which is why this is not a gate. A failure is recorded and investigated. The deterministic tests TC-031 to TC-033 and TC-059 are the gating evidence. |
| TC-061 | Reload behaviour and visitor notices | M | FR-019, FR-016, FR-018, FR-007, NFR-011 | (1) Notice D1 is visible on every screen. (2) Add two products and see D2 on the cart view. (3) Place a demo order for a different product; D5 and D6 are shown and stock falls. (4) Reload: the cart is kept, stock is back to starting values, the confirmation is gone, and D1 is visible. (5) Repeat at 375 px width: all notices are visible without clicking or expanding. |

## 3. Requirement to Acceptance Criteria to Tests

### 3.1 Functional requirements

| Requirement | Acceptance criteria | Planned tests | Status |
|---|---|---|---|
| FR-001 Product Catalogue | RAC-002 | TC-001, TC-041 | Planned |
| FR-002 Cart Management | RAC-002 | TC-002, TC-003, TC-004, TC-005, TC-018, TC-042 | Planned |
| FR-003 Quantity Validation | RAC-003 | TC-006, TC-007, TC-008, TC-009, TC-010, TC-011, TC-018, TC-043 | Planned |
| FR-004 Stock Validation | RAC-003 | TC-014, TC-015, TC-016, TC-017, TC-018, TC-037 | Planned |
| FR-005 Catalogue-Based Price Calculation | RAC-008 | TC-022, TC-023 | Planned |
| FR-006 Simulated Checkout | RAC-002 | TC-025, TC-026, TC-046 | Planned |
| FR-007 Order Confirmation | RAC-002 | TC-025, TC-044, TC-061 | Planned |
| FR-008 Failed Order Integrity | RAC-003 | TC-028, TC-029, TC-030, TC-059 | Planned |
| FR-009 Engineering Showcase | RAC-004 | TC-049 | Planned |
| FR-010 Empty Cart Validation | RAC-003 | TC-021 | Planned |
| FR-011 Unknown Product Validation | RAC-003 | TC-019, TC-020, TC-037 | Planned |
| FR-012 Maximum Quantity per Line | RAC-003 | TC-012, TC-013, TC-037 | Planned |
| FR-013 Money Representation | RAC-008 | TC-001, TC-022, TC-024 | Planned |
| FR-014 Order Reference | RAC-011 | TC-031, TC-032, TC-033, TC-059 (optional: TC-060) | Planned |
| FR-015 Order Status | RAC-002 | TC-025, TC-034, TC-044 | Planned |
| FR-016 Cart Persistence | RAC-009 | TC-035, TC-036, TC-037, TC-038, TC-045, TC-061 | Planned |
| FR-017 Validation Feedback | RAC-003 | TC-039, TC-043, TC-059 | Planned |
| FR-018 Inventory Deduction | RAC-002, RAC-003 | TC-027, TC-029, TC-061 | Planned |
| FR-019 Visitor-Facing Demo Behaviour | RAC-009, RAC-010 | TC-044, TC-045, TC-061 | Planned |

### 3.2 Non-functional requirements

| Requirement | Acceptance criteria | Planned tests | Status |
|---|---|---|---|
| NFR-001 HTTPS | RAC-001 | TC-048 | Planned |
| NFR-002 No account | RAC-001 | TC-026, TC-048 | Planned |
| NFR-003 Desktop and mobile | RAC-006 | TC-047 | Planned |
| NFR-004 No paid services | RAC-007 | TC-053 | Planned |
| NFR-005 Testable business logic | RAC-005 | TC-040 | Planned |
| NFR-006 Tests locally and in CI | RAC-005 | TC-051, TC-057 | Planned |
| NFR-007 No secrets or personal data | RAC-012 | TC-052 | Planned |
| NFR-008 Static-only architecture | RAC-007 | TC-054 | Planned |
| NFR-009 Browser support | RAC-002 | TC-046, TC-056 | Planned |
| NFR-010 Basic accessibility | RAC-013 | TC-055 | Planned |
| NFR-011 Transparency about limitations | RAC-010 | TC-050, TC-061 | Planned |
| NFR-012 Beginner-runnable setup | RAC-005 | TC-057 | Planned |

## 4. Acceptance Criteria to Tests

| Criterion | Planned tests |
|---|---|
| RAC-001 Public access | TC-048 |
| RAC-002 Working shopping journey | TC-002 to TC-005, TC-025, TC-027, TC-042, TC-044, TC-046, TC-056 |
| RAC-003 Business validation | TC-006 to TC-021, TC-028 to TC-030, TC-039, TC-043 |
| RAC-004 Engineering evidence | TC-049 |
| RAC-005 Automated quality checks | All TCs of type U (gating); TC-040, TC-051, TC-057 |
| RAC-006 Mobile usability | TC-047 |
| RAC-007 Cost control and static architecture | TC-053, TC-054 |
| RAC-008 Money integrity | TC-001, TC-022, TC-023, TC-024 |
| RAC-009 Cart persistence | TC-035 to TC-038, TC-045, TC-061 |
| RAC-010 Honest limitations and visible demo behaviour | TC-044, TC-050, TC-061 |
| RAC-011 Order reference | TC-031, TC-032, TC-033, TC-059 (optional: TC-060) |
| RAC-012 Repository hygiene | TC-052 |
| RAC-013 Basic accessibility | TC-055 |

## 5. Coverage Check (counts of planned test cases only; no results)

| Type | Count | Test cases |
|---|---|---|
| U, gating automated unit-level | 40 | TC-001 to TC-039, and TC-059 |
| U-opt, optional automated | 1 | TC-060 |
| C, CI checks | 2 | TC-040, TC-051 |
| M, manual | 18 | TC-041 to TC-050, TC-052 to TC-058, TC-061 |
| **Total planned test cases** | **61** | |

- Functional requirements: 19. With at least one test case: 19.
- Non-functional requirements: 12. With at least one test case: 12.
- Acceptance criteria: 13. With at least one test case: 13.
- Individual automated tests: not yet known (none written).
- Written: 0. Passing: 0. Failing: 0.
- Maintenance rule: when a requirement, criterion or test case changes, update this file in the same commit.

## 6. Evidence Log (empty until tests are run)

TC-052 requires two separate evidence entries: Run 1 (Phase 1 baseline) and Run 2 (Phase 3, release commit, before public release). Each entry records the date, commit, tool, scan scope and result. The same rule applies to any other test case that is run in more than one phase.

| Test ID | Date run | Commit | Tester or CI run | Result |
|---|---|---|---|---|
| (none recorded) | | | | |

## 7. Regression Tests (empty until a defect is fixed)

| REG ID | Defect reference | Requirement protected | Date added |
|---|---|---|---|
| (none) | | | |

## 8. Proposed Test Suites and Phases

Suites are a proposed grouping for the gating unit-level tests. They may change when the tests are written.

| Suite | Test cases | Count |
|---|---|---|
| Catalogue and money | TC-001, TC-022, TC-023, TC-024 | 4 |
| Cart operations | TC-002, TC-003, TC-004, TC-005, TC-018 | 5 |
| Quantity validation | TC-006 to TC-011 | 6 |
| Stock and limits | TC-012 to TC-017 | 6 |
| Product and empty-cart validation | TC-019, TC-020, TC-021 | 3 |
| Checkout and inventory | TC-025 to TC-030, TC-034 | 7 |
| Order reference | TC-031, TC-032, TC-033, TC-059 | 4 |
| Cart persistence | TC-035 to TC-038 | 4 |
| Validation feedback | TC-039 | 1 |
| **Gating suites: 9** | | **40** |
| Optional statistical suite (separate) | TC-060 | 1 |

| Phase | Test cases planned |
|---|---|
| Phase 1: business logic and unit tests | **First action: TC-052 Run 1 (repository hygiene baseline), completed before any new application files or commits are pushed.** Then implementation: business logic and order creation, cart persistence logic behind a replaceable storage interface, error codes and messages as data, a README with test instructions, and the CI workflow running the gating tests. Then testing: all gating U; U-opt TC-060; TC-040, TC-051, TC-057; TC-058 started |
| Phase 2: storefront | TC-041 to TC-047, TC-055, TC-056, TC-061 |
| Phase 3: publishing and release verification | TC-048, TC-049, TC-050, TC-052 (Run 2, final, before public release), TC-053, TC-054; TC-058 closed; re-run of TC-046, TC-047, TC-056, TC-061 on the published address |