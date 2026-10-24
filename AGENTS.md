# Project architecture

This is a college electricity billing project. The deployed app uses TanStack Start, React, TypeScript, Netlify Functions, Identity, and Database with Drizzle beta. A standalone Java OOP demonstration is downloadable from `public/java/ElectricityBilling.java`.

## Key directories

- `src/routes/index.tsx`: customer/admin consoles, page switching, forms, Identity callback handling, statement download.
- `src/routes/__root.tsx`: document shell and share metadata.
- `src/styles.css`: Tailwind base plus responsive green-and-white project styling.
- `netlify/functions/billing.mts`: API, authorization, validation, transactions and reads.
- `db/schema.ts`: customers and bills; `db/index.ts`: database factory.
- `netlify/database/migrations`: schema and fictional sample seed records.
- `public/java`: separate educational Java source, not the hosted API.

## Conventions and decisions

Keep credentials out of files and logs. Identity passwords are set through the invitation flow. Administrative requests require both the owner email allowlist and a server-controlled admin role. Do not grant roles through signup hooks. The first owner invitation and role are configured manually through Netlify Identity.

The public customer console only serves rows flagged as demo. Newly created customer records are not publicly selectable. Keep this restriction on the server. Do not treat a browser flag as authorization.

Rates are INR 5/kWh residential and INR 8/kWh commercial; bills are integer rupees. Bill generation locks the customer in a transaction, validates monotonic readings and periods, inserts the bill and updates the meter. A unique constraint enforces one bill per customer/month. Payments are full settlements and cannot be recorded twice. No online payment processing is implemented.

Use Netlify Database for all persistent website records. Schema changes require migrations; never edit applied migrations. Java classes demonstrate calculations and object interactions only.

Maintain labelled form controls, error and loading states, responsive tables, keyboard focus, and restrained visual styling. The platform validates builds; do not run local build, test, typecheck or dev commands in an automated agent run.
