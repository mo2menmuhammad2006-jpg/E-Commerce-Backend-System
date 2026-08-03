# Edge Cases
E-Commerce Backend System
Version 3.0

## 5. Edge Cases

### 5.1 Product Edge Cases

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

### 5.2 Inventory Edge Cases

EC-005: Concurrent Stock Depletion
- When multiple customers attempt to purchase last item simultaneously:
  - Only one order shall succeed
  - Other customers shall receive "out of stock" message
  - System shall handle race conditions atomically

EC-006: Stock Restoration on Cancellation
- Inventory is deducted atomically during order placement
- When an order in "Pending" or "Confirmed" status is cancelled:
  - All item quantities shall have stock restored
  - Orders in "Processing" or later statuses cannot be cancelled

EC-007: Stock Threshold Reached
- When stock drops below configured threshold:
  - System shall flag product as "Low Stock"
  - System shall notify administrator (future phase)
  - Product shall remain available for purchase

### 5.3 Cart Edge Cases

EC-008: Cart Item Quantity Exceeds Stock
- When customer increases quantity beyond available stock:
  - System shall reject quantity increase
  - System shall suggest maximum available quantity
  - Cart shall display current vs. requested quantity

EC-009: Empty Cart Checkout Attempt
- When customer attempts checkout with empty cart:
  - System shall reject checkout
  - System shall display message "Your cart is empty"
  - System shall redirect to product catalog

EC-010: Multiple Carts Same Session
- System shall prevent creation of multiple carts per session
- System shall reuse existing cart for session

EC-011: Cart with Discontinued Product
- When cart contains product that becomes discontinued:
  - Cart shall display warning for affected item
  - Checkout shall be blocked until item removed
  - System shall suggest similar products (future phase)

### 5.4 Order Edge Cases

EC-012: Order Placement Stock Unavailable
- When stock becomes unavailable during order placement:
  - System shall identify conflicting items
  - System shall suggest quantity adjustments
  - Order shall not be partially created

EC-013: Order Cancellation After Shipment
- When cancellation requested for shipped order:
  - System shall reject cancellation request
  - System shall display "Order already shipped" message
  - System shall suggest return process (future phase)

EC-014: Duplicate Order Submission
- When customer submits order twice rapidly:
  - System shall prevent duplicate orders
  - System shall return existing order details
  - System shall not deduct stock twice

EC-015: Order with Zero Total
- When order total calculates to zero (free items + free shipping):
  - System shall allow order creation
  - Order shall be recorded with $0.00 total
  - Future: Payment processing shall handle zero-value orders

EC-016: Order Status Regression Attempt
- When attempting to set order status to earlier state:
  - System shall reject invalid transition
  - System shall return clear error message
  - System shall suggest valid next statuses

### 5.5 Review Edge Cases

EC-017: Review Submission for Non-Delivered Order
- When review submitted for order not yet delivered:
  - System shall reject review
  - System shall display "Order not yet delivered" message
  - System shall suggest review after delivery

EC-018: Review Update After Moderation
- When author attempts to update already moderated review:
  - System shall allow update
  - Review status shall reset to "Pending"
  - Previous moderation decision shall be voided

EC-019: Review on Deleted Product
- When reviewing product that was later deleted:
  - Existing reviews shall remain in system
  - Reviews shall not be publicly visible
  - Review shall be associated with historical order

### 5.6 Search and Filter Edge Cases

EC-020: Empty Search Results
- When search returns no matches:
  - System shall return empty result set
  - System shall display "No products found" message
  - System shall suggest broadening search criteria

EC-021: Filter with No Matching Products
- When filter combination yields no results:
  - System shall return empty result set
  - System shall display available filter options
  - System shall suggest relaxing filters

EC-022: Special Characters in Search
- When search term contains special characters:
  - System shall sanitize input
  - System shall escape special characters
  - System shall not expose internal errors

### 5.7 System Edge Cases

EC-023: Concurrent Price Updates
- When administrator updates price while customer viewing product:
  - Customer shall see latest price upon next request
  - Cart shall display price change warning
  - No data corruption shall occur

EC-024: Large Image Upload
- When customer attempts upload exceeding size limit:
  - System shall reject upload immediately
  - System shall display "File too large" message
  - System shall specify maximum allowed size

EC-025: API Rate Limit Exceeded
- When client exceeds rate limit:
  - System shall return 429 Too Many Requests status
  - System shall include retry-after header
  - System shall process no exceeding requests