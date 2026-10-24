import { getUser } from '@netlify/identity'
import { and, eq, desc, isNull } from 'drizzle-orm'
import { database } from '../../db/index'
import { customers, bills } from '../../db/schema'

export default async (req: Request) => {
 const reply = (data: unknown, status = 200) => Response.json(data, {status, headers:{'Cache-Control':'no-store'}})
 try {
  const url = new URL(req.url)
  const user = await getUser()
  const admin = user?.email?.toLowerCase() === 'kabirjpg79@gmail.com' && user?.roles?.includes('admin') === true
  const db = database()
  if(req.method === 'GET') {
   if(url.searchParams.get('session')) return reply({admin:!!admin,authenticated:!!user})
   if(url.searchParams.has('mine')) {
    if(!user?.confirmedAt) return reply({error:'Sign in with a confirmed customer account.'},401)
    const [customer] = await db.select().from(customers).where(eq(customers.identityId,user.id))
    return reply({customers:customer?[customer]:[],bills:customer?await db.select().from(bills).where(eq(bills.customerId,customer.id)).orderBy(desc(bills.period)):[]})
   }
   if(admin && url.searchParams.get('admin') === 'true') return reply({customers:await db.select().from(customers), bills:await db.select().from(bills).orderBy(desc(bills.period))})
   const id = url.searchParams.get('customer')
   if(!id) return reply({customers:await db.select({id:customers.id,name:customers.name,type:customers.type}).from(customers).where(eq(customers.demo,1))})
   const [customer] = await db.select().from(customers).where(and(eq(customers.id,id),eq(customers.demo,1)))
   if(!customer) return reply({error:'Demonstration account not found.'},404)
   return reply({customers:[customer],bills:await db.select().from(bills).where(eq(bills.customerId,id)).orderBy(desc(bills.period))})
  }
  if(req.method !== 'POST') return reply({error:'Method not allowed'},405)
  if(req.headers.get('origin') !== url.origin) return reply({error:'Invalid request origin'},403)
  const body = await req.json()
  if(body.action === 'register') {
   if(!user?.confirmedAt) return reply({error:'Confirm your email and sign in before registering your connection.'},401)
   if(admin) return reply({error:'Use Add customer in the administrator console.'},403)
   const profile = body.name === undefined ? user.userMetadata || {} : body
   const name = profile.name ?? profile.full_name, address = profile.address, type = profile.type
   if(typeof name !== 'string' || !name.trim() || name.length > 100 || typeof address !== 'string' || !address.trim() || address.length > 300 || !['Residential','Commercial'].includes(String(type))) return reply({error:'Enter your name, address and connection type to finish registration.'},400)
   await db.insert(customers).values({id:'C-'+crypto.randomUUID().toUpperCase(),name:name.trim(),address:address.trim(),type:String(type),identityId:user.id,reading:0,demo:0}).onConflictDoNothing({target:customers.identityId})
   return reply({success:true})
  }
  if(!admin) return reply({error:'Administrator access required. Sign in with the invited admin account.'},403)
  if(body.action === 'customer') {
   if(typeof body.name !== 'string' || !body.name.trim() || body.name.length > 100 || typeof body.address !== 'string' || !body.address.trim() || body.address.length > 300 || !['Residential','Commercial'].includes(body.type) || !Number.isSafeInteger(body.reading) || body.reading < 0 || body.reading > 200000000) return reply({error:'Enter valid customer details and a non-negative whole meter reading.'},400)
   await db.insert(customers).values({id:'C-'+crypto.randomUUID().slice(0,8).toUpperCase(),name:body.name.trim(),address:body.address.trim(),type:body.type,reading:body.reading})
  } else if(body.action === 'bill') {
   if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(body.period) || !Number.isSafeInteger(body.current) || body.current < 0 || body.current > 200000000) return reply({error:'Enter a valid month and whole meter reading.'},400)
   await db.transaction(async tx => {
    const [c] = await tx.select().from(customers).where(eq(customers.id,body.customerId)).for('update')
    if(!c || body.current < c.reading) throw new Error('The current reading must be at least the previous reading.')
    const existing = await tx.select().from(bills).where(eq(bills.customerId,c.id)).orderBy(desc(bills.period)).limit(1)
    if(existing[0] && body.period <= existing[0].period) throw new Error('Choose a billing month after the latest bill.')
    const rate = c.type === 'Residential' ? 5 : 8
    await tx.insert(bills).values({id:'EB-'+crypto.randomUUID().slice(0,8).toUpperCase(),customerId:c.id,period:body.period,previous:c.reading,current:body.current,rate,amount:(body.current-c.reading)*rate})
    await tx.update(customers).set({reading:body.current}).where(eq(customers.id,c.id))
   })
  } else if(body.action === 'payment') {
   const updated = await db.update(bills).set({paidAt:new Date().toISOString()}).where(and(eq(bills.id,body.billId),eq(bills.customerId,body.customerId),isNull(bills.paidAt))).returning()
   if(!updated.length) return reply({error:'Bill not found or already paid.'},404)
  } else return reply({error:'Unknown action'},400)
  return reply({success:true})
 } catch(error) {
  const message = error instanceof Error ? error.message : ''
  const safe = ['The current reading must be at least the previous reading.','Choose a billing month after the latest bill.'].includes(message)
  return reply({error:safe ? message : 'Unable to process the request. Please try again.'},safe ? 400 : 500)
 }
}
export const config = {path:'/api/billing'}
