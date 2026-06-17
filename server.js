const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = process.env.PORT || 4173;
const ROOT = __dirname;
const PUBLIC_DIR = fs.existsSync(path.join(ROOT, "public", "index.html")) ? path.join(ROOT, "public") : ROOT;

const sportSeed = [
  ["air-sports", "Air Sports", "Sarawak", "aerial"], ["aquatic-sports", "Aquatic Sports", "Sarawak", "water"], ["archery", "Archery", "Sarawak", "precision"],
  ["athletics", "Athletics", "Kuala Lumpur", "endurance"], ["baseball", "Baseball", "Johor", "team"], ["basketball", "Basketball", "Sarawak", "team"],
  ["badminton", "Badminton", "Kuala Lumpur", "racket"], ["billiards", "Billiards", "Penang", "precision"], ["bowling", "Bowling", "Sarawak", "precision"],
  ["boxing", "Boxing", "Penang", "combat"], ["chess", "Chess", "Penang", "mind"], ["cricket", "Cricket", "Sarawak", "team"],
  ["cycling", "Cycling", "Kuala Lumpur", "endurance"], ["equestrian", "Equestrian", "Kuala Lumpur", "precision"], ["esports", "Esports", "Sarawak", "mind"],
  ["extreme-sports", "Extreme Sports", "Kuala Lumpur", "action"], ["fencing", "Fencing", "Kuala Lumpur", "combat"], ["floorball", "Floorball", "Penang", "team"],
  ["flying-discs", "Flying Discs", "Johor", "team"], ["football", "Football", "Johor", "team"], ["golf", "Golf", "Sarawak", "precision"],
  ["gymnastics", "Gymnastics", "Sarawak", "artistic"], ["handball", "Handball", "Johor", "team"], ["hockey", "Hockey", "Kuala Lumpur", "team"],
  ["ice-hockey", "Ice Hockey", "Kuala Lumpur", "ice"], ["ice-skating", "Ice Skating", "Kuala Lumpur", "ice"], ["jiu-jitsu", "Jiu-Jitsu", "Penang", "combat"],
  ["judo", "Judo", "Penang", "combat"], ["kabaddi", "Kabaddi", "Johor", "team"], ["karate", "Karate", "Kuala Lumpur", "combat"],
  ["kickboxing", "Kickboxing", "Penang", "combat"], ["mixed-martial-arts", "Mixed Martial Arts", "Penang", "combat"], ["modern-pentathlon", "Modern Pentathlon", "Kuala Lumpur", "multi"],
  ["muay", "Muay", "Sarawak", "combat"], ["netball", "Netball", "Johor", "team"], ["pencak-silat", "Pencak Silat", "Kuala Lumpur", "combat"],
  ["petanque", "Petanque", "Sarawak", "precision"], ["rowing", "Rowing", "Sarawak", "water"], ["rugby", "Rugby", "Kuala Lumpur", "team"],
  ["sailing", "Sailing", "Kuala Lumpur", "water"], ["sepak-takraw", "Sepak Takraw", "Penang", "team"], ["shooting", "Shooting", "Sarawak", "precision"],
  ["squash", "Squash", "Sarawak", "racket"], ["table-tennis", "Table Tennis", "Penang", "racket"], ["taekwondo", "Taekwondo", "Sarawak", "combat"],
  ["tennis", "Tennis", "Sarawak", "racket"], ["teqball", "Teqball", "Johor", "team"], ["triathlon", "Triathlon", "Kuala Lumpur", "endurance"],
  ["tug-of-war", "Tug of War", "Johor", "strength"], ["volleyball", "Volleyball", "Kuala Lumpur", "team"], ["weightlifting", "Weightlifting", "Sarawak", "strength"],
  ["woodball", "Woodball", "Sarawak", "precision"], ["wrestling", "Wrestling", "Penang", "combat"], ["wushu", "Wushu", "Sarawak", "combat"]
];

const sports = sportSeed.map(([id, name, cluster, category]) => ({ id, name, cluster, icon: id, category }));

const venues = [
  {
    id: "sarawak-stadium",
    name: "Sarawak Sports Complex",
    cluster: "Sarawak",
    city: "Kuching",
    capacity: 40000,
    role: "Opening Ceremony hub",
    sports: ["Aquatic Sports", "Gymnastics", "Esports", "Wushu"],
    lat: 1.5533,
    lng: 110.3592
  },
  {
    id: "penang-arena",
    name: "Penang Indoor Arena",
    cluster: "Penang",
    city: "George Town",
    capacity: 12000,
    role: "Combat and indoor precision events",
    sports: ["Boxing", "Judo", "Table Tennis", "Billiards & Snooker"],
    lat: 5.4164,
    lng: 100.3327
  },
  {
    id: "johor-football",
    name: "Sultan Ibrahim Stadium",
    cluster: "Johor",
    city: "Iskandar Puteri",
    capacity: 40000,
    role: "Football finals venue",
    sports: ["Football"],
    lat: 1.4824,
    lng: 103.6267
  },
  {
    id: "kl-sports-city",
    name: "KL Sports City",
    cluster: "Kuala Lumpur",
    city: "Kuala Lumpur",
    capacity: 87000,
    role: "Closing Ceremony and athletics hub",
    sports: ["Athletics", "Badminton", "Karate", "Volleyball"],
    lat: 3.0548,
    lng: 101.6911
  },
  {
    id: "nilai-velodrome",
    name: "National Velodrome",
    cluster: "Kuala Lumpur",
    city: "Nilai",
    capacity: 8000,
    role: "Cycling track events",
    sports: ["Cycling"],
    lat: 2.8029,
    lng: 101.7992
  },
  {
    id: "langkawi-sailing",
    name: "National Sailing Centre",
    cluster: "Kuala Lumpur",
    city: "Langkawi",
    capacity: 5000,
    role: "Sailing race village",
    sports: ["Sailing"],
    lat: 6.3500,
    lng: 99.8000
  }
];

const schedule = [
  { id: "open", type: "ceremony", title: "Opening Ceremony", sport: "Ceremony", date: "2027-09-18", time: "20:00", cluster: "Sarawak", venueId: "sarawak-stadium", status: "tickets" },
  { id: "aq1", type: "medal", title: "Aquatic Sports Finals", sport: "Aquatic Sports", date: "2027-09-19", time: "10:00", cluster: "Sarawak", venueId: "sarawak-stadium", status: "available" },
  { id: "fb1", type: "group", title: "Football Group Stage", sport: "Football", date: "2027-09-20", time: "19:30", cluster: "Johor", venueId: "johor-football", status: "available" },
  { id: "bad1", type: "knockout", title: "Badminton Quarterfinals", sport: "Badminton", date: "2027-09-22", time: "14:00", cluster: "Kuala Lumpur", venueId: "kl-sports-city", status: "available" },
  { id: "box1", type: "medal", title: "Boxing Finals", sport: "Boxing", date: "2027-09-23", time: "18:00", cluster: "Penang", venueId: "penang-arena", status: "queue" },
  { id: "cyc1", type: "medal", title: "Cycling Track Sprint", sport: "Cycling", date: "2027-09-24", time: "16:00", cluster: "Kuala Lumpur", venueId: "nilai-velodrome", status: "available" },
  { id: "sail1", type: "medal", title: "Sailing Medal Race", sport: "Sailing", date: "2027-09-26", time: "11:00", cluster: "Kuala Lumpur", venueId: "langkawi-sailing", status: "limited" },
  { id: "ath1", type: "medal", title: "Athletics Night Session", sport: "Athletics", date: "2027-09-27", time: "19:00", cluster: "Kuala Lumpur", venueId: "kl-sports-city", status: "available" },
  { id: "close", type: "ceremony", title: "Closing Ceremony", sport: "Ceremony", date: "2027-09-29", time: "20:00", cluster: "Kuala Lumpur", venueId: "kl-sports-city", status: "tickets" }
];

const tickets = [
  { id: "t-open", eventId: "open", tier: "Ceremony Premium", priceMYR: 420, inventory: 250, queue: true },
  { id: "t-aq", eventId: "aq1", tier: "Aquatics Finals", priceMYR: 90, inventory: 520, queue: false },
  { id: "t-football", eventId: "fb1", tier: "Football Matchday", priceMYR: 65, inventory: 800, queue: false },
  { id: "t-bad", eventId: "bad1", tier: "Badminton Knockout", priceMYR: 120, inventory: 450, queue: false },
  { id: "t-box", eventId: "box1", tier: "Boxing Finals", priceMYR: 105, inventory: 80, queue: true },
  { id: "t-cyc", eventId: "cyc1", tier: "Velodrome Session", priceMYR: 75, inventory: 300, queue: false },
  { id: "t-sail", eventId: "sail1", tier: "Sailing Race Village", priceMYR: 50, inventory: 140, queue: false },
  { id: "t-ath", eventId: "ath1", tier: "Athletics Night", priceMYR: 150, inventory: 650, queue: false },
  { id: "t-close", eventId: "close", tier: "Closing Ceremony", priceMYR: 360, inventory: 300, queue: true }
];

const news = [
  {
    id: "n1",
    title: "Malaysia 2027 confirms four-cluster hosting plan",
    category: "Games",
    date: "2026-06-10",
    excerpt: "Sarawak, Penang, Johor and Kuala Lumpur shape a compact multi-city edition for SEA Games 34.",
    image: "sarawak"
  },
  {
    id: "n2",
    title: "Sarawak selected as opening ceremony hub",
    category: "Ceremony",
    date: "2026-06-10",
    excerpt: "The main cluster is set to welcome athletes and fans with 17 sports and the opening celebration.",
    image: "ceremony"
  },
  {
    id: "n3",
    title: "Ticketing queue system enters fan testing",
    category: "Tickets",
    date: "2026-06-10",
    excerpt: "High-demand finals and ceremonies will use fair queueing, timed carts and multi-currency checkout.",
    image: "tickets"
  }
];

const countries = ["Malaysia", "Vietnam", "Thailand", "Indonesia", "Singapore", "Philippines", "Cambodia", "Laos", "Myanmar", "Brunei", "Timor-Leste"];

const rates = {
  MYR: 1,
  VND: 5430,
  USD: 0.213,
  SGD: 0.274,
  THB: 7.78,
  IDR: 3460,
  PHP: 12.55,
  KHR: 858,
  LAK: 4610,
  MMK: 447,
  BND: 0.274
};

const bookings = [];

function sendJson(res, data, status = 200) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function withVenue(event) {
  return { ...event, venue: venues.find(venue => venue.id === event.venueId) };
}

function searchAll(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const match = item => JSON.stringify(item).toLowerCase().includes(needle);
  return [
    ...sports.filter(match).map(item => ({ type: "Sport", title: item.name, meta: item.cluster, id: item.id })),
    ...venues.filter(match).map(item => ({ type: "Venue", title: item.name, meta: `${item.city}, ${item.cluster}`, id: item.id })),
    ...schedule.filter(match).map(item => ({ type: "Event", title: item.title, meta: `${item.date} ${item.time}`, id: item.id })),
    ...news.filter(match).map(item => ({ type: "News", title: item.title, meta: item.category, id: item.id }))
  ].slice(0, 12);
}

function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/overview") {
    return sendJson(res, {
      TEST_CORS: "HELLO_RENDER",
      edition: "SEA Games 34",
      host: "Malaysia",
      dates: { start: "2027-09-18", end: "2027-09-29" },
      clusters: ["Sarawak", "Penang", "Johor", "Kuala Lumpur"],
      countries,
      sportCount: sports.length,
      venueCount: venues.length,
      eventCount: schedule.length,
      ticketCount: tickets.reduce((sum, ticket) => sum + ticket.inventory, 0)
    });
  }

  if (req.method === "GET" && url.pathname === "/api/sports") {
    const cluster = url.searchParams.get("cluster");
    const category = url.searchParams.get("category");
    const filtered = sports.filter(sport => (!cluster || sport.cluster === cluster) && (!category || sport.category === category));
    return sendJson(res, filtered);
  }

  if (req.method === "GET" && url.pathname === "/api/venues") {
    const cluster = url.searchParams.get("cluster");
    return sendJson(res, venues.filter(venue => !cluster || venue.cluster === cluster));
  }

  if (req.method === "GET" && url.pathname === "/api/schedule") {
    const cluster = url.searchParams.get("cluster");
    const sport = url.searchParams.get("sport");
    const day = url.searchParams.get("date");
    const filtered = schedule
      .filter(event => !cluster || event.cluster === cluster)
      .filter(event => !sport || event.sport === sport)
      .filter(event => !day || event.date === day)
      .map(withVenue);
    return sendJson(res, filtered);
  }

  if (req.method === "GET" && url.pathname === "/api/tickets") {
    const enriched = tickets.map(ticket => {
      const event = schedule.find(item => item.id === ticket.eventId);
      return { ...ticket, event: withVenue(event) };
    });
    return sendJson(res, enriched);
  }

  if (req.method === "POST" && url.pathname === "/api/bookings") {
    return parseBody(req)
      .then(body => {
        const ticket = tickets.find(item => item.id === body.ticketId);
        if (!ticket) return sendJson(res, { error: "Ticket not found" }, 404);
        const quantity = Math.max(1, Math.min(Number(body.quantity) || 1, 8));
        if (ticket.inventory < quantity) return sendJson(res, { error: "Not enough inventory" }, 409);
        ticket.inventory -= quantity;
        const queuePosition = ticket.queue ? Math.floor(200 + Math.random() * 2400) : 0;
        const booking = {
          id: `SG34-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
          ticketId: ticket.id,
          quantity,
          buyer: body.buyer || "Guest fan",
          currency: body.currency || "MYR",
          status: queuePosition ? "queued" : "reserved",
          queuePosition,
          holdMinutes: 12,
          createdAt: new Date().toISOString()
        };
        bookings.unshift(booking);
        return sendJson(res, { booking, ticket });
      })
      .catch(() => sendJson(res, { error: "Invalid booking payload" }, 400));
  }

  if (req.method === "GET" && url.pathname === "/api/bookings") {
    return sendJson(res, bookings);
  }

  if (req.method === "GET" && url.pathname === "/api/news") {
    return sendJson(res, news);
  }

  if (req.method === "GET" && url.pathname === "/api/search") {
    return sendJson(res, searchAll(url.searchParams.get("q") || ""));
  }

  if (req.method === "GET" && url.pathname === "/api/rates") {
    return sendJson(res, rates);
  }

  return sendJson(res, { error: "Route not found" }, 404);
}

function serveStatic(req, res, url) {
  const filePath = url.pathname === "/" ? path.join(PUBLIC_DIR, "index.html") : path.join(PUBLIC_DIR, decodeURIComponent(url.pathname));
  const normalized = path.normalize(filePath);
  if (!normalized.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(normalized, (error, content) => {
    if (error) {
      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (fallbackError, fallback) => {
        if (fallbackError) {
          res.writeHead(404);
          return res.end("Not found");
        }
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        res.end(fallback);
      });
      return;
    }

    const ext = path.extname(normalized);
    const types = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg": "image/svg+xml; charset=utf-8"
    };
    res.writeHead(200, { "content-type": types[ext] || "application/octet-stream" });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
   res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    return handleApi(req, res, url);
  }
  return serveStatic(req, res, url);
});

server.listen(PORT, () => {
  console.log("HELLO LINH CORS TEST");
  console.log(`SEA Games 34 portal running at http://localhost:${PORT}`);
});
