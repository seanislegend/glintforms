import {db, tenants, user} from '@glint/database';
import {betterAuth} from 'better-auth';
import {drizzleAdapter} from 'better-auth/adapters/drizzle';
import {nextCookies} from 'better-auth/next-js';
import {magicLink} from 'better-auth/plugins';
import {eq} from 'drizzle-orm';

// utility function to create tenant for users without one
export const createTenantForUser = async (userId: string, userName?: string) => {
    try {
        // check if user already has a tenant
        const existingUser = await db.select().from(user).where(eq(user.id, userId)).limit(1);

        if (existingUser[0]?.tenantId) {
            return existingUser[0].tenantId;
        }

        // create new tenant
        const [newTenant] = await db
            .insert(tenants)
            .values({
                name: userName ? `${userName}'s Organisation` : 'My Organisation'
            })
            .returning();

        if (newTenant) {
            // update user with tenant id
            await db.update(user).set({tenantId: newTenant.id}).where(eq(user.id, userId));

            return newTenant.id;
        }
    } catch (error) {
        console.error('Failed to create tenant for user:', error);
        throw error;
    }
};

export const initAuth = () => {
    const config = {
        baseURL: process.env.BETTER_AUTH_URL ?? `https://${process.env.VERCEL_URL}`,
        database: drizzleAdapter(db, {provider: 'pg'}),
        plugins: [
            magicLink({
                // sendMagicLink: async ({email, token, url}, request) => {
                sendMagicLink: async ({email, token, url}) => {
                    try {
                        // send email to user
                        console.log({email, token, url});
                    } catch (error) {
                        console.error(error);
                    }
                }
            }),
            nextCookies()
        ],
        databaseHooks: {
            user: {
                create: {
                    after: async (user: {id: string; name?: string}) => {
                        // create tenant for new users after user creation
                        try {
                            await createTenantForUser(user.id, user.name);
                        } catch (error) {
                            console.error('Failed to create tenant after user creation:', error);
                        }
                    }
                }
            }
        },
        session: {
            cookieCache: {
                enabled: true,
                maxAge: 5 * 60
            }
        }
    };

    return betterAuth(config);
};

export type Auth = ReturnType<typeof initAuth>;
