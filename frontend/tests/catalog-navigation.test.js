import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { filterCatalog } from "../src/lib/catalogFilters.js";

const frontendDir = path.resolve(import.meta.dirname, "..");
const repoDir = path.resolve(frontendDir, "..");

test("Header Ropa mega menu removes Siluetas Urbanas and Explorar Catálogo columns", () => {
  const header = fs.readFileSync(path.join(frontendDir, "src/components/layout/Header.jsx"), "utf8");
  const ropaSectionMatch = header.match(
    /activeDropdown === "ropa" && \(([\s\S]*?)activeDropdown === "sneakers"/,
  );
  assert.ok(ropaSectionMatch, "Expected ropa dropdown block in Header.jsx");
  const ropaBlock = ropaSectionMatch[1];

  assert.doesNotMatch(ropaBlock, /Siluetas Urbanas/);
  assert.doesNotMatch(ropaBlock, /Explorar Catálogo/);
  assert.match(ropaBlock, /mega-grid-2/);
  assert.match(ropaBlock, /Prendas Superiores/);
  assert.match(ropaBlock, /Prendas Inferiores/);
});

test("handleCatalogFilter resets stale query and URL filters when entering Camisetas", () => {
  const app = fs.readFileSync(path.join(frontendDir, "src/App.jsx"), "utf8");
  const catalog = fs.readFileSync(path.join(frontendDir, "src/pages/Catalog.jsx"), "utf8");

  assert.match(
    app,
    /const handleCatalogFilter = \(\{ category = "Todas", brand = "Todas", query = "", sort = "destacados" \} = \{\}\)/,
  );
  assert.match(app, /const params = new URLSearchParams\(\);/);
  assert.match(catalog, /searchQuery\?\.trim\(\) && \[`Búsqueda: \$\{searchQuery\.trim\(\)\}`/);
});

test("Camisetas category returns active products when query and brand are clean", () => {
  const allProducts = JSON.parse(
    fs.readFileSync(path.join(repoDir, "backend/data/products.json"), "utf8"),
  );
  const activeProducts = allProducts.filter((product) => product.active !== false);
  const camisetas = filterCatalog(activeProducts, {
    category: "Camisetas",
    brand: "Todas",
    size: "Todas",
    status: "Todos",
    min: "",
    max: "",
    query: "",
    sort: "destacados",
  });

  assert.equal(camisetas.length, 7);
});

test("Catalog selection hero uses isolated styles without altering catalog body", () => {
  const catalog = fs.readFileSync(path.join(frontendDir, "src/pages/Catalog.jsx"), "utf8");
  const heroCss = fs.readFileSync(path.join(frontendDir, "src/pages/selection-hero.css"), "utf8");

  assert.match(catalog, /<header className="selection-hero"/);
  assert.match(catalog, /SAUZ STORE \/ BLACK EDITION/);
  assert.match(catalog, /La selección<span className="selection-hero-dot">\.<\/span>/);
  assert.match(catalog, /Prendas y accesorios curados para tu estilo\./);
  assert.match(catalog, /Explorar catálogo/);
  assert.match(catalog, /className="selection-hero-arc"/);
  assert.match(catalog, /<section className="premium-catalog-body" aria-label="Catálogo de productos">/);

  assert.match(heroCss, /\.selection-hero\b/);
  assert.match(heroCss, /background:\s*#000000/);
  assert.match(heroCss, /clamp\(/);
  assert.match(heroCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.doesNotMatch(heroCss, /\.premium-card|\.premium-grid|\.premium-catalog-body/);
});
