# Functional Requirements
E-Commerce Backend System
Version 0.3.0

## 2. Functional Requirements

### 2.1 Product Management

FR-001: Create Product
- System shall allow creation of new products with the following mandatory attributes: name, description, and category assignment
- Product name must be unique within the system (case-insensitive)
- System shall generate a unique product identifier upon creation
- Product shall be created in "Draft" status by default
- At least one variant must be created for the product to be purchasable (see FR-006)

FR-002: Update Product
- System shall allow updating of product attributes: name, description, category, and status
- System shall record the timestamp of last modification

FR-003: Delete Product
- System shall support soft deletion of products (deactivation)
- Deleted products shall no longer appear in customer-facing catalog
- Deleted products and their variants shall remain in system for historical order reference
- Active cart items referencing variants of deleted products shall be flagged for customer review

FR-004: Get Product Details
- System shall return complete product information including: name, description, category, status, and all associated variants
- System shall return for each variant: SKU, price, attributes, and available stock
- System shall calculate and return average rating from approved reviews
- System shall return total count of approved reviews

FR-005: List Products
- System shall support paginated retrieval of product lists
- Default page size shall be 20 products
- Maximum page size shall be 100 products
- System shall return products sorted by creation date (newest first) by default

### 2.2 Variant Management

FR-006: Create Variant
- System shall allow creation of variants under a parent product with the following mandatory attributes: SKU, price, and attributes (e.g., size, color)
- System shall allow setting inventory details like quantity and threshold
- SKU must be unique across all variants in the system
- Price must be a positive decimal value with maximum 2 decimal places
- Variant attributes shall be stored as structured data (e.g., JSON)
- Variant shall be created in "Active" status by default
- Each product must have at least one active variant to be purchasable

FR-007: Update Variant
- System shall allow updating of variant attributes: price and attributes
- System shall allow activation of variant
- SKU shall not be modifiable after creation
- Price changes shall not affect existing orders
- System shall record the timestamp of last modification

FR-008: Delete Variant
- System shall support deactivation of variants (soft delete via status)
- A product must retain at least one active variant
- Deactivated variants shall not appear in customer-facing catalog
- Deactivated variants shall remain in system for historical order reference

FR-009: Get Variant Details
- System shall return complete variant information including: SKU, price, attributes, status, and available stock
- System shall return the parent product details

### 2.3 Category Management

FR-010: Create Category
- System shall allow creation of categories with: name, description, and optional parent category
- Category name must be unique within the same parent level
- Maximum nesting depth shall be 3 levels
- System shall generate a unique category identifier upon creation

FR-011: Update Category
- System shall allow updating of category name and description
- Category name must be unique within the same parent level

FR-012: Delete Category
- System shall support deletion of categories only if:
  - Category has no direct products assigned
  - Category has no subcategories


FR-013: Get Category Tree
- System shall return complete category hierarchy as a tree structure
- Each node shall include: category ID, name, description, parent ID, and child count
- System shall include count of products directly assigned to each category

### 2.4 Product Images

FR-014: Add Product Image
- System shall allow upload of multiple images per product
- Each image shall have: URL/reference, alt text, and primary flag
- Only one image per product can be marked as primary


FR-015: Update Product Image
- System shall allow update of image metadata: alt text, display order, primary flag
- System shall allow reordering of display sequence

FR-016: Delete Product Image
- System shall allow removal of individual product images
- Primary image deletion shall require setting another image as primary first

FR-017: Get Product Images
- System shall return all images for a product sorted by display order
- System shall clearly indicate primary image

### 2.5 Inventory Management

FR-018: Set Initial Inventory
- System shall allow setting of stock quantity per variant upon creation
- Stock quantity must be a non-negative integer
- System shall record inventory change reason for audit purposes

FR-019: Update Inventory
- System shall support manual adjustment of stock quantities per variant
- System shall support both increment and decrement operations
- System shall log all inventory changes with: timestamp, previous quantity, new quantity, and reason
- System shall support setting low stock threshold per variant


### 2.6 Shopping Cart

FR-020: Create Cart
- System shall create a new cart for each unique session/customer
- Cart shall be identified by a unique cart identifier

FR-021: Add Item to Cart
- System shall add specified quantity of a variant to cart
- If variant already exists in cart, quantities shall be summed
- System shall validate:
  - Variant exists and is active
  - Requested quantity is positive
  - Requested quantity does not exceed available stock
- System shall store variant price at time of adding

FR-022: Update Cart Item Quantity
- System shall allow modification of item quantity in cart
- System shall validate new quantity against available stock
- Quantity of zero shall remove item from cart

FR-023: Remove Item from Cart
- System shall support removal of individual items from cart
- System shall support clearing entire cart

FR-024: Get Cart Details
- System shall return all items in cart with: product details, quantity, unit price, and line total
- System shall calculate and return cart subtotal
- System shall indicate if any items are no longer available or have price changes
- System shall calculate estimated total items count

FR-025: Validate Cart
- System shall validate all cart items against current inventory and pricing
- System shall identify: out-of-stock items, quantity exceedances, and price changes
- System shall return validation results without modifying cart

### 2.7 Order Management

FR-026: Place Order
- System shall create order from validated cart contents
- Order shall include: order number (unique, human-readable), timestamp, items, quantities, prices, and calculated totals
- Order shall capture: customer name, shipping address, and contact information
- System shall calculate order total including: subtotal, shipping cost (flat rate or free above threshold), and applicable taxes
- Order shall be created in "Pending" status
- Inventory shall be deducted atomically during order placement
- System shall clear cart upon successful order creation

FR-027: Update Order Status
- System shall support order status transitions:
  - Pending → Confirmed → Processing → Shipped → Delivered
  - Pending → Cancelled
  - Confirmed → Cancelled
- Cancelled orders shall restore deducted inventory
- System shall record timestamp and reason for each status change

FR-028: Get Order Details
- System shall return complete order information: order number, status, items, quantities, prices, totals, shipping address, and status history
- System shall include current product names and images for display

FR-029: List Orders
- System shall support paginated retrieval of orders
- System shall support filtering by: status, date range
- System shall support sorting by: order date, total amount
- Default sort shall be by order date (newest first)

FR-030: Cancel Order
- System shall allow cancellation only for orders in "Pending" or "Confirmed" status
- Orders in "Processing" or later statuses cannot be cancelled
- Cancellation shall restore the deducted inventory
- System shall record cancellation reason
- System shall generate cancellation timestamp

FR-031: Calculate Order Totals
- System shall calculate subtotal as sum of (quantity × unit price) for all items
- System shall apply shipping rules:
  - Free shipping for orders above configurable threshold
  - Flat rate shipping below threshold
- System shall calculate tax as percentage of subtotal
- System shall compute final total as subtotal + shipping + tax

### 2.8 Reviews

FR-033: Submit Review
- System shall allow submission of reviews for purchased products
- Review shall include: rating (1-5 stars), title, and body text
- Review shall be associated with a completed order
- System shall allow one review per product per order
- Review shall be created in "Pending" status (requires moderation)

FR-034: Moderate Review
- System shall support approval or rejection of submitted reviews
- Approved reviews shall be visible in product listing
- Rejected reviews shall not be visible
- System shall record moderation decision and timestamp

FR-035: Update Review
- System shall allow author to update own review before moderation
- Updates after moderation shall reset status to "Pending"

FR-036: Delete Review
- System shall allow deletion of reviews by author
- System shall allow administrative deletion regardless of status

FR-037: Get Product Reviews
- System shall return approved reviews for a product
- System shall support pagination
- System shall return review statistics: average rating, total count, distribution by star rating
- System shall return reviews sorted by most recent first

FR-038: Get User Reviews
- System shall return all reviews submitted by a specific customer
- System shall support filtering by status (pending, approved, rejected)

### 2.9 Product Search

FR-039: Search Products
- System shall support search across product name and description using ILIKE (case-insensitive partial matching)
- Search shall be case-insensitive
- Search shall support partial word matching
- System shall support pagination of search results

FR-040: Filter Products
- System shall support filtering by:
  - Category (single or multiple)
  - Price range (minimum and maximum)
  - Availability (in stock only)
  - Rating range (minimum average rating)
- Filters shall be combinable (AND logic)

FR-041: Sort Products
- System shall support sorting by:
  - Price (ascending/descending)
  - Average rating (ascending/descending)
  - Newest first (creation date descending)
  - Oldest first (creation date ascending)
  - Name (A-Z, Z-A)
- Default sort shall be newest first

### 2.10 Currency and Pricing

FR-042: Currency Management
- System shall support a single base currency for the platform
- System shall store all prices in the base currency
- Currency symbol and code shall be configurable
- System shall display prices with consistent decimal formatting

FR-043: Price History
- System shall maintain history of price changes for variants
- Price history shall include: previous price, new price, and effective timestamp
- System shall allow retrieval of price at specific point in time

### 2.11 Shipping

FR-044: Shipping Configuration
- System shall support configuration of:
  - Flat rate shipping cost
  - Free shipping threshold
  - Tax rate (percentage)
- System shall allow these values to be updated by administrator

FR-045: Shipping Address Validation
- System shall validate shipping address completeness:
  - Full name (minimum 2 parts)
  - Street address (minimum 5 characters)
  - City (minimum 2 characters)
  - State/Province (minimum 2 characters)
  - Postal code (minimum 4 characters)
  - Country code (2 characters)

### 2.12 Authentication & Authorization

FR-046: Register Account
- System shall allow customers to register with email, password, first name, and last name
- Email must be unique across all registered users
- Password must meet minimum complexity requirements

FR-047: Login
- System shall authenticate users by email and password
- System shall return a session token upon successful authentication
- System shall distinguish between Customer and Administrator roles

FR-048: Manage Profile
- System shall allow authenticated users to update their profile (name, phone)
- System shall allow users to change their password



### 2.13 Audit logging & Store Settings
FR-049: Audit Logging
- System shall maintain an audit trail of all administrative and system actions (create, update, delete) across entities: products, categories, variants, reviews, store settings
- Each entry shall record: entity type, entity ID, action, performer (USER or SYSTEM), and the change details

FR-50: Store Settings
- System shall maintain a single store configuration record containing: base currency, currency symbol, flat shipping rate, free shipping threshold, and tax rate
- Only administrators shall view or modify store settings
- Settings changes shall be recorded in the audit log