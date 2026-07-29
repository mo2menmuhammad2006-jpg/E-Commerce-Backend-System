Use Case Specification
E-Commerce Backend System
Version 2.0

Actors
Actor	Description
Administrator	Manages product catalog, variants, inventory, orders, reviews, and system configuration
Customer	Registers, browses products, manages cart, places orders, and submits reviews
System	Automated processes (inventory reservation expiry, stock calculations, session management)




UC-001: Manage Products and Variants
Requirements: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009
Actor: Administrator
Preconditions:
- Administrator is logged into the system
- At least one category exists for product assignment
Main Flow:
1. Administrator initiates product or variant management action
2. System validates input data against business rules
3. System performs requested operation
4. System returns success confirmation with updated product/variant data
Alternative Flows:
- 3a. Create Product: System generates unique ID, sets status to "Draft," records creation timestamp
- 3b. Update Product: System updates name, description, category, or status; records modification timestamp
- 3c. Delete Product: System performs soft deletion, sets status to inactive; product removed from customer-facing catalog
- 3d. View Product: System returns complete product details including all variants, average rating, and review count
- 3e. List Products: System returns paginated list (default 20, max 100) sorted by creation date descending
- 3f. Create Variant: System creates variant under product with SKU, price, and attributes; SKU must be unique
- 3g. Update Variant: System updates variant price, attributes, or status; SKU remains immutable
- 3h. Deactivate Variant: System deactivates variant; ensures at least one active variant remains for product
Exceptions:
- E1: Duplicate product name → System rejects creation, returns error indicating name already exists
- E2: Duplicate SKU → System rejects variant creation, returns error indicating SKU already exists
- E3: Invalid price (negative or zero) → System rejects operation, returns validation error
- E4: Product not found → System returns 404 error for update/view/delete operations
- E5: Category not found → System rejects creation/update, returns error
- E6: Cannot deactivate last active variant → System rejects, returns error
Postconditions:
- Product or variant is created, updated, or deactivated in system
- Product catalog reflects changes
- Audit log records the operation with timestamp



UC-002: Manage Categories
Requirements: FR-010, FR-011, FR-012, FR-013
Actor: Administrator
Preconditions:
- Administrator is logged into the system
Main Flow:
1. Administrator initiates category management action (create, update, view tree, or delete)
2. System validates input data against business rules
3. System performs requested operation
4. System returns success confirmation with category data
Alternative Flows:
- 3a. Create Category: System generates unique ID, validates parent category if provided, ensures max 3-level nesting
- 3b. Update Category: System updates name/description; if reassigning parent, validates no circular references and nesting depth
- 3c. Get Category Tree: System returns complete hierarchy with product counts at each node
- 3d. Delete Category: System validates category has no products or subcategories before allowing deletion
Exceptions:
- E1: Duplicate category name at same level → System rejects creation/update
- E2: Circular reference in parent reassignment → System rejects update
- E3: Exceeding 3-level nesting → System rejects parent reassignment
- E4: Category has products → System blocks deletion, returns error with product count
- E5: Category has subcategories → System blocks deletion, returns error with subcategory count
- E6: Category not found → System returns 404 error
Postconditions:
- Category hierarchy is updated
- Product assignments remain valid
- Audit log records the operation




UC-003: Manage Product Images
Requirements: FR-014, FR-015, FR-016, FR-017
Actor: Administrator
Preconditions:
- Administrator is logged into the system
- Target product exists
Main Flow:
1. Administrator initiates image management action (add, update metadata, reorder, delete, or view)
2. System validates input and image constraints
3. System performs requested operation
4. System returns updated image list
Alternative Flows:
- 3a. Add Image: System validates format (JPEG/PNG/WebP), size (≤5MB), checks image count (max 10), stores image reference
- 3b. Update Metadata: System updates alt text, display order, or primary flag; ensures only one primary image
- 3c. Delete Image: System removes image; if primary, requires another image to be set primary first
- 3d. Get Images: System returns all images sorted by display order with primary indicator
Exceptions:
- E1: Invalid image format → System rejects upload, returns supported formats
- E2: File exceeds 5MB → System rejects upload, returns size limit error
- E3: Maximum images reached (10) → System rejects new upload
- E4: Attempting to delete last image → System blocks deletion or assigns placeholder
- E5: Setting primary when no images exist → System prevents operation
Postconditions:
- Product images are added, updated, or removed
- Display order and primary flag are maintained
- Audit log records the operation




UC-004: Manage Inventory
Requirements: FR-018, FR-019, FR-020
Actor: Administrator
Preconditions:
- Administrator is logged into the system
- Target variant exists
Main Flow:
1. Administrator initiates inventory management action (set initial, update quantity, or view status) for a variant
2. System validates quantity values and calculates availability
3. System performs requested operation with audit logging
4. System returns inventory status
Alternative Flows:
- 3a. Set Initial Inventory: System records stock quantity for new variant with reason code
- 3b. Update Inventory (Increment): System increases stock, logs previous and new quantities
- 3c. Update Inventory (Decrement): System decreases stock if sufficient quantity available
- 3d. Get Inventory Status: System returns total quantity, reserved quantity, available quantity based on INVENTORY_RESERVATIONS, and status indicator (In Stock/Low Stock/Out of Stock)
Exceptions:
- E1: Negative quantity attempted → System rejects operation
- E2: Decrement exceeds available stock → System rejects operation, returns insufficient stock error
- E3: Variant not found → System returns 404 error
Postconditions:
- Inventory quantities are updated
- Audit trail records all changes with reason, timestamps, and before/after values
- Stock status indicators are recalculated




UC-005: Reserve and Deduct Inventory
Requirements: FR-021, FR-022
Actor: System (automated during cart/order operations)
Preconditions:
- Variant exists with sufficient available stock
Main Flow:
1. System receives reservation or deduction request
2. System calculates available stock (total_quantity - SUM of active INVENTORY_RESERVATIONS)
3. System validates sufficient availability
4. System performs atomic stock operation via INVENTORY_RESERVATIONS
5. System records operation with timestamp
Alternative Flows:
- 4a. Reserve Inventory: System creates INVENTORY_RESERVATIONS record with status ACTIVE and expiry timestamp (15 minutes)
- 4b. Deduct Inventory: System sets INVENTORY_RESERVATIONS status to FULFILLED and reduces INVENTORY.total_quantity permanently upon order confirmation
- 4c. Release Reservation: System sets INVENTORY_RESERVATIONS status to EXPIRED or CANCELLED upon expiry, cancellation, or cart removal
Exceptions:
- E1: Insufficient available stock → System returns error, operation fails
- E2: Reservation expired → System attempts re-reservation; fails if stock unavailable
- E3: Concurrent stock conflict → System handles atomically; only one operation succeeds
Postconditions:
- Reserved stock is locked via ACTIVE reservations and unavailable to other customers
- Deducted stock is permanently reduced
- Audit log records all inventory movements




UC-006: Manage Shopping Cart
Requirements: FR-023, FR-024, FR-025, FR-026, FR-027, FR-028
Actor: Customer
Preconditions:
- Customer has active session
Main Flow:
1. Customer initiates cart operation (create, add variant, update quantity, remove item, view, or validate)
2. System validates operation against business rules
3. System performs requested operation
4. System returns updated cart state
Alternative Flows:
- 3a. Create Cart: System generates unique cart identifier for session
- 3b. Add Variant: System validates variant availability, adds variant or increments quantity if exists; stores price at time of addition
- 3c. Update Quantity: System validates new quantity against stock; removes item if quantity set to zero
- 3d. Remove Item: System removes specified variant from cart
- 3e. Get Cart Details: System returns all items with variant details, subtotal, warnings for unavailable items or price changes
- 3f. Validate Cart: System checks all items against current inventory and pricing without modifying cart
Exceptions:
- E1: Variant inactive/deleted → System flags item with warning, blocks checkout
- E2: Quantity exceeds available stock → System rejects increase, suggests maximum available
- E3: Empty cart checkout attempt → System rejects, displays "cart empty" message
- E4: Maximum items reached (50) → System rejects new item addition
- E5: Maximum quantity per item (99) → System rejects further quantity increase
- E6: Price changed since addition → Cart displays both prices, warns customer
Postconditions:
- Cart reflects all modifications
- Cart items reference current variant status
- Reserved inventory (if applicable) is updated




UC-007: Place Order
Requirements: FR-029, FR-034, FR-046, FR-047
Actor: Customer
Preconditions:
- Customer has cart with at least one variant item
- Customer provides shipping address and contact information
- All cart items are validated (in stock, valid prices)
Main Flow:
1. Customer initiates checkout
2. System validates cart contents (variant availability) against inventory
3. System validates shipping address completeness
4. System calculates order totals (subtotal, shipping, tax)
5. System reserves inventory for all items via INVENTORY_RESERVATIONS
6. System creates order with unique order number (ORD-YYYYMMDD-XXXXX) and variant snapshots
7. System clears customer cart
8. System returns order confirmation with order number and details
Alternative Flows:
- 4a. Free Shipping: If subtotal ≥ threshold, shipping cost = $0
- 4b. Flat Rate Shipping: If subtotal < threshold, apply configured flat rate
- 4c. Zero-Total Order: System allows order creation with $0.00 total
Exceptions:
- E1: Cart is empty → System rejects checkout
- E2: Item out of stock during checkout → System identifies conflicting items, suggests quantity adjustments
- E3: Incomplete shipping address → System returns validation error with specific missing fields
- E4: Reservation fails (concurrent purchase) → System rejects order, identifies unavailable items
- E5: Duplicate submission → System detects rapid duplicate, returns existing order
Postconditions:
- Order is created in "Pending" status
- Inventory is reserved via INVENTORY_RESERVATIONS
- Cart is cleared
- Order number is generated and returned
- Audit log records order creation



UC-008: Manage Orders
Requirements: FR-030, FR-031, FR-032, FR-033
Actor: Administrator (status updates, cancellation), Customer (view, cancel own orders)
Preconditions:
- Order exists in system
- For status updates: Administrator is authenticated
- For customer actions: Customer owns the order
Main Flow:
1. User initiates order operation (view, list, update status, or cancel)
2. System validates operation against business rules and status transitions
3. System performs requested operation
4. System returns operation result
Alternative Flows:
- 3a. Get Order Details: System returns complete order information including items, totals, address, and status history
- 3b. List Orders: System returns paginated list with filtering (status, date range) and sorting options
- 3c. Update Status: System validates transition is allowed, records timestamp and reason
- 3d. Cancel Order: System validates order is in "Pending" or "Confirmed" status, releases inventory, records reason
Exceptions:
- E1: Invalid status transition → System rejects update, suggests valid next statuses
- E2: Cancel after shipment → System rejects, displays "already shipped" message
- E3: Order not found → System returns 404 error
- E4: Unauthorized cancellation attempt → System rejects operation
Postconditions:
- Order status is updated or order is cancelled
- Inventory is released on cancellation
- Status history is recorded with timestamps
- Audit log records all changes




UC-009: Submit and Manage Reviews
Requirements: FR-035, FR-037, FR-038
Actor: Customer
Preconditions:
- Customer has completed order containing the product
- Order status is "Delivered" or later
- Customer has not already reviewed this product for this order
Main Flow:
1. Customer initiates review action (submit, update, or delete)
2. System validates eligibility and content constraints
3. System performs requested operation
4. System returns confirmation
Alternative Flows:
- 3a. Submit Review: System creates review with "Pending" status, associates with order and product
- 3b. Update Review: System updates content; if review was already moderated, resets status to "Pending"
- 3c. Delete Review: System removes review; if public, removes from product listings
Exceptions:
- E1: Order not delivered → System rejects review submission
- E2: Duplicate review (same product, same order) → System rejects, displays existing review
- E3: Invalid rating (not 1-5) → System rejects with validation error
- E4: Content too short/long → System rejects with character count requirements
- E5: Review not found → System returns 404 error
- E6: Unauthorized modification → System rejects if not review author
Postconditions:
- Review is created, updated, or deleted
- Review status is "Pending" for new submissions
- Product rating will be recalculated when review is moderated
- Audit log records the operation






UC-010: Moderate Reviews
Requirements: FR-036
Actor: Administrator
Preconditions:
- Administrator is logged into the system
- Reviews exist with "Pending" status
Main Flow:
1. Administrator views pending reviews
2. Administrator selects review for moderation
3. Administrator approves or rejects review with optional notes
4. System updates review status
5. System recalculates product rating if approved
Alternative Flows:
- 4a. Approve Review: System sets status to "Approved," includes review in public listings, recalculates average rating
- 4b. Reject Review: System sets status to "Rejected," review not visible publicly
Exceptions:
- E1: Review already moderated → System allows re-moderation, previous decision voided
- E2: Review not found → System returns 404 error
Postconditions:
- Review status is updated
- Product rating statistics are recalculated (if approved)
- Moderation decision and timestamp are recorded
- Audit log records the moderation action
UC-011: View Reviews
Requirements: FR-039, FR-040
Actor: Customer (product reviews), Administrator (all reviews)
Preconditions:
- Product exists (for product reviews)
- Customer has submitted reviews (for user reviews)
Main Flow:
1. User requests review data (product reviews or user's own reviews)
2. System retrieves and returns review information
Alternative Flows:
- 2a. Get Product Reviews: System returns approved reviews with pagination, average rating, total count, and star distribution
- 2b. Get User Reviews: System returns all reviews by customer with status filtering option
Exceptions:
- E1: Product not found → System returns 404 error
- E2: No reviews exist → System returns empty list with zero counts
- E3: No approved reviews → System returns empty public listing
Postconditions:
- Review data is returned without modification
- Statistics reflect current approved review state


UC-012: Search and Browse Products
Requirements: FR-041, FR-042, FR-043
Actor: Customer
Preconditions:
- Products exist in catalog
- At least some products have "Active" status
Main Flow:
1. Customer initiates product discovery (search, filter, or browse)
2. System processes query with applied parameters
3. System returns matching products with metadata
Alternative Flows:
- 3a. Search Products: System performs full-text search on name and description, returns relevance-ranked results with pagination
- 3b. Filter Products: System applies combinable filters (category, price range, availability, rating), returns faceted counts
- 3c. Sort Products: System sorts by selected criteria (price, rating, date, name)
- 3d. Combined Operation: System applies search + filters + sort together
Exceptions:
- E1: No results found → System returns empty list, suggests broadening criteria
- E2: Special characters in search → System sanitizes input, prevents injection
- E3: Search term too short (<2 chars) → System rejects, displays minimum length requirement
Postconditions:
- Search/browse results are returned
- No data is modified
- Result counts and facets reflect current catalog state



UC-013: View Price History
Requirements: FR-045
Actor: Administrator
Preconditions:
- Variant exists
- At least one price change has occurred
Main Flow:
1. Administrator requests price history for variant
2. System retrieves historical price records
3. System returns chronological price change list
Alternative Flows:
- 2a. Query Specific Point in Time: System returns price effective at specified timestamp
Exceptions:
- E1: Variant not found → System returns 404 error
- E2: No price history → System returns empty list
Postconditions:
- Price history is returned without modification
- Historical records remain intact




UC-014: Configure System Settings
Requirements: FR-044, FR-046, FR-047
Actor: Administrator
Preconditions:
- Administrator is logged into the system
Main Flow:
1. Administrator accesses configuration settings
2. System displays current configuration
3. Administrator updates settings (currency, shipping rates, tax rate)
4. System validates and saves configuration
5. System returns updated configuration
Alternative Flows:
- 3a. Currency Configuration: System updates base currency symbol and code; all prices display with new formatting
- 3b. Shipping Configuration: System updates flat rate and free shipping threshold; affects future orders
- 3c. Tax Configuration: System updates tax rate percentage; affects future order calculations
Exceptions:
- E1: Invalid tax rate (negative or >100%) → System rejects with validation error
- E2: Invalid shipping threshold → System rejects with validation error
Postconditions:
- System configuration is updated
- New settings apply to subsequent operations
- Existing orders retain their original calculations
- Audit log records configuration changes





UC-015: Register Account
Requirements: FR-048
Actor: Customer
Preconditions:
- Customer has valid email and password
Main Flow:
1. Customer submits registration with email, password, first name, last name
2. System validates email uniqueness and password complexity
3. System creates user account with Customer role
4. System returns account confirmation
Exceptions:
- E1: Duplicate email → System rejects, returns error
- E2: Weak password → System rejects, returns complexity requirements
Postconditions:
- Customer account is created
- Customer can log in to the system



UC-016: Login
Requirements: FR-049
Actor: Customer, Administrator
Preconditions:
- User has registered account
Main Flow:
1. User submits email and password
2. System authenticates credentials
3. System returns session token with user role
Exceptions:
- E1: Invalid credentials → System returns authentication error
- E2: Account inactive → System returns access denied
Postconditions:
- User is authenticated
- Session token is issued



UC-017: Manage Profile
Requirements: FR-050
Actor: Customer
Preconditions:
- Customer is authenticated
Main Flow:
1. Customer requests profile update (name, phone, password)
2. System validates input
3. System updates profile
4. System returns updated profile
Exceptions:
- E1: Invalid input → System returns validation error
Postconditions:
- Customer profile is updated
- Audit log records the change



Use Case Traceability Matrix
Use Case	Requirements Covered
UC-001: Manage Products and Variants	FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009
UC-002: Manage Categories	FR-010, FR-011, FR-012, FR-013
UC-003: Manage Product Images	FR-014, FR-015, FR-016, FR-017
UC-004: Manage Inventory	FR-018, FR-019, FR-020
UC-005: Reserve and Deduct Inventory	FR-021, FR-022
UC-006: Manage Shopping Cart	FR-023, FR-024, FR-025, FR-026, FR-027, FR-028
UC-007: Place Order	FR-029, FR-034, FR-046, FR-047
UC-008: Manage Orders	FR-030, FR-031, FR-032, FR-033
UC-009: Submit and Manage Reviews	FR-035, FR-037, FR-038
UC-010: Moderate Reviews	FR-036
UC-011: View Reviews	FR-039, FR-040
UC-012: Search and Browse Products	FR-041, FR-042, FR-043
UC-013: View Price History	FR-045
UC-014: Configure System Settings	FR-044, FR-046, FR-047
UC-015: Register Account	FR-048
UC-016: Login	FR-049
UC-017: Manage Profile	FR-050