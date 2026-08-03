# Business Rules
E-Commerce Backend System
Version 3.0

## 4. Business Rules

### 4.1 Product Rules

BR-001: Product Uniqueness
- Product names must be unique within the system (case-insensitive comparison)
- Variant SKUs must be unique across all variants (case-sensitive)

BR-002: Product Status
- Only products with status "Active" shall appear in customer-facing catalog
- Products in "Draft" status shall be visible only to administrators
- Products with zero inventory may remain active (visible but not purchasable)

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

### 4.2 Inventory Rules

BR-006: Stock Validation
- Cart operations shall check against available stock
- Order placement shall check against available stock

BR-007: Negative Stock Prevention
- System shall never allow negative stock quantities
- Failed stock deductions shall return clear error messages
- Concurrent stock requests shall be handled atomically

### 4.3 Cart Rules

BR-008: Cart Lifecycle
- Carts shall be identified by unique session/customer identifier
- Empty carts shall be preserved until explicit deletion
- Cart data shall not expire automatically

BR-009: Cart Item Limits
- Maximum 50 unique items per cart
- Maximum quantity per item: 99
- Minimum quantity per item: 1

BR-010: Cart Pricing
- Cart shall display current product prices
- Cart shall indicate if prices changed since item was added
- Final order price shall be price at order placement time

### 4.4 Order Rules

BR-011: Order Creation Prerequisites
- Cart must contain at least one item
- All cart items must be validated (in stock, valid prices)
- Shipping address must be complete and valid
- Customer contact information must be provided

BR-012: Order Status Transitions
- Orders can only progress forward through status workflow
- Exception: Orders in "Pending" or "Confirmed" can be cancelled
- Each status change must be logged with timestamp

BR-013: Order Pricing
- Order prices are locked at time of placement
- Subsequent product price changes shall not affect existing orders
- Order total shall be calculated once at creation

BR-014: Order Cancellation
- Inventory is deducted atomically during order placement
- Cancellation is only allowed for "Pending" or "Confirmed" orders
- Orders in "Processing" or later statuses cannot be cancelled
- Cancellation must restore any deducted inventory
- Cancellation must be recorded with reason

BR-015: Order Number Format
- Order numbers shall be unique and sequential
- Format: ORD-YYYYMMDD-XXXXX (date + 5-digit sequence)
- Example: ORD-20240115-00001

### 4.5 Review Rules

BR-016: Review Eligibility
- Reviews can only be submitted for products that were purchased in completed orders
- One review per product per order
- Customer can review product only after order status is "Delivered" or later

BR-017: Review Content
- Rating must be integer between 1 and 5 (inclusive)
- Review title: minimum 5 characters, maximum 100 characters
- Review body: minimum 20 characters, maximum 2000 characters
- Review text shall be sanitized to prevent injection attacks

BR-018: Review Moderation
- New reviews default to "Pending" status
- Only approved reviews appear in public listings
- Moderation decision shall be recorded

BR-019: Review Modifications
- Authors can update reviews before moderation
- Updates after moderation reset status to "Pending"
- Authors can delete their own reviews at any time

### 4.6 Search and Filtering Rules

BR-020: Search Behavior
- Search shall match against product name and description using ILIKE
- Minimum search term length: 2 characters

BR-021: Filter Application
- Multiple filters are combined with AND logic

### 4.7 Shipping and Tax Rules

BR-022: Shipping Calculation
- Free shipping applies when order subtotal meets or exceeds threshold
- Flat rate shipping applies below threshold
- Shipping cost is calculated once at order creation

BR-023: Tax Calculation
- Tax is applied to product subtotal only
- Tax is not applied to shipping charges
- Tax rate is applied uniformly to all products