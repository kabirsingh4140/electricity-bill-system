# Electricity Bill Management System

A minimal college-project website with customer and administrator consoles, five fictional demonstration customers, meter readings, downloadable bills, and recorded payments.

## Technology

React and TanStack Start with TypeScript, Netlify Functions, Netlify Identity, and Netlify Database (PostgreSQL) through Drizzle ORM. The hosted backend runs JavaScript. `public/java/ElectricityBilling.java` is a separate, downloadable Java OOP demonstration using the same billing rules; it is not the hosted backend or a persistence layer.

## Run locally

Use Node.js 22 or newer. Install dependencies with `pnpm install`, link the Netlify project, and run `netlify dev --port 8889`. Database migrations are in `netlify/database/migrations` and are applied by Netlify on deployment.

To run the standalone Java demonstration with JDK 11 or newer:

```sh
java public/java/ElectricityBilling.java
```

It prints sample bills, paid and unpaid states, and an invalid-reading example. The classes demonstrate inheritance, overridden calculation methods, private fields, controlled access, and exceptions.

## Administrator setup

Identity is enabled. In the Netlify dashboard, open Identity and invite the owner's supplied admin email. Accept the invitation using the website and set the requested password. Assign the `admin` role to that account in the dashboard, then sign in with the requested user ID. The password is never stored in source code. The server requires both the designated verified account and its admin role for administrative data and billing changes. Public registration never assigns administrative roles.

The initial invitation and role assignment must be completed by the site owner before admin login works. No invitation was sent automatically.

## Billing rules

Residential electricity costs INR 5/kWh; commercial electricity costs INR 8/kWh. These are flat demonstration rates without taxes or fixed charges. Consumption is current minus previous reading. Each customer gets at most one bill per month; new bills must follow the latest billing month. Payments settle the entire amount and record the server date. There is no payment gateway.

## Customer registration and login

Customers can use New customer to register with their name, connection address, email, password and domestic (residential) or commercial connection type. Identity sends an email confirmation link; confirming the email or signing in afterward creates a private connection linked to the verified Identity user ID. Domestic connections retain the Residential database type and INR 5/kWh rate; commercial connections use INR 8/kWh. Initial readings are zero and subsequent readings and bills are managed by the administrator.

Customer login shows only the signed-in account's connection, bills, statements and payment history. Forgot password sends a recovery link and the site handles password reset callbacks. Unfinished registrations can complete their connection details after login. A unique database constraint prevents multiple connections being created by repeated requests for the same Identity account. Public registration must be enabled in the project's Identity registration settings; email confirmation remains required.

Anonymous visitors can select only fictional demo accounts. Self-registered connections are never included in this public list. Existing customers added by administrators remain private to the administrator and are not claimed by matching names, emails or customer IDs. Customer signup does not link pre-existing connections.
