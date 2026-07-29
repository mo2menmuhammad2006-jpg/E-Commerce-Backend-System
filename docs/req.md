Software Requirements Specification (SRS)
E-Commerce Backend System
Version 2.0
1. Introduction
1.1 Purpose
This document defines the business requirements for a medium-sized E-Commerce Backend System. The system supports online retail operations including product catalog management, variant management, inventory tracking, shopping cart functionality, order processing, customer reviews, and authentication.
1.2 Scope
The system serves as a backend platform for a single-vendor online retail business. It manages the complete product lifecycle from catalog creation through order fulfillment, excluding payment processing and notification services (planned for future phases).


1.3 Definitions
Term	Definition
SKU	Stock Keeping Unit - unique identifier for each product variant
Variant	A specific version of a product (e.g., size, color) with its own SKU, price, and stock
Product	A parent entity that groups one or more variants
Catalog	Complete collection of products available for sale
Inventory	Stock quantities tracked per variant
Cart	Temporary collection of items a customer intends to purchase
Order	Confirmed transaction record of purchased items


2. Functional Requirements
2.1 Product Management
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



2.2 Variant Management
FR-006: Create Variant
- System shall allow creation of variants under a parent product with the following mandatory attributes: SKU, price, and attributes (e.g., size, color)
- SKU must be unique across all variants in the system
- Price must be a positive decimal value with maximum 2 decimal places
- Variant attributes shall be stored as structured data (e.g., JSON)
- Variant shall be created in "Active" status by default
- Each product must have at least one active variant to be purchasable
FR-007: Update Variant
- System shall allow updating of variant attributes: price, SKU, attributes, and status
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



2.3 Category Management
FR-010: Create Category
- System shall allow creation of categories with: name, description, and optional parent category
- Category name must be unique within the same parent level   
- Maximum nesting depth shall be 3 levels
- System shall generate a unique category identifier upon creation
FR-011: Update Category
- System shall allow updating of category name and description
- System shall allow reassignment of parent category
- Reassignment shall not create circular references
- Reassignment shall not exceed maximum nesting depth
FR-012: Delete Category
- System shall support deletion of categories only if:
- Category has no direct products assigned
- Category has no subcategories
- Deletion shall require confirmation when category has descendants
FR-013: Get Category Tree
- System shall return complete category hierarchy as a tree structure
- Each node shall include: category ID, name, description, parent ID, and child count
- System shall include count of products directly assigned to each category



2.4 Product Images
FR-014: Add Product Image
- System shall allow upload of multiple images per product
- Each image shall have: URL/reference, alt text, display order, and primary flag
- Only one image per product can be marked as primary
- System shall validate image format (JPEG, PNG, WebP)
- Maximum file size shall be 5MB per image
- Maximum images per product shall be 10
FR-015: Update Product Image
- System shall allow update of image metadata: alt text, display order, primary flag
- System shall allow reordering of display sequence
FR-016: Delete Product Image
- System shall allow removal of individual product images
- Primary image deletion shall require setting another image as primary first
FR-017: Get Product Images
- System shall return all images for a product sorted by display order
- System shall clearly indicate primary image



2.5 Inventory Management
FR-018: Set Initial Inventory
- System shall allow setting of stock quantity per variant upon creation
- Stock quantity must be a non-negative integer
- System shall record inventory change reason for audit purposes
FR-019: Update Inventory
- System shall support manual adjustment of stock quantities per variant
- System shall support both increment and decrement operations
- System shall log all inventory changes with: timestamp, previous quantity, new quantity, and reason
- System shall support setting low stock threshold per variant
FR-020: Get Inventory Status
- System shall return current stock quantity for a variant
- System shall indicate if stock is below configured threshold
- System shall return stock status: "In Stock", "Low Stock", or "Out of Stock"
FR-021: Reserve Inventory
- System shall support stock reservation during order placement via INVENTORY_RESERVATIONS
- Reserved stock shall not be available for other orders
- Reservation shall expire after configurable timeout (default: 15 minutes)
- System shall release expired reservations automatically
FR-022: Deduct Inventory
- System shall deduct stock upon successful order confirmation
- Deduction shall fail if insufficient stock available
- System shall support partial stock deduction for partial fulfillments



2.6 Shopping Cart
FR-023: Create Cart
- System shall create a new cart for each unique session/customer
- Cart shall be identified by a unique cart identifier
- New cart shall be empty upon creation
FR-024: Add Item to Cart
- System shall add specified quantity of a variant to cart
- If variant already exists in cart, quantities shall be summed
- System shall validate:
- Variant exists and is active
- Requested quantity is positive
- Requested quantity does not exceed available stock
- System shall store variant price at time of adding
FR-025: Update Cart Item Quantity
- System shall allow modification of item quantity in cart
- System shall validate new quantity against available stock
- Quantity of zero shall remove item from cart
FR-026: Remove Item from Cart
- System shall support removal of individual items from cart
- System shall support clearing entire cart
FR-027: Get Cart Details
- System shall return all items in cart with: product details, quantity, unit price, and line total
- System shall calculate and return cart subtotal
- System shall indicate if any items are no longer available or have price changes
- System shall calculate estimated total items count
FR-028: Validate Cart
- System shall validate all cart items against current inventory and pricing
- System shall identify: out-of-stock items, quantity exceedances, and price changes
- System shall return validation results without modifying cart




2.7 Order Management
FR-029: Place Order
- System shall create order from validated cart contents
- Order shall include: order number (unique, human-readable), timestamp, items, quantities, prices, and calculated totals
- Order shall capture: customer name, shipping address, and contact information
- System shall calculate order total including: subtotal, shipping cost (flat rate or free above threshold), and applicable taxes
- System shall attempt to reserve inventory at order creation
- Order shall be created in "Pending" status
- System shall clear cart upon successful order creation
FR-030: Update Order Status
- System shall support order status transitions:
- Pending → Confirmed → Processing → Shipped → Delivered
- Pending → Cancelled
- Confirmed → Cancelled
- Processing → Cancelled
- Cancelled orders shall release reserved/deducted inventory
- System shall record timestamp and reason for each status change
FR-031: Get Order Details
- System shall return complete order information: order number, status, items, quantities, prices, totals, shipping address, and status history
- System shall include current product names and images for display
FR-032: List Orders
- System shall support paginated retrieval of orders
- System shall support filtering by: status, date range
- System shall support sorting by: order date, total amount
- Default sort shall be by order date (newest first)
FR-033: Cancel Order
- System shall allow cancellation only for orders in "Pending" or "Confirmed" status
- Cancellation shall restore inventory
- System shall record cancellation reason
- System shall generate cancellation timestamp
FR-034: Calculate Order Totals
- System shall calculate subtotal as sum of (quantity × unit price) for all items
- System shall apply shipping rules:
- Free shipping for orders above configurable threshold
- Flat rate shipping below threshold
- System shall calculate tax as percentage of subtotal
- System shall compute final total as subtotal + shipping + tax



2.8 Reviews
FR-035: Submit Review
- System shall allow submission of reviews for purchased products
- Review shall include: rating (1-5 stars), title, and body text
- Review shall be associated with a completed order
- System shall allow one review per product per order
- Review shall be created in "Pending" status (requires moderation)
FR-036: Moderate Review
- System shall support approval or rejection of submitted reviews
- Approved reviews shall be visible in product listing
- Rejected reviews shall not be visible
- System shall record moderation decision and timestamp
FR-037: Update Review
- System shall allow author to update own review before moderation
- Updates after moderation shall reset status to "Pending"
FR-038: Delete Review
- System shall allow deletion of reviews by author
- System shall allow administrative deletion regardless of status
FR-039: Get Product Reviews
- System shall return approved reviews for a product
- System shall support pagination
- System shall return review statistics: average rating, total count, distribution by star rating
- System shall return reviews sorted by most recent first
FR-040: Get User Reviews
- System shall return all reviews submitted by a specific customer
- System shall support filtering by status (pending, approved, rejected)



2.9 Product Search
FR-041: Search Products
- System shall support full-text search across product name and description
- Search shall be case-insensitive
- Search shall support partial word matching
- System shall return matching products with relevance scoring
- System shall support pagination of search results
FR-042: Filter Products
- System shall support filtering by:
- Category (single or multiple)
- Price range (minimum and maximum)
- Availability (in stock only)
- Rating range (minimum average rating)
- Filters shall be combinable (AND logic)
- System shall return filter options with counts for faceted navigation
FR-043: Sort Products
- System shall support sorting by:
- Price (ascending/descending)
- Average rating (ascending/descending)
- Newest first (creation date descending)
- Oldest first (creation date ascending)
- Name (A-Z, Z-A)
- Default sort shall be relevance (for search) or newest first (for browsing)



2.10 Currency and Pricing
FR-044: Currency Management
- System shall support a single base currency for the platform
- System shall store all prices in the base currency
- Currency symbol and code shall be configurable
- System shall display prices with consistent decimal formatting
FR-045: Price History
- System shall maintain history of price changes for variants
- Price history shall include: previous price, new price, and effective timestamp
- System shall allow retrieval of price at specific point in time




2.11 Shipping
FR-046: Shipping Configuration
- System shall support configuration of:
- Flat rate shipping cost
- Free shipping threshold
- Tax rate (percentage)
- System shall allow these values to be updated by administrator
FR-047: Shipping Address Validation
- System shall validate shipping address completeness:
- Full name (minimum 2 parts)
- Street address (minimum 5 characters)
- City (minimum 2 characters)
- State/Province (minimum 2 characters)
- Postal code (minimum 4 characters)
- Country code (2 characters)



2.12 Authentication & Authorization
FR-048: Register Account
- System shall allow customers to register with email, password, first name, and last name
- Email must be unique across all registered users
- Password must meet minimum complexity requirements
FR-049: Login
- System shall authenticate users by email and password
- System shall return a session token upon successful authentication
- System shall distinguish between Customer and Administrator roles
FR-050: Manage Profile
- System shall allow authenticated users to update their profile (name, phone)
- System shall allow users to change their password



3. Non-Functional Requirements
3.1 Performance
NFR-001: Response Time
- Product listing shall return within 500ms for up to 10,000 products
- Search queries shall return within 1 second
- Cart operations shall complete within 200ms
- Order placement shall complete within 2 seconds
3.2 Data Integrity
NFR-002: Transactional Integrity
- Order creation shall be atomic (all items succeed or all fail)
- Inventory deductions shall be consistent with order state
- Cart modifications shall not affect other concurrent carts
3.3 Usability
NFR-003: API Design
- API shall follow RESTful conventions
- API shall use consistent response formats
- API shall return meaningful error messages with error codes
- API shall support versioning (v1, v2, etc.)
3.4 Security
NFR-004: Data Protection
- System shall sanitize all user inputs
- System shall prevent SQL injection attacks
- System shall prevent cross-site scripting (XSS) in stored data
- System shall use parameterized queries for all database operations
NFR-005: Rate Limiting
- System shall implement rate limiting for API endpoints
- Default limit: 100 requests per minute per IP
- System shall return appropriate status codes when limits exceeded
3.5 Compatibility
NFR-006: Browser Support
- API shall be compatible with modern web browsers via standard HTTP
- API shall support JSON response format exclusively
3.6 Compliance
NFR-007: Audit Trail
- System shall maintain audit log for: product changes, inventory changes, order status changes, and review moderation
- Audit log shall include: timestamp, user/system identifier, action performed, and affected entity




4. Business Rules
4.1 Product Rules
BR-001: Product Uniqueness
- Product names must be unique within the system (case-insensitive comparison)
- Variant SKUs must be unique across all variants (case-sensitive)
BR-002: Product Status
- Only products with status "Active" shall appear in customer-facing catalog
- Products in "Draft" status shall be visible only to administrators
- Products with zero inventory may remain active (backorder scenario)
BR-003: Category Assignment
- Each product must belong to exactly one category
- Category must be a leaf node (no children) to have products assigned
- Changing product category shall not affect product availability
BR-004: Product Pricing
- Prices must be positive (minimum $0.01)
- Maximum price per item: $99,999.99
- Price changes shall not retroactively affect existing orders
- System shall store price at time of cart addition and order placement
BR-005: Variant Requirements
- Each product must have at least one active variant to be purchasable
- Deactivating the last active variant of a product shall automatically deactivate the product in customer-facing catalog
- Variant attributes structure is determined per product (e.g., size/color for clothing)
4.2 Inventory Rules
BR-006: Stock Validation
- Available stock shall be calculated as: total stock - reserved stock
- Cart operations shall check against available stock
- Order placement shall check against available stock
BR-007: Stock Reservation
- Reservations shall be held for maximum 15 minutes
- Expired reservations shall be released automatically
- Manual order cancellation shall immediately release reservations
BR-008: Negative Stock Prevention
- System shall never allow negative stock quantities
- Failed stock deductions shall return clear error messages
- Concurrent stock requests shall be handled atomically
4.3 Cart Rules
BR-009: Cart Lifecycle
- Carts shall be identified by unique session/customer identifier
- Empty carts shall be preserved until explicit deletion
- Cart data shall not expire automatically
BR-010: Cart Item Limits
- Maximum 50 unique items per cart
- Maximum quantity per item: 99
- Minimum quantity per item: 1
BR-011: Cart Pricing
- Cart shall display current product prices
- Cart shall indicate if prices changed since item was added
- Final order price shall be price at order placement time
4.4 Order Rules
BR-012: Order Creation Prerequisites
- Cart must contain at least one item
- All cart items must be validated (in stock, valid prices)
- Shipping address must be complete and valid
- Customer contact information must be provided
BR-013: Order Status Transitions
- Orders can only progress forward through status workflow
- Exception: Orders in "Pending" or "Confirmed" can be cancelled
- Each status change must be logged with timestamp
BR-014: Order Pricing
- Order prices are locked at time of placement
- Subsequent product price changes shall not affect existing orders
- Order total shall be calculated once at creation
BR-015: Order Cancellation
- Cancellation is only allowed for "Pending" or "Confirmed" orders
- Cancellation must restore any deducted inventory
- Cancellation must be recorded with reason
BR-016: Order Number Format
- Order numbers shall be unique and sequential
- Format: ORD-YYYYMMDD-XXXXX (date + 5-digit sequence)
- Example: ORD-20240115-00001
4.5 Review Rules
BR-017: Review Eligibility
- Reviews can only be submitted for products that were purchased in completed orders
- One review per product per order
- Customer can review product only after order status is "Delivered" or later
BR-018: Review Content
- Rating must be integer between 1 and 5 (inclusive)
- Review title: minimum 5 characters, maximum 100 characters
- Review body: minimum 20 characters, maximum 2000 characters
- Review text shall be sanitized to prevent injection attacks
BR-019: Review Moderation
- New reviews default to "Pending" status
- Only approved reviews appear in public listings
- Moderation decision shall be recorded
BR-020: Review Modifications
- Authors can update reviews before moderation
- Updates after moderation reset status to "Pending"
- Authors can delete their own reviews at any time
4.6 Search and Filtering Rules
BR-021: Search Behavior
- Search shall match against product name and description
- Search shall ignore common stop words (the, a, an, etc.)
- Minimum search term length: 2 characters
- Search results shall be ranked by relevance
BR-022: Filter Application
- Multiple filters are combined with AND logic
- Filter counts shall reflect available options after other filters applied
- Filters shall not return zero results when valid options exist
4.7 Shipping and Tax Rules
BR-023: Shipping Calculation
- Free shipping applies when order subtotal meets or exceeds threshold
- Flat rate shipping applies below threshold
- Shipping cost is calculated once at order creation
BR-024: Tax Calculation
- Tax is applied to product subtotal only
- Tax is not applied to shipping charges
- Tax rate is applied uniformly to all products





5. Edge Cases
5.1 Product Edge Cases
EC-001: Product Deletion During Active Cart
- When a product is deleted/deactivated while in customer carts:
- Cart shall flag the item with a warning
- Cart shall prevent checkout until issue resolved
- Cart shall offer removal option to customer
EC-002: Price Change During Cart Session
- When product price changes while in customer carts:
- Cart shall display both original and current price
- Cart shall indicate price has changed
- Order shall use current price at time of placement
EC-003: Category Reassignment with Products
- When reassigning product to different category:
- Product shall be immediately visible in new category
- Product shall be removed from old category listings
- Existing order history shall reference original category
EC-004: Image Deletion of Last Image
- When deleting the last image of a product:
- System shall prevent deletion if product has no other images
- Alternative: System shall assign default placeholder image
5.2 Inventory Edge Cases
EC-005: Concurrent Stock Depletion
- When multiple customers attempt to purchase last item simultaneously:
- Only one order shall succeed
- Other customers shall receive "out of stock" message
- System shall handle race conditions atomically
EC-006: Stock Restoration on Cancellation
- When order is cancelled after partial shipment:
- Only unshipped items shall have stock restored
- System shall track partial fulfillments
EC-007: Reservation Expiry During Checkout
- When cart reservation expires during checkout process:
- System shall attempt to re-reserve stock
- If stock unavailable, checkout shall fail with clear message
- Customer shall be prompted to update cart
EC-008: Stock Threshold Reached
- When stock drops below configured threshold:
- System shall flag product as "Low Stock"
- System shall notify administrator (future phase)
- Product shall remain available for purchase
5.3 Cart Edge Cases
EC-009: Cart Item Quantity Exceeds Stock
- When customer increases quantity beyond available stock:
- System shall reject quantity increase
- System shall suggest maximum available quantity
- Cart shall display current vs. requested quantity
EC-010: Empty Cart Checkout Attempt
- When customer attempts checkout with empty cart:
- System shall reject checkout
- System shall display message "Your cart is empty"
- System shall redirect to product catalog
EC-011: Multiple Carts Same Session
- System shall prevent creation of multiple carts per session
- System shall reuse existing cart for session
EC-012: Cart with Discontinued Product
- When cart contains product that becomes discontinued:
- Cart shall display warning for affected item
- Checkout shall be blocked until item removed
- System shall suggest similar products (future phase)
5.4 Order Edge Cases
EC-013: Order Placement Stock Unavailable
- When stock becomes unavailable during order placement:
- System shall identify conflicting items
- System shall suggest quantity adjustments
- Order shall not be partially created
EC-014: Order Cancellation After Shipment
- When cancellation requested for shipped order:
- System shall reject cancellation request
- System shall display "Order already shipped" message
- System shall suggest return process (future phase)
EC-015: Duplicate Order Submission
- When customer submits order twice rapidly:
- System shall prevent duplicate orders
- System shall return existing order details
- System shall not deduct stock twice
EC-016: Order with Zero Total
- When order total calculates to zero (free items + free shipping):
- System shall allow order creation
- Order shall be recorded with $0.00 total
- Future: Payment processing shall handle zero-value orders
EC-017: Order Status Regression Attempt
- When attempting to set order status to earlier state:
- System shall reject invalid transition
- System shall return clear error message
- System shall suggest valid next statuses
5.5 Review Edge Cases
EC-018: Review Submission for Non-Delivered Order
- When review submitted for order not yet delivered:
- System shall reject review
- System shall display "Order not yet delivered" message
- System shall suggest review after delivery
EC-019: Review Update After Moderation
- When author attempts to update already moderated review:
- System shall allow update
- Review status shall reset to "Pending"
- Previous moderation decision shall be voided
EC-020: Review on Deleted Product
- When reviewing product that was later deleted:
- Existing reviews shall remain in system
- Reviews shall not be publicly visible
- Review shall be associated with historical order
5.6 Search and Filter Edge Cases
EC-021: Empty Search Results
- When search returns no matches:
- System shall return empty result set
- System shall display "No products found" message
- System shall suggest broadening search criteria
EC-022: Filter with No Matching Products
- When filter combination yields no results:
- System shall return empty result set
- System shall display available filter options
- System shall suggest relaxing filters
EC-023: Special Characters in Search
- When search term contains special characters:
- System shall sanitize input
- System shall escape special characters
- System shall not expose internal errors
5.7 System Edge Cases
EC-024: Concurrent Price Updates
- When administrator updates price while customer viewing product:
- Customer shall see latest price upon next request
- Cart shall display price change warning
- No data corruption shall occur
EC-025: Large Image Upload
- When customer attempts upload exceeding size limit:
- System shall reject upload immediately
- System shall display "File too large" message
- System shall specify maximum allowed size
EC-026: API Rate Limit Exceeded
- When client exceeds rate limit:
- System shall return 429 Too Many Requests status
- System shall include retry-after header
- System shall not process exceeding requests




6. Assumptions
1. Single Currency: The system operates with a single base currency. Multi-currency support is out of scope.
2. Single Vendor: The system supports a single business entity selling products. Marketplace functionality is excluded.
3. Digital Products: All products are physical goods requiring shipping. Digital product delivery is out of scope.
4. Flat Rate Shipping: Shipping costs are calculated using flat rate or free shipping threshold. Real-time carrier integration is excluded.
5. No Backorder: When stock reaches zero, items cannot be purchased. Backorder functionality is excluded.
6. Customer Identification: Customers are identified by registered accounts with email and password. Guest checkout is supported without account.
7. Data Retention: Historical data (orders, reviews, audit logs) is retained permanently. Data purge functionality is out of scope.
7. Dependencies
Dependency	Status	Impact
Database System	Required	Core data persistence

8. Future Considerations
The following features are explicitly excluded from this version but planned for future phases:
- Payment gateway integration
- Email and SMS notifications
- Multi-vendor marketplace
- Real-time shipping carrier integration
- Coupon and discount system
- Loyalty and rewards programs
- Product recommendation engine
- Subscription billing
- Multi-warehouse inventory
- Advanced analytics and reporting
- Internationalization (i18n)
- Mobile-specific APIs
Document Version: 2.0
Last Updated: July 28, 2026
Author: Product Owner

## Change History
| Version | Date | Description |
|---------|------|-------------|
| 1.0 | July 21, 2026 | Initial release |
| 2.0 | July 28, 2026 | Added variant management, authentication & authorization; updated scope