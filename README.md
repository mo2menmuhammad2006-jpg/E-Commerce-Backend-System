# E-Commerce Backend System

Version 3.0

## Purpose

Medium-sized E-Commerce Backend System supporting online retail operations: product catalog management, variant management, inventory tracking, shopping cart functionality, order processing, customer reviews, and authentication.

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

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express |
| ORM | Prisma |
| Database | PostgreSQL |

## Key Files

| File | Contents |
|------|----------|
| [docs/requirements.md](docs/requirements.md) | SRS index: introduction, assumptions, dependencies, and links to all requirements |
| [docs/functional-requirements.md](docs/functional-requirements.md) | Functional requirements (FR-001 — FR-048) |
| [docs/non-functional-requirements.md](docs/non-functional-requirements.md) | Non-functional requirements (NFR-001 — NFR-007) |
| [docs/business-rules.md](docs/business-rules.md) | Business rules (BR-001 — BR-023) |
| [docs/edge-cases.md](docs/edge-cases.md) | Edge cases (EC-001 — EC-025) |
| [docs/use-cases.md](docs/use-cases.md) | Use case specifications (UC-001 — UC-016) |
| [diagrams/erd.mmd](diagrams/erd.mmd) | Entity Relationship Diagram |
| [prisma/schema.prisma](prisma/schema.prisma) | ORM data model |