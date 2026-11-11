import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { approvedBrandAssets } from "../src/assets/brandAssets.js";
import { filterCatalog } from "../src/lib/catalogFilters.js";
import { brandOf } from "../src/lib/products.js";

const frontendDir = path.resolve(import.meta.dirname, "..");
const repoDir = path.resolve(frontendDir, "..");

test("brandAssets exposes proportional official logos including New Era", () => {
  for (const key of ["SAUZ", "NIKE", "JORDAN", "ADIDAS", "NEW_ERA"]) {
    const asset = approvedBrandAssets[key];
    assert.ok(asset, `Missing approvedBrandAssets.${key}`);
    assert.ok(asset.src.startsWith("/logos/web/"), `${key} src should live under /logos/web/`);
    assert.ok(asset.width > 0 && asset.height > 0, `${key} dimensions must be positive`);
    const diskPath = path.join(frontendDir, "img", asset.src.replace(/^\//, ""));
    assert.ok(fs.existsSync(diskPath), `Logo file missing on disk: ${diskPath}`);
  }
});

test("Brands page and Home #marcas section reuse the 2x2 official brand cards grid", () => {
  const brandsJsx = fs.readFileSync(path.join(frontendDir, "src/pages/Brands.jsx"), "utf8");
  const gridJsx = fs.readFileSync(
    path.join(frontendDir, "src/components/layout/BrandsDirectoryGrid.jsx"),
    "utf8",
  );
  const homeJsx = fs.readFileSync(path.join(frontendDir, "src/pages/Home.jsx"), "utf8");
  const css = fs.readFileSync(path.join(frontendDir, "src/pages/brands-directory.css"), "utf8");

  assert.match(brandsJsx, /SAUZ STORE \/ BRAND DIRECTORY/);
  assert.match(brandsJsx, /LAS MARCAS\./);
  assert.match(brandsJsx, /TU ESTILO\./);
  assert.match(brandsJsx, /Una selección de marcas que definen nuestra visión del streetwear\./);
  assert.match(brandsJsx, /<BrandsDirectoryGrid onCatalogFilter=\{onCatalogFilter\}/);

  assert.match(homeJsx, /id="marcas"/);
  assert.match(homeJsx, /<BrandsDirectoryGrid[\s\S]*onCatalogFilter=\{onCatalogFilter\}/);
  assert.match(gridJsx, /EXPLORAR COLECCIÓN/);

  for (const brand of ["Nike", "Jordan", "Adidas", "New Era"]) {
    assert.ok(gridJsx.includes(`name: "${brand}"`), `Missing brand card for ${brand}`);
    assert.ok(gridJsx.includes(`filterValue: "${brand}"`), `Missing catalog filter value for ${brand}`);
  }

  for (const assetKey of ["NIKE", "JORDAN", "ADIDAS", "NEW_ERA"]) {
    assert.ok(gridJsx.includes(`approvedBrandAssets.${assetKey}`), `Expected official asset ${assetKey}`);
  }

  // Ensure CSS enforces 2x2 desktop grid, 1 column mobile, uniform heights, and reduced motion support
  assert.match(css, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /height:\s*100%/);
  assert.match(css, /overflow-x:\s*clip/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test("App, Header, and Footer wire /marcas route cleanly", () => {
  const app = fs.readFileSync(path.join(frontendDir, "src/App.jsx"), "utf8");
  const header = fs.readFileSync(path.join(frontendDir, "src/components/layout/Header.jsx"), "utf8");
  const footer = fs.readFileSync(path.join(frontendDir, "src/components/layout/Footer.jsx"), "utf8");

  assert.match(app, /if \(path === "\/marcas" \|\| path === "\/brands"\) return "brands"/);
  assert.match(app, /else if \(page === "brands"\) path = "\/marcas"/);
  assert.match(app, /<Home[\s\S]*onCatalogFilter=\{handleCatalogFilter\}/);
  assert.match(app, /activePage === "brands" && <Brands onCatalogFilter=\{handleCatalogFilter\} \/>/);

  assert.match(header, /onClick=\{\(\) => navigate\("brands"\)\}/);
  assert.match(header, /route\.pathname === "\/marcas"/);
  assert.match(footer, /onClick=\{\(\) => handleNav\("brands"\)\}/);
});

test("Catalog filter returns products for Nike, Jordan, Adidas, and New Era", () => {
  const products = JSON.parse(
    fs.readFileSync(path.join(repoDir, "backend/data/products.json"), "utf8"),
  );

  for (const brand of ["Nike", "Jordan", "Adidas", "New Era"]) {
    const filtered = filterCatalog(products, {
      category: "Todas",
      brand,
      query: "",
      sort: "destacados",
    });
    assert.ok(filtered.length > 0, `Expected catalog items for brand ${brand}`);
    assert.ok(
      filtered.every((item) => brandOf(item) === brand),
      `Every filtered item must match brand ${brand}`,
    );
  }
});
