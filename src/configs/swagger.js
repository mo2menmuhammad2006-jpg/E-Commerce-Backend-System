import swaggerJsdoc from "swagger-jsdoc";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { env } from './env.js'

const docsDir = path.posix.join(
  path.dirname(fileURLToPath(import.meta.url)).replace(/\\/g, "/"),
  "..",
  "modules"
);

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
      },
    ],
    tags: [
      { name: "Auth" },
      { name: "Products" },
      { name: "Variants" },
      { name: "Images" },
      { name: "Audit Logs" },
      { name: "Settings" },
      { name: "Categories" },
    ],
    components: {
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "NOT_FOUND" },
                message: { type: "string", example: "product not found" },
              },
            },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer", example: 1 },
            pageSize: { type: "integer", example: 20 },
            total: { type: "integer", example: 42 },
            totalPages: { type: "integer", example: 3 },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Electronics" },
          },
        },
        CategoryNode: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Phones" },
            description: { type: "string", example: "Mobile phones" },
            parent_id: { type: "string", format: "uuid", nullable: true },
            _count: {
              type: "object",
              properties: {
                children: { type: "integer", example: 2 },
                products: { type: "integer", example: 5 },
              },
            },
            children: {
              type: "array",
              items: { $ref: "#/components/schemas/CategoryNode" },
            },
          },
        },
        CategoryTree: {
          type: "array",
          items: { $ref: "#/components/schemas/CategoryNode" },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Wireless Mouse" },
            description: { type: "string" },
            status: { type: "string", enum: ["DRAFT", "ACTIVE", "INACTIVE"] },
            category_id: { type: "string", format: "uuid" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        ProductImage: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            product_id: { type: "string", format: "uuid" },
            url: { type: "string", example: "https://cdn.example.com/p/1.jpg" },
            alt_text: { type: "string", example: "front view" },
            display_order: { type: "integer", minimum: 1, maximum: 10, example: 1 },
            is_primary: { type: "boolean", example: true },
          },
        },
        Inventory: {
          type: "object",
          properties: {
            total_quantity: { type: "integer", example: 25 },
            low_stock_threshold: { type: "integer", example: 5 },
          },
        },
        ProductVariant: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            product_id: { type: "string", format: "uuid" },
            sku: { type: "string", example: "SKU-001" },
            price: { type: "string", description: "decimal, 2 places", example: "19.99" },
            attributes: {
              type: "object",
              additionalProperties: true,
              example: { color: "black", size: "M" },
            },
            is_active: { type: "boolean", example: true },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        ProductVariantDetail: {
          allOf: [
            { $ref: "#/components/schemas/ProductVariant" },
            {
              type: "object",
              properties: {
                product: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    name: { type: "string" },
                    description: { type: "string" },
                    status: { type: "string", enum: ["DRAFT", "ACTIVE", "INACTIVE"] },
                  },
                },
                inventory: { $ref: "#/components/schemas/Inventory" },
              },
            },
          ],
        },
        ProductListItem: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Wireless Mouse" },
            created_at: { type: "string", format: "date-time" },
            images: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  url: { type: "string" },
                  alt_text: { type: "string" },
                },
              },
            },
            variants: {
              type: "array",
              items: {
                type: "object",
                properties: { price: { type: "string", example: "19.99" } },
              },
            },
          },
        },
        Review: {
          type: "object",
          properties: {
            rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            title: { type: "string" },
            body: { type: "string" },
            created_at: { type: "string", format: "date-time" },
          },
        },
        ProductDetails: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Wireless Mouse" },
            description: { type: "string" },
            status: { type: "string", enum: ["DRAFT", "ACTIVE", "INACTIVE"] },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
            category: { $ref: "#/components/schemas/Category" },
            images: {
              type: "array",
              items: {
                allOf: [
                  { $ref: "#/components/schemas/ProductImage" },
                  {
                    type: "object",
                    properties: {
                      display_order: { type: "integer" },
                      is_primary: { type: "boolean" },
                    },
                  },
                ],
              },
            },
            variants: {
              type: "array",
              items: {
                allOf: [
                  { $ref: "#/components/schemas/ProductVariant" },
                  {
                    type: "object",
                    properties: { inventory: { $ref: "#/components/schemas/Inventory" } },
                  },
                ],
              },
            },
            reviews: { type: "array", items: { $ref: "#/components/schemas/Review" } },
            average_rating: { type: "number", example: 4.5 },
            reviews_count: { type: "integer", example: 12 },
          },
        },
        PriceLog: {
          type: "object",
          properties: {
            old_price: { type: "string", example: "19.99" },
            new_price: { type: "string", example: "24.99" },
          },
        },
        AuthUser: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["CUSTOMER", "ADMIN"] },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["CUSTOMER", "ADMIN"] },
            first_name: { type: "string" },
            last_name: { type: "string" },
            phone: { type: "string", nullable: true },
          },
        },
        StoreSettings: {
          type: "object",
          properties: {
            base_currency: { type: "string", example: "USD" },
            currency_symbol: { type: "string", example: "$" },
            flat_rate_shipping: { type: "string", example: "5.00" },
            free_shipping_threshold: { type: "string", example: "50.00" },
            tax_rate_percent: { type: "string", example: "10.00" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        AuditLog: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            entity_type: { type: "string", enum: ["product", "category", "variant", "review", "store_settings"] },
            entity_id: { type: "string", format: "uuid" },
            action: { type: "string", example: "update" },
            performed_by_type: { type: "string", enum: ["USER", "SYSTEM"] },
            performed_by: { type: "string", format: "uuid", nullable: true },
            changes: { type: "object", additionalProperties: true },
            created_at: { type: "string", format: "date-time" },
            performed_by_user: {
              type: "object",
              nullable: true,
              properties: {
                id: { type: "string", format: "uuid" },
                email: { type: "string", format: "email" },
                role: { type: "string", enum: ["CUSTOMER", "ADMIN"] },
              },
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: "validation error",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        Unauthorized: {
          description: "missing or invalid session",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        Forbidden: {
          description: "authenticated but not allowed",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        NotFound: {
          description: "resource not found",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        Conflict: {
          description: "conflict with current state",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
  },
  apis: [path.posix.join(docsDir, "**", "*.route.js")],
};

export const swaggerSpec = swaggerJsdoc(options);
