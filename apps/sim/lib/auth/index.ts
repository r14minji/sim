import { db } from '@sim/db'
import { user } from '@sim/db/schema'
import { eq } from 'drizzle-orm'

export { auth, signIn, signUp } from './auth'

/**
 * getSession with development mode bypass
 * Set DISABLE_AUTH=true in .env to bypass authentication
 */
export async function getSession() {
  // Check if auth is disabled (development mode)
  const disableAuth = process.env.DISABLE_AUTH === 'true'
  const isProduction = process.env.NODE_ENV === 'production'

  // Safety: Never disable auth in production
  if (isProduction && disableAuth) {
    throw new Error('🚨 CRITICAL: Cannot disable auth in production!')
  }

  if (disableAuth) {
    console.log('🚨 AUTH DISABLED - Using hardcoded session')

    const testUserId = process.env.TEST_USER_ID

    // If a real user ID is provided, use that user
    if (testUserId) {
      try {
        const testUser = await db.query.user.findFirst({
          where: eq(user.id, testUserId),
        })

        if (testUser) {
          console.log(`✅ Using test user: ${testUser.email} (${testUser.id})`)
          return {
            user: testUser,
            session: {
              id: 'dev-session',
              userId: testUser.id,
              token: 'dev-token',
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
              createdAt: new Date(),
              updatedAt: new Date(),
              ipAddress: '127.0.0.1',
              userAgent: 'dev-mode',
              activeOrganizationId: process.env.TEST_ORG_ID || null,
            },
          }
        }
      } catch (error) {
        console.warn('Failed to load test user, using hardcoded user instead:', error)
      }
    }

    // Fallback: Return a hardcoded fake user
    console.log('⚠️  Using hardcoded fake user (dev-user-123)')
    return {
      user: {
        id: 'dev-user-123',
        email: 'dev@example.com',
        name: 'Dev User',
        image: null,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        stripeCustomerId: null,
        isSuperUser: false,
      },
      session: {
        id: 'dev-session-123',
        userId: 'dev-user-123',
        token: 'dev-token-123',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'dev-mode',
        activeOrganizationId: process.env.TEST_ORG_ID || null,
      },
    }
  }

  // Production mode: Use real authentication
  const { getSession: realGetSession } = await import('./auth')
  return realGetSession()
}
