# Pre-Meal Mobile

Customer-only Expo app. Talks to the same `premeal-app` backend — no
business logic is duplicated here; this is a client, not a second
implementation.

## Stack

- **Expo Router** (file-based routing, chosen over React Navigation for
  faster setup)
- **axios** — one shared client (`src/api/client.ts`) with the auth
  header and 401 handling in one place
- **React Query** — the data-fetching engine; **custom hooks** are the
  thin API screens actually call (`src/hooks/*`), wrapping `useQuery`/
  `useMutation`. Not an either/or — React Query solves caching/polling/
  dedup, the hooks are just the ergonomic names screens use.
- **Stripe React Native SDK** — native `PaymentSheet`, not a WebView

## Setup

```bash
npm install
cp .env.example .env
# edit .env: point EXPO_PUBLIC_API_URL at your deployed premeal-app
# (or your computer's LAN IP for local dev — see the comment in .env.example
# for why "localhost" doesn't work from a physical device/simulator)
npx expo start
```

Scan the QR code with Expo Go, or press `i`/`a` for a simulator.

## What's real vs. stubbed right now

**Real, working, wired to the actual backend:**
- Login / Signup (bearer-token auth — see premeal-app's `src/lib/auth.ts`
  for the backend half of this)
- Home — matches the web app's flow: a landing state with an address
  search box (debounced, hits the same `/api/geocode/suggest` endpoint
  the web app's autocomplete uses) until a location is chosen, then a
  real restaurant list filtered to that location, with distance shown
- Restaurant detail — real menu items and delivery slots (read-only)
- Order history and order detail (order detail polls every 15s while the
  order isn't in a final state, since there's no push notification system
  yet)
- Addresses — add, delete, set default
- Account — shows the logged-in user, logout

**Deliberately a stub:** the Checkout screen. It proves the Stripe
`SetupIntent` + `PaymentSheet` wiring actually works against the real
backend, but doesn't place a real order yet — that needs cart state
(selected items, quantities, modifiers, chosen slot, chosen address)
carried from the restaurant screen, which is real UI/state design (see
`order-form.tsx` in the web app for the scope of what's involved: the
item customization modal, promo codes, address picking) that deserves
building once there's an actual UI package to build it with, not bolted
onto placeholder `View`/`Text` elements.

## No UI yet, on purpose

Every screen right now is plain React Native components with inline
styles — no design system, no component library. That's intentional:
the brief was to get the data layer (API client, auth, hooks) solid
first, with a real UI package to be dropped in on top of this foundation
next.

## Known gaps, not yet addressed

- No "use my current location" (GPS) option — search is text/address only
  for now, same as typing an address on web. A location-permission-based
  "near me" button is a real, separate feature to add later, not folded
  in silently here.
- No push notifications — order status relies on polling while a screen
  is open, not real-time
- No restaurant-owner or admin screens (out of scope for this app by
  design — see the earlier scope decision to keep this customer-only)
