# E-Commerce Backend System

Version 2.0

## Purpose

This document defines the business requirements for a medium-sized E-Commerce Backend System. The system supports online retail operations including product catalog management, variant management, inventory tracking, shopping cart functionality, order processing, customer reviews, and authentication.

## Scope

Backend platform for a single-vendor online retail business. Manages the complete product lifecycle from catalog creation through order fulfillment. Payment processing and notification services are planned for future phases.

## Definitions

| Term | Definition |
|------|------------|
| SKU | Stock Keeping Unit — unique identifier for each product variant |
| Variant | A specific version of a product (e.g., size, color) with its own SKU, price, and stock |
| Product | A parent entity that groups one or more variants |
| Catalog | Complete collection of products available for sale |
| Inventory | Stock quantities tracked per variant |
| Cart | Temporary collection of items a customer intends to purchase |
| Order | Confirmed transaction record of purchased items |

---

## Functional Requirements

### 1. Product Management (FR-001 — FR-005)

- **FR-001 Create Product**: Name, description, and category required. Name must be unique (case-insensitive). System generates unique ID. Default status: "Draft". At least one variant needed to be purchasable.
- **FR-002 Update Product**: Update name, description, category, status. Record modification timestamp.
- **FR-003 Delete Product**: Soft deletion (deactivation). Removed from customer-facing catalog. Remains for historical order reference. Active cart items flagged for review.
- **FR-004 Get Product Details**: Returns name, description, category, status, variants. Each variant: SKU, price, attributes, available stock. Returns average rating and count of approved reviews.
- **FR-005 List Products**: Paginated (default 20, max 100). Sorted by creation date (newest first).

### 2. Variant Management (FR-006 — FR-009)

- **FR-006 Create Variant**: Requires SKU (unique across system), price (positive decimal, max 2 places), attributes (structured data). Default status: "Active". Product needs ≥1 active variant to be purchasable.
- **FR-007 Update Variant**: Update price, attributes, status. SKU immutable after creation. Price changes don't affect existing orders. Record modification timestamp.
- **FR-008 Delete Variant**: Deactivation via status (soft delete). Product must retain ≥1 active variant. Deactivated variants invisible in catalog but remain for historical reference.
- **FR-009 Get Variant Details**: Returns SKU, price, attributes, status, available stock, and parent product details.

### 3. Category Management (FR-010 — FR-013)

- **FR-010 Create Category**: Name, description, optional parent. Name unique within same parent level. Max nesting: 3 levels.
- **FR-011 Update Category**: Update name, description. Reassign parent — no circular references, no nesting depth violation.
- **FR-012 Delete Category**: Only if no direct products assigned and no subcategories.
- **FR-013 Get Category Tree**: Return hierarchy as tree with ID, name, description, parent ID, child count, and product count per node.

### 4. Product Images (FR-014 — FR-017)

- **FR-014 Add Image**: Multiple images per product (max 10). Each has URL, alt text, display order, primary flag. Only one primary per product. Valid formats: JPEG, PNG, WebP. Max file size: 5MB.
- **FR-015 Update Image**: Update alt text, display order, primary flag. Reorder display sequence.
- **FR-016 Delete Image**: Remove individual images. Primary image deletion requires setting another as primary first.
- **FR-017 Get Images**: All images sorted by display order; primary image clearly indicated.

### 5. Inventory Management (FR-018 — FR-022)

- **FR-018 Set Initial Inventory**: Set stock per variant (non-negative integer). Record reason for audit.
- **FR-019 Update Inventory**: Manual adjustment (increment/decrement). Log all changes with timestamp, previous/new quantity, and reason. Support low-stock threshold per variant.
- **FR-020 Get Inventory Status**: Current stock quantity. Stock status: "In Stock", "Low Stock", "Out of Stock".
- **FR-021 Reserve Inventory**: Stock reservation during order placement. Reserved stock unavailable to others. Reservation expires after configurable timeout (default: 15 min). Expired reservations released automatically.
- **FR-022 Deduct Inventory**: Deduct on successful order confirmation. Fail if insufficient stock. Support partial deduction for partial fulfillment.

### 6. Shopping Cart (FR-023 — FR-028)

- **FR-023 Create Cart**: New cart per unique session/customer. Unique cart identifier. Cart starts empty.
- **FR-024 Add Item**: Add variant quantity to cart. If variant exists, sum quantities. Validate: variant active, quantity positive, quantity ≤ available stock. Store variant price at time of adding.
- **FR-025 Update Quantity**: Modify item quantity. Validate against stock. Quantity of zero removes item.
- **FR-026 Remove Item**: Remove individual items. Support clearing entire cart.
- **FR-027 Get Cart Details**: All items with product details, quantity, unit price, line total. Calculate subtotal. Flag unavailable items or price changes.
- **FR-028 Validate Cart**: Validate items against inventory and pricing. Identify out-of-stock items, quantity exceedances, price changes. Return results without modifying cart.

### 7. Order Management (FR-029 — FR-034)

- **FR-029 Place Order**: Create from validated cart. Order includes: unique order number (ORD-YYYYMMDD-XXXXX), timestamp, items, quantities, prices, totals. Capture customer name, shipping address, contact info. Calculate total (subtotal + shipping + tax). Reserve inventory. Default status: "Pending". Clear cart on success.
- **FR-030 Update Status**: Transitions: Pending → Confirmed → Processing → Shipped → Delivered. Cancellable from Pending or Confirmed. Cancellation releases inventory. Record timestamp and reason for each change.
- **FR-031 Get Order Details**: Order number, status, items, quantities, prices, totals, shipping address, status history. Include current product names and images.
- **FR-032 List Orders**: Paginated. Filter by: status, date range. Sort by: order date, total amount. Default: newest first.
- **FR-033 Cancel Order**: Only for Pending or Confirmed. Restore inventory. Record reason and timestamp.
- **FR-034 Calculate Totals**: Subtotal = sum(qty × unit price). Free shipping above configurable threshold, flat rate below. Tax = percentage of subtotal. Total = subtotal + shipping + tax.

### 8. Reviews (FR-035 — FR-040)

- **FR-035 Submit Review**: For purchased products. Rating (1–5), title, body. Associated with completed order. One review per product per order. Default status: "Pending" (requires moderation).
- **FR-036 Moderate Review**: Approve or reject. Approved reviews visible. Record decision and timestamp.
- **FR-037 Update Review**: Author can update before moderation. Update after moderation resets status to "Pending".
- **FR-038 Delete Review**: By author (always). By admin (regardless of status).
- **FR-039 Get Product Reviews**: Approved reviews with pagination. Statistics: average rating, total count, distribution by star rating. Sorted most recent first.
- **FR-040 Get User Reviews**: All reviews by customer. Filter by status (pending, approved, rejected).

### 9. Product Search (FR-041 — FR-043)

- **FR-041 Search Products**: Full-text search on name and description. Case-insensitive. Partial word matching. Relevance scoring. Pagination.
- **FR-042 Filter Products**: By category (single/multiple), price range, availability (in stock only), rating range. Filters combinable (AND logic). Return filter options with counts for faceted navigation.
- **FR-043 Sort Products**: By price (asc/desc), average rating (asc/desc), newest first, oldest first, name (A–Z, Z–A). Default: relevance (search) or newest first (browsing).

### 10. Currency & Pricing (FR-044 — FR-045)

- **FR-044 Currency Management**: Single base currency. All prices stored in base currency. Currency symbol and code configurable. Consistent decimal formatting.
- **FR-045 Price History**: Maintain history of price changes per variant. Includes previous price, new price, effective timestamp. Retrieve price at specific point in time.

### 11. Shipping (FR-046 — FR-047)

- **FR-046 Shipping Configuration**: Configurable flat rate, free shipping threshold, tax rate percentage. Admin updatable.
- **FR-047 Address Validation**: Full name (≥2 parts), street (≥5 chars), city (≥2 chars), state (≥2 chars), postal code (≥4 chars), country code (2 chars).

### 12. Authentication & Authorization (FR-048 — FR-050)

- **FR-048 Register**: Email, password, first name, last name. Email unique. Password complexity requirements.
- **FR-049 Login**: Authenticate by email and password. Return session token. Distinguish Customer and Administrator roles.
- **FR-050 Manage Profile**: Update name, phone. Change password.

---

## Use Cases

### Actors

| Actor | Description |
|-------|-------------|
| Administrator | Manages product catalog, variants, inventory, orders, reviews, and system configuration |
| Customer | Registers, browses products, manages cart, places orders, and submits reviews |
| System | Automated processes (inventory reservation expiry, stock calculations, session management) |

### Use Case List

| UC | Name | Actor | Requirements |
|----|------|-------|-------------|
| UC-001 | Manage Products and Variants | Administrator | FR-001 — FR-009 |
| UC-002 | Manage Categories | Administrator | FR-010 — FR-013 |
| UC-003 | Manage Product Images | Administrator | FR-014 — FR-017 |
| UC-004 | Manage Inventory | Administrator | FR-018 — FR-020 |
| UC-005 | Reserve and Deduct Inventory | System | FR-021, FR-022 |
| UC-006 | Manage Shopping Cart | Customer | FR-023 — FR-028 |
| UC-007 | Place Order | Customer | FR-029, FR-034, FR-046, FR-047 |
| UC-008 | Manage Orders | Administrator / Customer | FR-030 — FR-033 |
| UC-009 | Submit and Manage Reviews | Customer | FR-035, FR-037, FR-038 |
| UC-010 | Moderate Reviews | Administrator | FR-036 |
| UC-011 | View Reviews | Customer / Administrator | FR-039, FR-040 |
| UC-012 | Search and Browse Products | Customer | FR-041 — FR-043 |
| UC-013 | View Price History | Administrator | FR-045 |
| UC-014 | Configure System Settings | Administrator | FR-044, FR-046, FR-047 |
| UC-015 | Register Account | Customer | FR-048 |
| UC-016 | Login | Customer / Administrator | FR-049 |
| UC-017 | Manage Profile | Customer | FR-050 |

---

## Non-Functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-001 | Performance | Product listing ≤500ms (10K products), search ≤1s, cart ≤200ms, order placement ≤2s |
| NFR-002 | Data Integrity | Atomic order creation, consistent inventory deduction, isolated cart operations |
| NFR-003 | API Design | RESTful conventions, consistent response formats, meaningful error codes with codes, API versioning |
| NFR-004 | Data Protection | Input sanitization, SQL injection prevention, XSS prevention, parameterized queries |
| NFR-005 | Rate Limiting | 100 requests/min/IP with appropriate status codes |
| NFR-006 | Compatibility | Standard HTTP, JSON response format exclusively |
| NFR-007 | Audit Trail | Logs for: product changes, inventory changes, order status changes, review moderation. Includes timestamp, user/system identifier, action, affected entity |

---

## Business Rules

| ID | Rule |
|----|------|
| BR-001 | Product names unique (case-insensitive); SKUs unique (case-sensitive) |
| BR-002 | Only "Active" products in customer catalog; "Draft" visible to admins only |
| BR-003 | Each product belongs to exactly one leaf category |
| BR-004 | Prices positive (min $0.01, max $99,999.99); stored at cart addition and order placement |
| BR-005 | Each product needs ≥1 active variant to be purchasable |
| BR-006 | Available stock = total stock − reserved stock |
| BR-007 | Reservations expire after 15 minutes; released automatically or on cancellation |
| BR-008 | Never allow negative stock; atomic concurrent operations |
| BR-009 | Carts identified by session/customer; empty carts preserved until explicit deletion |
| BR-010 | Max 50 unique items per cart; max 99 qty per item; min 1 qty per item |
| BR-011 | Cart displays current prices; indicates price changes; final price at order placement |
| BR-012 | Cart must have ≥1 item, all validated, valid shipping address, customer contact |
| BR-013 | Orders progress forward only; cancellable from Pending or Confirmed; all changes logged |
| BR-014 | Order prices locked at placement; subsequent changes don't affect existing orders |
| BR-015 | Cancellation restores inventory; recorded with reason |
| BR-016 | Order number format: ORD-YYYYMMDD-XXXXX |
| BR-017 | Review only for purchased products in delivered orders; one per product per order |
| BR-018 | Rating 1–5 (integer); title 5–100 chars; body 20–2000 chars; sanitized |
| BR-019 | Reviews default to "Pending"; only approved in public listings |
| BR-020 | Author can update before moderation; updates after moderation reset to Pending |
| BR-021 | Search matches name and description; ignores stop words; min term length 2 chars |
| BR-022 | Multiple filters combined with AND logic; filter counts reflect applied filters |
| BR-023 | Free shipping ≥ threshold; flat rate below threshold; calculated once at creation |
| BR-024 | Tax on subtotal only (not shipping); uniform rate across all products |

---

## Assumptions

1. **Single Currency**: System operates with a single base currency. Multi-currency out of scope.
2. **Single Vendor**: Single business entity selling products. Marketplace excluded.
3. **Physical Products**: All products are physical goods requiring shipping. Digital products excluded.
4. **Flat Rate Shipping**: Flat rate or free shipping threshold. Real-time carrier integration excluded.
5. **No Backorder**: Items cannot be purchased when stock reaches zero.
6. **Customer Identification**: Registered accounts (email + password). Guest checkout supported.
7. **Data Retention**: Historical data retained permanently. Data purge out of scope.

---

## Edge Cases (26 total)

Documented in detail in `docs/req.md §5`. Covers: product deletion during active cart, price change during cart session, category reassignment, concurrent stock depletion, stock restoration on partial cancellation, reservation expiry during checkout, duplicate order submission, concurrent price updates, API rate limiting, and more.
