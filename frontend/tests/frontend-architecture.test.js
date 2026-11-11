import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const frontendDir = path.resolve(import.meta.dirname, "..");
const repoDir = path.resolve(frontendDir, "..");

function walkJsFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkJsFiles(full));
    else if (/\.(js|jsx)$/.test(entry.name)) results.push(full);
  }
  return results;
}

test("All HTTP calls are centralized in src/servicios/apiClient.js", () => {
  const srcFiles = walkJsFiles(path.join(frontendDir, "src"));
  for (const file of srcFiles) {
    if (file.endsWith(path.join("servicios", "apiClient.js"))) continue;
    const content = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(
      content,
      /\bfetch\s*\(/,
      `Direct fetch() call found outside apiClient.js in ${path.relative(frontendDir, file)}`,
    );
  }
});

test("AuthContext has no hardcoded demo credentials or demo quick-login shortcuts", () => {
  const authContext = fs.readFileSync(
    path.join(frontendDir, "src/contextos/AuthContext.jsx"),
    "utf8",
  );
  assert.doesNotMatch(authContext, /quickLoginAdmin|quickLoginClient|admin123|cliente123/);
});

test("All main.jsx global stylesheets exist inside src/estilos/", () => {
  const mainJsx = fs.readFileSync(path.join(frontendDir, "src/main.jsx"), "utf8");
  const cssImports = [...mainJsx.matchAll(/import\s+['"]\.\/estilos\/([^'"]+\.css)['"]/g)].map(
    (m) => m[1],
  );
  assert.ok(cssImports.length >= 10, "Expected global stylesheets loaded from ./styles/");
  for (const cssFile of cssImports) {
    assert.ok(
      fs.existsSync(path.join(frontendDir, "src/estilos", cssFile)),
      `Missing global stylesheet: src/estilos/${cssFile}`,
    );
  }
});

test("Active catalog, editorial, and banner images exist in frontend/img/", () => {
  const products = JSON.parse(
    fs.readFileSync(path.join(repoDir, "backend/data/products.json"), "utf8"),
  );
  for (const product of products) {
    if (product.active === false) continue;
    const refs = [product.image, ...(Array.isArray(product.images) ? product.images : [])].filter(
      Boolean,
    );
    for (const ref of refs) {
      if (!ref.startsWith("/")) continue;
      const diskPath = path.join(frontendDir, "img", ref.replace(/^\//, ""));
      assert.ok(fs.existsSync(diskPath), `Missing image on disk for product ${product.id}: ${diskPath}`);
    }
  }

  for (const assetPath of [
    "1.jpeg",
    "2.jpeg",
    "3.jpeg",
    "ropa.png",
    "new-era.webp",
    "tenis.jpeg",
    "sauz-placeholder.svg",
  ]) {
    assert.ok(
      fs.existsSync(path.join(frontendDir, "img", assetPath)),
      `Missing active store asset: frontend/img/${assetPath}`,
    );
  }
});

test("Legacy docs/ and scripts/ directories are removed and core docs exist", () => {
  assert.equal(fs.existsSync(path.join(repoDir, "docs")), false);
  assert.equal(fs.existsSync(path.join(repoDir, "scripts")), false);
  assert.equal(fs.existsSync(path.join(frontendDir, "docs")), false);

  for (const filePath of [
    path.join(repoDir, "README.md"),
    path.join(repoDir, "BACKEND_INTEGRATION.md"),
    path.join(frontendDir, "README.md"),
    path.join(frontendDir, ".env.example"),
  ]) {
    assert.ok(fs.existsSync(filePath), `Missing required documentation/config file: ${filePath}`);
  }
});
