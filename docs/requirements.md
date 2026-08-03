Software Requirements Specification (SRS)
E-Commerce Backend System
Version 3.0

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


2. Requirements Index

The requirements are split by type into separate documents:

| Document | IDs | Contents |
|----------|-----|----------|
| [functional-requirements.md](functional-requirements.md) | FR-001 — FR-048 | Product, variant, category, image, inventory, cart, order, review, search, currency, shipping, auth |
| [non-functional-requirements.md](non-functional-requirements.md) | NFR-001 — NFR-007 | Performance, integrity, usability, security, compatibility, compliance |
| [business-rules.md](business-rules.md) | BR-001 — BR-023 | Product, inventory, cart, order, review, search, shipping & tax rules |
| [edge-cases.md](edge-cases.md) | EC-001 — EC-025 | Product, inventory, cart, order, review, search, system edge cases |


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

Document Version: 3.0
Last Updated: August 1, 2026
Author: Product Owner

## Change History
| Version | Date | Description |
|---------|------|-------------|
| 1.0 | July 21, 2026 | Initial release |
| 2.0 | July 28, 2026 | Added variant management, authentication & authorization; updated scope |
| 3.0 | August 1, 2026 | Removed inventory reservation system; replaced full-text search with ILIKE search; clarified atomic inventory deduction at order placement and cancellation rules |