import { env } from '../src/configs/env.js'
import { Pool } from 'pg'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'

const pool = new Pool({ connectionString: env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  const password = await bcrypt.hash("Admin123!", 12)

  await prisma.user.create({
    data: {
      email: "customer@test.com",
      password_hash: password,
      first_name: "Cu",
      last_name: "Stomer",
      role: "CUSTOMER",
    },
  })

  const category = await prisma.category.create({
    data: { name: "Electronics", description: "Gadgets and devices" },
  })

  await prisma.storeSettings.create({
    data: {
      base_currency: "USD",
      currency_symbol: "$",
      flat_rate_shipping: 5.99,
      free_shipping_threshold: 100,
      tax_rate_percent: 10,
    },
  })

  const product = await prisma.product.create({
    data: {
      name: "Test Phone",
      description: "A phone for testing",
      category_id: category.id,
      status: "ACTIVE",
    },
  })

  const draft = await prisma.product.create({
    data: {
      name: "Draft Product",
      description: "Not visible in list",
      category_id: category.id,
      status: "DRAFT",
    },
  })

  await prisma.productVariant.create({
    data: {
      product_id: product.id,
      sku: "PHONE-BLK-128",
      price: 499.99,
      attributes: { color: "black", storage: "128gb" },
      inventory: {
        create: {
          total_quantity: 25,
          low_stock_threshold: 5,
          inventory_logs: {
            create: {
              operation_type: "SET",
              previous_quantity: 0,
              new_quantity: 25,
              reason: "seed",
            },
          },
        },
      },
    },
  })

  await prisma.productVariant.create({
    data: {
      product_id: product.id,
      sku: "PHONE-WHT-256",
      price: 599.99,
      attributes: { color: "white", storage: "256gb" },
      inventory: {
        create: {
          total_quantity: 10,
          low_stock_threshold: 3,
          inventory_logs: {
            create: {
              operation_type: "SET",
              previous_quantity: 0,
              new_quantity: 10,
              reason: "seed",
            },
          },
        },
      },
    },
  })

  await prisma.productVariant.create({
    data: {
      product_id: draft.id,
      sku: "DRAFT-ONE",
      price: 19.99,
      attributes: { size: "m" },
      inventory: {
        create: {
          total_quantity: 5,
          low_stock_threshold: 1,
          inventory_logs: {
            create: {
              operation_type: "SET",
              previous_quantity: 0,
              new_quantity: 5,
              reason: "seed",
            },
          },
        },
      },
    },
  })

  await prisma.productImage.createMany({
    data: [
      { product_id: product.id, url: "https://x.com/1.jpg", alt_text: "front", display_order: 1, is_primary: true },
      { product_id: product.id, url: "https://x.com/2.jpg", alt_text: "back", display_order: 2, is_primary: false },
    ],
  })

  console.log("seed done. customer: customer@test.com / password: Admin123!")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect(); await pool.end() })