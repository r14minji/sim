import { db } from '@sim/db'
import { user } from '@sim/db/schema'

async function main() {
  console.log('📋 Checking existing users in database...\n')

  const users = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(user.createdAt)
    .limit(10)

  if (users.length === 0) {
    console.log('❌ No users found in database')
    console.log('\nTo create a user, you can:')
    console.log('1. Sign up through the UI')
    console.log('2. Use the create-user script')
  } else {
    console.log(`✅ Found ${users.length} user(s):\n`)
    users.forEach((u, i) => {
      console.log(`${i + 1}. ID: ${u.id}`)
      console.log(`   Email: ${u.email}`)
      console.log(`   Name: ${u.name}`)
      console.log(`   Created: ${u.createdAt}`)
      console.log('')
    })

    console.log('\n💡 To use a user for development:')
    console.log('Add to .env:')
    console.log(`DISABLE_AUTH=true`)
    console.log(`TEST_USER_ID=${users[0].id}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
