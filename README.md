# SEA Games 34 Malaysia 2027 Portal

Full-stack prototype for a modern SEA Games 34 website inspired by official multi-sport event portals, with original branding and SEA Games 34 Malaysia-specific content.

## What is included

- Modern responsive frontend with light and dark mode
- Concept SEA Games 34 logo and visual identity
- Compact language button with dropdown options
- Sign-in gate for ticket purchase and ticket tracking access
- Currency switcher for MYR, VND, USD, SGD, THB, IDR and PHP
- Global search across sports, venues, events and news
- Home dashboard with event slider, live sports program, replay cards and medal standings
- Event search, filters, oldest/newest sorting and image-backed date cards
- Interactive event detail screen with calendar dates and ticket tiers
- Ticket flow with sign-in prompt, optional queue for high-demand events, seat map, payment options, checkout countdown and success screen
- Interactive host globe plus venue cards for Sarawak, Penang, Johor and Kuala Lumpur
- Sports grid with sport-specific icons and clickable sport detail screens
- Expanded 54-sport catalog based on the SEA Games 2025 reference archive
- Local sport icon assets extracted from the SEA Games reference archive under `public/assets/sports`
- Separate screens for Home, About SEA Games 2027, Tickets, Contact us, Settings and My Tickets
- About dropdown screens for Competition venues, Sports, Athletes, Information, Organizing Committee, Sponsorship and FAQ
- Expanded athlete cards/details with country, sport, birth year, first games, participation, medals, quote, story and social links
- News/story pages, information chatbot, organizing committee, sponsorship, FAQ accordions and contact office/map tabs
- Persistent simulated sign-in and My Tickets storage in the browser
- Backend APIs for overview, sports, venues, schedule, tickets, booking, news, search and exchange rates

## Run

If Node.js is on your PATH:

```bash
npm start
```

On this Codex desktop environment, Node.js is available at a bundled runtime path:

```powershell
& "C:\Users\Phuong Linh\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.js
```

Then open:

```text
http://localhost:4173
```

The server is currently running on port `4173` in this workspace.

## Main screens

- `#/home`
- `#/about/venues`, `#/about/sports`, `#/about/athletes`, `#/about/information`, `#/about/committee`, `#/about/sponsorship`, `#/about/faq`
- `#/tickets`, `#/tickets/event/open`, `#/tickets/queue/open`, `#/tickets/seats/open`, `#/tickets/checkout/open`, `#/tickets/success/open`
- `#/auth/signin`, `#/auth/signup`, `#/account/settings`, `#/account/tickets`
- `#/contact`

## API overview

- `GET /api/overview`
- `GET /api/sports`
- `GET /api/venues`
- `GET /api/schedule`
- `GET /api/tickets`
- `POST /api/bookings`
- `GET /api/news`
- `GET /api/search?q=football`
- `GET /api/rates`

## Architecture

The prototype uses a dependency-free Node backend so it can run immediately. For production, the same domain model can be moved into a more durable stack:

- Frontend: React or Next.js with component library, SSR pages for SEO, client-side search and ticket flows
- Backend: Node/NestJS or Express API, PostgreSQL for events/tickets/bookings, Redis for ticket queues, object storage for media
- Services: ticket inventory service, queue service, payment service, CMS/news service, notification service and translation service
- Integrations: payment gateways, email/SMS, official accreditation, analytics, CDN and fraud prevention
