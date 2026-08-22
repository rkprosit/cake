const WHATSAPP_NUMBER = "918436273886";
const SITE_URL = "https://cake-two-nu.vercel.app";

const DEFAULT_CAKES = [
  { id: 1,  img: "images/cake01.jpeg", name: "Rosette Birthday Cake",        base: 549,  mrp: null, rating: "4.9", reviews: "193", cats: ["bestseller"],           badge: "Bestseller" },
  { id: 2,  img: "images/cake02.jpeg", name: "Classic Black Forest Cake",    base: 599,  mrp: null, rating: "4.9", reviews: "250", cats: ["eggless"],              badge: "Eggless" },
  { id: 3,  img: "images/cake03.jpeg", name: "Chocolate Truffle Drip Cake",  base: 649,  mrp: 749,  rating: "4.9", reviews: "62",  cats: [],                       badge: null },
  { id: 4,  img: "images/cake04.jpeg", name: "Delightful Butterscotch Cake", base: 549,  mrp: null, rating: "4.8", reviews: "305", cats: ["bestseller"],           badge: "Bestseller" },
  { id: 5,  img: "images/cake05.jpeg", name: "Rich Red Velvet Cake",         base: 699,  mrp: null, rating: "4.9", reviews: "524", cats: [],                       badge: null },
  { id: 6,  img: "images/cake06.jpeg", name: "Belgian Chocolate Truffle",    base: 749,  mrp: 899,  rating: "4.9", reviews: "88",  cats: [],                       badge: null },
  { id: 7,  img: "images/cake07.jpeg", name: "Rasmalai Cream Cake",          base: 749,  mrp: null, rating: "4.8", reviews: "43",  cats: ["eggless"],              badge: "New Arrival" },
  { id: 8,  img: "images/cake08.jpeg", name: "Alphonso Mango Cream Cake",    base: 799,  mrp: null, rating: "4.7", reviews: "31",  cats: ["eggless"],              badge: "Eggless" },
  { id: 9,  img: "images/cake09.jpeg", name: "Pineapple Cream Cake",         base: 549,  mrp: null, rating: "4.8", reviews: "156", cats: ["eggless"],              badge: "Eggless" },
  { id: 10, img: "images/cake10.jpeg", name: "Oreo Chocolate Cake",          base: 699,  mrp: null, rating: "4.9", reviews: "97",  cats: [],                       badge: null },
  { id: 11, img: "images/cake11.jpeg", name: "KitKat Crunch Cake",           base: 749,  mrp: 849,  rating: "4.8", reviews: "27",  cats: [],                       badge: null },
  { id: 12, img: "images/cake12.jpeg", name: "Strawberry Cream Cake",        base: 599,  mrp: null, rating: "4.7", reviews: "210", cats: ["eggless"],              badge: "Eggless" },
  { id: 13, img: "images/cake13.jpeg", name: "Unicorn Theme Cake",           base: 1249, mrp: 1449, rating: "4.8", reviews: "64",  cats: ["theme", "kids"],        badge: "Theme" },
  { id: 14, img: "images/cake14.jpeg", name: "Dinosaur Theme Cake",          base: 1199, mrp: null, rating: "4.9", reviews: "38",  cats: ["theme", "kids"],        badge: "New Arrival" },
  { id: 15, img: "images/cake15.jpeg", name: "Barbie Doll Cake",             base: 1499, mrp: 1699, rating: "4.7", reviews: "52",  cats: ["theme", "kids"],        badge: null },
  { id: 16, img: "images/cake16.jpeg", name: "Spiderman Theme Cake",         base: 1349, mrp: null, rating: "4.8", reviews: "29",  cats: ["theme", "kids"],        badge: null },
  { id: 17, img: "images/cake17.jpeg", name: "Personalised Photo Cake",      base: 689,  mrp: null, rating: "4.9", reviews: "374", cats: ["photo", "bestseller"],  badge: "Personalised" },
  { id: 18, img: "images/cake18.jpeg", name: "Heart-Shaped Red Velvet",      base: 899,  mrp: null, rating: "4.8", reviews: "76",  cats: ["heart"],                badge: null },
  { id: 19, img: "images/cake19.jpeg", name: "Rose Designer Cake",           base: 799,  mrp: null, rating: "4.9", reviews: "171", cats: ["bestseller"],           badge: "Bestseller" },
  { id: 20, img: "images/cake20.jpeg", name: "Black Forest Heart Cake",      base: 749,  mrp: 849,  rating: "4.7", reviews: "44",  cats: ["heart"],                badge: null },
  { id: 21, img: "images/cake21.jpeg", name: "Butterscotch Photo Cake",      base: 749,  mrp: null, rating: "4.8", reviews: "19",  cats: ["photo", "eggless"],     badge: "Eggless" },
];

/* Live catalogue replaces the built-in list once loaded */
let CAKES = DEFAULT_CAKES;

const state = {
  cat: "all",
  sort: "popular",
  weights: {},
};

function fmt(n) {
  return "₹" + n.toLocaleString("en-IN");
}

/* escape user-stored values before they touch innerHTML */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function kgPrice(base) {
  return Math.round((base * 1.85) / 50) * 50;
}

function priceOf(cake, weight) {
  return weight === "1000" ? kgPrice(cake.base) : cake.base;
}

function mrpOf(cake, weight) {
  if (!cake.mrp) return null;
  return weight === "1000" ? kgPrice(cake.mrp) : cake.mrp;
}

function waLink(cake, weight) {
  const price = priceOf(cake, weight);
  const imgUrl = cake.img.startsWith("http") ? cake.img : `${SITE_URL}/${cake.img}`;
  const text = encodeURIComponent(
    `Hi Sweet Crumbs! I want to order:\n\n🎂 ${cake.name} (${weight === "1000" ? "1kg" : "500g"}) — ${fmt(price)}\n\nPhoto: ${imgUrl}\n\nPlease confirm availability.`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

function visibleCakes() {
  let list = CAKES.filter(
    (c) => state.cat === "all" || c.cats.includes(state.cat)
  );
  if (state.sort === "plh") list = [...list].sort((a, b) => a.base - b.base);
  if (state.sort === "phl") list = [...list].sort((a, b) => b.base - a.base);
  if (state.sort === "rating")
    list = [...list].sort((a, b) => b.rating - a.rating);
  return list;
}

const grid = document.getElementById("grid");
const prodCount = document.getElementById("prodCount");

function render() {
  const list = visibleCakes();
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML = '<p class="empty-msg">No cakes found in this category.</p>';
  }

  list.forEach((cake) => {
    const weight = state.weights[cake.id] || "500";
    const price = priceOf(cake, weight);
    const mrp = mrpOf(cake, weight);
    const off = mrp ? Math.round(((mrp - price) / mrp) * 100) : null;

    const card = document.createElement("article");
    card.className = "card";
    card.dataset.id = cake.id;

    let badgesHtml = "";
    if (cake.badge) {
      const cls =
        cake.badge === "Eggless"
          ? "badge green"
          : cake.badge === "New Arrival" || cake.badge === "Theme"
            ? "badge blue"
            : "badge";
      badgesHtml += `<span class="${cls}">${esc(cake.badge)}</span>`;
    }
    if (off) {
      badgesHtml += `<span class="off-badge">${off}% OFF</span>`;
    }

    card.innerHTML = `
      <div class="img-wrap">
        <img src="${esc(cake.img)}" alt="${esc(cake.name)}" loading="lazy" />
        ${badgesHtml}
      </div>
      <div class="card-body">
        <h3 class="cake-name">${esc(cake.name)}</h3>
        <div class="rating-row">
          <span class="rb-num">${esc(cake.rating)}★</span>
          <span class="rb-count">(${esc(cake.reviews)} Reviews)</span>
        </div>
        <div class="wchips">
          <button type="button" class="wchip ${weight === "500" ? "active" : ""}" data-w="500">500g</button>
          <button type="button" class="wchip ${weight === "1000" ? "active" : ""}" data-w="1000">1kg</button>
        </div>
        <div class="price-row">
          <span class="price">${fmt(price)}</span>
          ${mrp ? `<span class="mrp">${fmt(mrp)}</span>` : ""}
          ${off ? `<span class="offpct">${off}% OFF</span>` : ""}
        </div>
        <a class="order-btn" href="${esc(waLink(cake, weight))}" target="_blank" rel="noopener">Order Now</a>
      </div>`;

    grid.appendChild(card);
  });

  prodCount.textContent = `${list.length} cake${list.length === 1 ? "" : "s"}`;
}

/* Weight chip clicks (event delegation) */
grid.addEventListener("click", (e) => {
  const chip = e.target.closest(".wchip");
  if (!chip) return;
  const cardEl = chip.closest(".card");
  const cake = CAKES.find((c) => c.id === Number(cardEl.dataset.id));
  const weight = chip.dataset.w;
  state.weights[cake.id] = weight;

  cardEl.querySelectorAll(".wchip").forEach((b) => {
    b.classList.toggle("active", b.dataset.w === weight);
  });

  const price = priceOf(cake, weight);
  const mrp = mrpOf(cake, weight);
  const off = mrp ? Math.round(((mrp - price) / mrp) * 100) : null;

  cardEl.querySelector(".price").textContent = fmt(price);
  const mrpEl = cardEl.querySelector(".mrp");
  if (mrp) {
    if (!mrpEl) {
      const s = document.createElement("span");
      s.className = "mrp";
      cardEl.querySelector(".price-row").appendChild(s);
    }
    cardEl.querySelector(".mrp").textContent = fmt(mrp);
  } else if (mrpEl) {
    mrpEl.remove();
  }
  const offEl = cardEl.querySelector(".offpct");
  if (off) {
    if (!offEl) {
      const s = document.createElement("span");
      s.className = "offpct";
      cardEl.querySelector(".price-row").appendChild(s);
    }
    cardEl.querySelector(".offpct").textContent = `${off}% OFF`;
  } else if (offEl) {
    offEl.remove();
  }
  const ob = cardEl.querySelector(".order-btn");
  ob.href = waLink(cake, weight);

  /* keep discount bubble on image in sync */
  const offBadge = cardEl.querySelector(".off-badge");
  if (offBadge) offBadge.textContent = `${off ?? 0}% OFF`;
});

/* Category chips */
document.getElementById("chips").addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  document
    .querySelectorAll("#chips .chip")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  state.cat = btn.dataset.cat;
  render();
});

/* Sort */
document.getElementById("sortSelect").addEventListener("change", (e) => {
  state.sort = e.target.value;
  render();
});

/* Mobile nav */
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
hamburger.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.addEventListener("click", (e) => {
  if (e.target.tagName === "A") navLinks.classList.remove("open");
});

/* Newsletter */
document.getElementById("newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.reset();
  alert("Thank you! You are subscribed to our offers.");
});

/* ===== Load live catalogue from Supabase (falls back to built-in list) ===== */
async function loadCakesFromCloud() {
  if (
    typeof SUPABASE_URL === "undefined" ||
    !SUPABASE_URL ||
    !SUPABASE_ANON_KEY
  )
    return;
  try {
    const { createClient } = await import(
      "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
    );
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await sb
      .from("cakes")
      .select("*")
      .eq("available", true)
      .order("sort_order")
      .order("id");
    if (error || !data || data.length === 0) return;
    CAKES = data.map((r) => ({
      id: r.id,
      img: r.img,
      name: r.name,
      base: Number(r.base),
      mrp: r.mrp ? Number(r.mrp) : null,
      rating: String(r.rating),
      reviews: String(r.reviews),
      cats: r.cats || [],
      badge: r.badge || null,
    }));
  } catch (_) {
    /* offline / blocked — keep built-in cakes */
  }
}

loadCakesFromCloud().then(render);
