const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")
require("dotenv").config()
const prisma= require("../src/config/db.config.js")
/**
 * SEEDING STRATEGY & ROLE CREATION FLOW
 *
 * ✓ Seed only ONE admin account (bootstrap account)
 * ✓ Admin creates: HR accounts, PM accounts if needed, departments, clients, initial setup
 * ✓ HR creates: employee accounts and profiles
 * ✓ PM handles: projects, tasks, team assignments
 *
 * SCHEMA FLOW - For any new account:
 * 1. Create User record (with role: admin|hr|pm|employee)
 * 2. If account is employee-type, create linked Employee record
 *
 * NOTE: Do not seed HR accounts by default unless you want a demo account.
 * Use the seeded admin as the bootstrap account for all further user creation.
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@worknexus.com"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AdminPassword@123"
const IS_DEMO_MODE = process.env.SEED_DEMO === "true"

async function hashPassword(password) {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10)
  return bcrypt.hash(password, saltRounds)
}

async function createAdminAccount() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  })

  if (existingAdmin) {
    console.log(`✓ Admin account already exists: ${ADMIN_EMAIL}`)
    return existingAdmin
  }

  const hashedPassword = await hashPassword(ADMIN_PASSWORD)

  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    },
  })

  console.log(`✓ Created admin bootstrap account: ${ADMIN_EMAIL}`)
  console.log(`  Password: ${ADMIN_PASSWORD}`)
  console.log(`  🔐 Change this password immediately in production!`)

  return admin
}

async function createDemoAccounts() {
  console.log("\n📋 Creating demo accounts...")

  // Demo HR Account
  const hrEmail = "hr@worknexus.com"
  const existingHr = await prisma.user.findUnique({
    where: { email: hrEmail },
  })

  if (!existingHr) {
    const hashedPassword = await hashPassword("hr_worknexus@123")
    await prisma.user.create({
      data: {
        email: hrEmail,
        password: hashedPassword,
        role: "hr",
      },
    })
    console.log(`✓ Created demo HR account: ${hrEmail}`)
  }

  // Demo PM Account
  const pmEmail = "pm@worknexus.com"
  const existingPm = await prisma.user.findUnique({
    where: { email: pmEmail },
  })

  if (!existingPm) {
    const hashedPassword = await hashPassword("pm_worknexus@123")
    await prisma.user.create({
      data: {
        email: pmEmail,
        password: hashedPassword,
        role: "pm",
      },
    })
    console.log(`✓ Created demo PM account: ${pmEmail}`)
  }

  // Demo Employee Account with Employee profile
  const employeeEmail = "john.doe@worknexus.com"
  const existingEmployee = await prisma.user.findUnique({
    where: { email: employeeEmail },
  })

  if (!existingEmployee) {
    const hashedPassword = await hashPassword("employee_worknexus@123")
    const employeeUser = await prisma.user.create({
      data: {
        email: employeeEmail,
        password: hashedPassword,
        role: "employee",
      },
    })

    // Create Employee profile linked to User
    await prisma.employee.create({
      data: {
        userId: employeeUser.id,
        firstName: "John",
        lastName: "Doe",
        paymentModel: "fixed",
        baseSalary: 50000,
      },
    })
    console.log(`✓ Created demo employee account: ${employeeEmail}`)
    console.log(`  - Employee profile created for: John Doe`)
  }
}

async function main() {
  console.log("\n🌱 Starting database seed...\n")

  try {
    // Always create the admin bootstrap account
    await createAdminAccount()

    // Create demo accounts only if SEED_DEMO environment variable is set to "true"
    if (IS_DEMO_MODE) {
      await createDemoAccounts()
    } else {
      console.log(
        "\n💡 To seed demo accounts, set SEED_DEMO=true and run: npm run seed"
      )
    }

    console.log("\n✅ Seeding completed successfully!\n")
    console.log("📝 Next steps:")
    console.log("  1. Log in with admin account")
    console.log("  2. Create HR accounts")
    console.log("  3. HR creates employee accounts")
    console.log("  4. Admin/HR set up departments and clients")
    console.log("  5. PM creates projects and tasks\n")
  } catch (error) {
    console.error("❌ Error during seeding:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})