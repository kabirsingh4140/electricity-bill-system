import { pgTable, text, integer, timestamp, unique } from 'drizzle-orm/pg-core'
export const customers = pgTable('customers', {
 id: text().primaryKey(), name: text().notNull(), address: text().notNull(), type: text().notNull(), reading: integer().notNull().default(0), demo: integer().notNull().default(0), identityId: text('identity_id').unique(),
})
export const bills = pgTable('bills', {
 id: text().primaryKey(), customerId: text('customer_id').notNull().references(() => customers.id), period: text().notNull(), previous: integer().notNull(), current: integer().notNull(), rate: integer().notNull(), amount: integer().notNull(), paidAt: timestamp('paid_at', {mode:'string'}),
}, (t) => [unique().on(t.customerId, t.period)])
