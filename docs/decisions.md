# Design Decisions

## Architecture

- **Modular monolith** with 7 modules: Catalog, Inventory, Shopping, Orders, Reviews, Identity, System
- **Module build order**: Catalog & Identity first (independent) → Inventory → Shopping → Orders → Reviews → System
- **Incremental development with upfront design**: high-level ERD + architecture first, then implement module-by-module
- **Repository pattern** with aggregate roots; aggregate roots exposed via API use dual ID pattern except audit_logs because the admin only will see it

---

## Database & ERD

### Entity Design

| Decision | Evidence in ERD |
|----------|-----------------|
| **Dual ID pattern** (`bigint` PK + `uuid` UK) on entities exposed via API | `USERS`, `PRODUCTS`, `CATEGORIES`, `CARTS`, `ORDERS`, `REVIEWS`, `INVENTORY` all have both `id PK` and `uuid UK` |
| **JSONB for variant attributes** | `PRODUCT_VARIANTS.attributes` typed `jsonb` with note "PostgreSQL JSONB for specs" |
| **Soft delete for products** | `PRODUCTS.is_deleted` boolean field |
| **Variant deactivation** | `PRODUCT_VARIANTS.is_active` boolean (instead of deleting) |
| **Price per variant** | `decimal price` on `PRODUCT_VARIANTS` (not on `PRODUCTS`) |
| **Separate product images table** | `PRODUCT_IMAGES` entity linked to `PRODUCTS` with `url`, `alt_text`, `display_order`, `is_primary` |
| **Primary image boolean flag** | `PRODUCT_IMAGES.is_primary` — enforced via partial unique index |
| **Self-referencing categories** | `CATEGORIES.parent_id FK` for hierarchical nesting |
| **Full-text search** | `PRODUCTS.search_vector` as `tsvector` generated from name & description |

### Inventory

| Decision | Evidence in ERD |
|----------|-----------------|
| **Stock tracked per variant** | `INVENTORY` entity linked 1:1 to `PRODUCT_VARIANTS` via `variant_id FK` |
| **Low stock threshold** | `INVENTORY.low_stock_threshold` field |
| **Reservation system** | `INVENTORY_RESERVATIONS` with `status` (ACTIVE/EXPIRED/FULFILLED/CANCELLED) and `expires_at` |
| **Inventory change logging** | `INVENTORY_LOGS` with `operation_type`, `previous_quantity`, `new_quantity` |

### Cart

| Decision | Evidence in ERD |
|----------|-----------------|
| **Cart dual identification** | `CARTS` has both `user_id FK (nullable)` and `session_id UK (nullable)` |
| **Price stored at addition** | `CART_ITEMS.price_at_addition` field |
| **Cascade to items** | `CARTS ||--o{ CART_ITEMS` relationship |

### Orders

| Decision | Evidence in ERD |
|----------|-----------------|
| **Guest checkout** | `ORDERS.user_id FK` noted as "nullable for guest checkout" |
| **Order number format** | `ORDERS.order_number UK` (ORD-YYYYMMDD-XXXXX) |
| **Snapshots on order items** | `ORDER_ITEMS` has `product_name`, `variant_attributes`, `unit_price`, `total_price` all marked "Snapshot" |
| **Denormalized totals** | `ORDERS.subtotal`, `shipping_cost`, `tax_amount`, `total_amount` stored directly |
| **Status workflow** | `ORDERS.status` with values: PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED |
| **Status history logging** | `ORDER_LOGS` with `from_status`, `to_status`, `reason`, `performed_by` |

### Reviews

| Decision | Evidence in ERD |
|----------|-----------------|
| **Status-based moderation** | `REVIEWS.status` with values PENDING, APPROVED, REJECTED (no separate log table) |
| **One review per product per order** | `REVIEWS` linked to both `product_id` and `order_id` (unique constraint enforced) |

### Pricing

| Decision | Evidence in ERD |
|----------|-----------------|
| **Price history as immutable log** | `PRICE_LOGS` with `old_price`, `new_price`, `variant_id FK` and `created_at` |

### Configuration

| Decision | Evidence in ERD |
|----------|-----------------|
| **Single-row store settings** | `STORE_SETTINGS` with `base_currency`, `currency_symbol`, `flat_rate_shipping`, `free_shipping_threshold`, `tax_rate_percent` |

### Audit & Logging

| Decision | Evidence in ERD |
|----------|-----------------|
| **Generic audit log** | `AUDIT_LOGS` with `entity_type`, `entity_id`, `action`, `performed_by FK`, `changes (jsonb)` |
| **User roles** | `USERS.role` with values CUSTOMER, ADMIN |

### Timestamps

| Decision | Evidence in ERD |
|----------|-----------------|
| **`created_at` on all entities** | Present on every entity |
| **`updated_at` on mutable entities** | Present on `USERS`, `PRODUCTS`, `CATEGORIES`, `PRODUCT_IMAGES`, `PRODUCT_VARIANTS`, `CARTS`, `CART_ITEMS`, `ORDERS`, `ORDER_ITEMS`, `REVIEWS`, `STORE_SETTINGS` |
