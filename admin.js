/* ===== Sweet Crumbs — Admin panel ===== */
let sb = null;
let cakes = [];
let editingId = null;
let pendingFile = null;

const CATS = ["bestseller", "eggless", "photo", "theme", "kids", "heart"];
const CAT_LABELS = {
  bestseller: "Bestseller",
  eggless: "Eggless",
  photo: "Photo",
  theme: "Theme",
  kids: "Kids",
  heart: "Heart",
};

const $ = (s) => document.querySelector(s);

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

let toastTimer = null;
function toast(msg, ok = true) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.toggle("err", !ok);
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2600);
}

/* ---- boot ---- */
init();

async function init() {
  if (
    typeof SUPABASE_URL === "undefined" ||
    !SUPABASE_URL ||
    !SUPABASE_ANON_KEY ||
    !window.supabase
  ) {
    $("#setupBox").hidden = false;
    return;
  }
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data } = await sb.auth.getSession();
  applySession(data?.session || null);
  sb.auth.onAuthStateChange((_evt, s) => applySession(s));

  buildCatCheckboxes();
}

function applySession(session) {
  $("#loginWrap").hidden = !!session;
  $("#dash").hidden = !session;
  $("#logoutBtn").hidden = !session;
  if (session) loadCakes();
}

$("#logoutBtn").addEventListener("click", () => sb.auth.signOut());

/* ---- login ---- */
$("#loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = $("#loginErr");
  errEl.hidden = true;
  const btn = e.target.querySelector('[type="submit"]');
  btn.disabled = true;
  btn.textContent = "Signing in…";
  const { error } = await sb.auth.signInWithPassword({
    email: $("#loginEmail").value.trim(),
    password: $("#loginPass").value,
  });
  btn.disabled = false;
  btn.textContent = "Sign In";
  if (error) {
    errEl.textContent =
      error.message === "Invalid login credentials"
        ? "Wrong email or password."
        : error.message;
    errEl.hidden = false;
  }
});

/* ---- data ---- */
async function loadCakes() {
  const { data, error } = await sb
    .from("cakes")
    .select("*")
    .order("sort_order")
    .order("id");
  if (error) {
    toast(error.message, false);
    return;
  }
  cakes = data || [];
  renderTable();
}

/* sizes list for a cake (falls back to legacy base price as 500g) */
function cakeWeights(cake) {
  return cake.weights?.length
    ? cake.weights
    : [{
        w: "500g",
        price: cake.base,
        off: cake.mrp && cake.mrp > cake.base
          ? Math.round(((cake.mrp - cake.base) / cake.mrp) * 100)
          : null,
      }];
}

function renderTable() {
  $("#cakeCount").textContent = `(${cakes.length})`;
  $("#rows").innerHTML = cakes
    .map((c) => {
      const weights = cakeWeights(c);
      return `
    <tr data-id="${c.id}">
      <td><img class="thumb" src="${esc(c.img)}" alt="" loading="lazy" /></td>
      <td>
        <div class="cell-name">${esc(c.name)}</div>
        <div class="cell-meta">${[c.badge, ...(c.cats || [])]
          .filter(Boolean)
          .map(esc)
          .join(" · ") || "—"}</div>
      </td>
      <td class="sizes-cell">
        ${weights
          .map(
            (e) => `
          <label class="size-edit">
            <span>${esc(e.w)}</span>
            <input class="input num sz-price" type="number" min="1"
              data-w="${esc(e.w)}" value="${e.price}" />
          </label>`
          )
          .join("")}
      </td>
      <td><input class="avail" type="checkbox" ${c.available ? "checked" : ""} aria-label="Available" /></td>
      <td class="row-actions">
        <button type="button" class="btn ghost sm" data-act="edit">Edit</button>
        <button type="button" class="btn danger sm" data-act="del">Delete</button>
      </td>
    </tr>`;
    })
    .join("");
}

/* inline size-price + availability edits */
$("#rows").addEventListener("change", async (e) => {
  const tr = e.target.closest("tr");
  if (!tr) return;
  const id = Number(tr.dataset.id);
  const cake = cakes.find((x) => x.id === id);

  if (e.target.classList.contains("sz-price")) {
    const w = e.target.dataset.w;
    const price = Number(e.target.value);
    if (!price || price <= 0) return toast("Enter a valid price", false);
    const weights = cakeWeights(cake).map(
      (x) => (x.w === w ? { ...x, price } : x)
    );
    const base = Math.min(...weights.map((x) => x.price));
    const { error } = await sb.from("cakes").update({ weights, base }).eq("id", id);
    if (error) return toast(error.message, false);
    Object.assign(cake, { weights, base });
    toast("Price saved ✓");
  } else if (e.target.classList.contains("avail")) {
    const available = e.target.checked;
    const { error } = await sb.from("cakes").update({ available }).eq("id", id);
    if (error) return toast(error.message, false);
    cake.available = available;
    toast(available ? "Now visible on site" : "Hidden from site");
  }
});

$("#rows").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const id = Number(btn.closest("tr").dataset.id);
  const cake = cakes.find((x) => x.id === id);
  if (btn.dataset.act === "edit") openForm(cake);
  if (btn.dataset.act === "del") removeCake(cake);
});

async function removeCake(cake) {
  if (!confirm(`Delete "${cake.name}" permanently?`)) return;
  const { error } = await sb.from("cakes").delete().eq("id", cake.id);
  if (error) return toast(error.message, false);

  /* best-effort: remove the photo from storage too */
  const marker = "/object/public/cake-images/";
  if (cake.img.includes(marker)) {
    const path = cake.img.split(marker)[1];
    sb.storage.from("cake-images").remove([path]);
  }
  toast("Cake deleted");
  loadCakes();
}

/* ---- sizes & prices editor ---- */
function wpAddRow(entry = {}) {
  const row = document.createElement("div");
  row.className = "wp-row";
  row.innerHTML = `
    <input class="input wp-w" placeholder="Size e.g. 500g" maxlength="12"
      value="${esc(entry.w ?? "")}" />
    <input class="input num wp-price" type="number" min="1" placeholder="Price ₹"
      value="${entry.price ?? ""}" />
    <input class="input num wp-off" type="number" min="0" max="95" placeholder="Discount %"
      value="${entry.off ?? ""}" />
    <button class="btn danger sm wp-del" type="button" title="Remove size">✕</button>`;
  $("#fWeights").appendChild(row);
}

$("#fWeights").addEventListener("click", (e) => {
  const del = e.target.closest(".wp-del");
  if (!del) return;
  if ($("#fWeights").children.length > 1) del.closest(".wp-row").remove();
  else toast("A cake needs at least one size", false);
});

$("#addWpRow").addEventListener("click", () => wpAddRow());

function collectWeights() {
  const cleanOff = (v) => {
    if (v == null || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 1 && n <= 95 ? Math.round(n) : null;
  };
  return [...$("#fWeights").children]
    .map((row) => ({
      w: row.querySelector(".wp-w").value.trim(),
      price: Number(row.querySelector(".wp-price").value),
      off: cleanOff(row.querySelector(".wp-off").value),
    }));
}

function validateWeights(weights) {
  if (!weights.length) return "Add at least one size";
  const seen = new Set();
  for (const e of weights) {
    if (!e.w) return "Every size needs a name (e.g. 500g)";
    if (!e.price || e.price <= 0) return `Enter a price for ${e.w}`;
    if (seen.has(e.w.toLowerCase())) return `Size "${e.w}" is listed twice`;
    seen.add(e.w.toLowerCase());
  }
  return null;
}

/* ---- add / edit form ---- */
function buildCatCheckboxes() {
  $("#fCats").innerHTML = CATS.map(
    (c) => `<label><input type="checkbox" value="${c}" />${CAT_LABELS[c]}</label>`
  ).join("");
}

function openForm(cake) {
  editingId = cake ? cake.id : null;
  pendingFile = null;

  $("#formTitle").textContent = cake ? `Edit — ${cake.name}` : "Add New Cake";
  $("#fName").value = cake?.name || "";
  $("#fRating").value = cake?.rating ?? 4.8;
  $("#fReviews").value = cake?.reviews ?? 0;
  $("#fBadge").value = cake?.badge || "";
  $("#fAvail").checked = cake ? !!cake.available : true;
  document.querySelectorAll("#fCats input").forEach((cb) => {
    cb.checked = cake ? (cake.cats || []).includes(cb.value) : false;
  });

  const weights = cake?.weights?.length
    ? cake.weights
    : cake
      ? cakeWeights(cake)
      : [{ w: "500g", price: "", off: "" }];
  $("#fWeights").innerHTML = "";
  weights.forEach(wpAddRow);

  const prev = $("#fPreview");
  if (cake?.img) {
    prev.src = cake.img;
    prev.hidden = false;
  } else {
    prev.hidden = true;
    prev.removeAttribute("src");
  }

  $("#cakeForm").hidden = false;
  $("#addBtn").disabled = true;
  $("#cakeForm").scrollIntoView?.({ behavior: "smooth", block: "start" });
}

function closeForm() {
  $("#cakeForm").hidden = true;
  $("#addBtn").disabled = false;
  editingId = null;
  pendingFile = null;
  $("#fImg").value = "";
}

$("#addBtn").addEventListener("click", () => openForm(null));
$("#cancelBtn").addEventListener("click", closeForm);

$("#fImg").addEventListener("change", () => {
  const file = $("#fImg").files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    toast("Please choose an image file", false);
    $("#fImg").value = "";
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    toast("Image is larger than 10 MB — please compress it", false);
    $("#fImg").value = "";
    return;
  }
  pendingFile = file;
  const prev = $("#fPreview");
  prev.src = URL.createObjectURL(file);
  prev.hidden = false;
});

async function uploadImage(file) {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `cake-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await sb.storage
    .from("cake-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = sb.storage.from("cake-images").getPublicUrl(path);
  return data.publicUrl;
}

$("#cakeForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = $("#fName").value.trim();
  const rating = Math.min(5, Math.max(1, Number($("#fRating").value) || 4.8));
  const reviews = Math.max(0, Number($("#fReviews").value) || 0);
  const badge = $("#fBadge").value || null;
  const available = $("#fAvail").checked;
  const cats = [...document.querySelectorAll("#fCats input:checked")].map(
    (cb) => cb.value
  );
  const weights = collectWeights();

  if (!name) return toast("Please enter a cake name", false);
  const wErr = validateWeights(weights);
  if (wErr) return toast(wErr, false);
  const base = Math.min(...weights.map((e) => e.price));

  const btn = $("#saveBtn");
  btn.disabled = true;
  btn.textContent = "Saving…";

  try {
    let img = editingId ? cakes.find((c) => c.id === editingId)?.img : null;
    if (pendingFile) img = await uploadImage(pendingFile);
    if (!img) throw new Error("Please choose a photo for the cake");

    const rec = { name, base, mrp: null, weights, rating, reviews, cats, badge, available };
    const { error } = editingId
      ? await sb.from("cakes").update(rec).eq("id", editingId)
      : await sb.from("cakes").insert({
          ...rec,
          sort_order: (cakes.length ? Math.max(...cakes.map((c) => c.sort_order || 0)) : -10) + 10,
        });
    if (error) throw error;

    toast(editingId ? "Cake updated ✓" : "Cake added ✓");
    closeForm();
    await loadCakes();
  } catch (err) {
    toast(err.message, false);
  } finally {
    btn.disabled = false;
    btn.textContent = "Save Cake";
  }
});
