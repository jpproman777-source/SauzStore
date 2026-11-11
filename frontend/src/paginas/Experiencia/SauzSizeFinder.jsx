import React, { useState } from "react";

export const SauzSizeFinder = ({ setActivePage, onCategorySelect }) => {
  const [activeTab, setActiveTab] = useState("sneakers"); // "sneakers", "upper", "pants", "caps"

  // Inputs para Sneakers
  const [footCm, setFootCm] = useState(27.0);

  // Inputs para Prendas Superiores
  const [chestCm, setChestCm] = useState(102);
  const [heightCm, setHeightCm] = useState(178);
  const [upperFitPreference, setUpperFitPreference] = useState("oversized"); // "fitted", "regular", "oversized"

  // Inputs para Pantalones
  const [waistCm, setWaistCm] = useState(84);
  const [hipCm, setHipCm] = useState(98);

  // Inputs para Gorras
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState(58.5);

  // Brand conversion selected in table view
  const [selectedBrandTable, setSelectedBrandTable] = useState("Nike");

  // Calzado: Cálculo de recomendación
  const calculateShoeSize = (cm) => {
    const val = parseFloat(cm) || 27.0;
    if (val < 24.5) return { us: "6.5 US", col: "38 COL", eu: "39 EU", fit: "Ajuste preciso" };
    if (val <= 25.0) return { us: "7 US", col: "39 COL", eu: "40 EU", fit: "Ajuste estándar" };
    if (val <= 25.5) return { us: "7.5 US", col: "39.5 COL", eu: "40.5 EU", fit: "Ajuste estándar" };
    if (val <= 26.0) return { us: "8 US", col: "40 COL", eu: "41 EU", fit: "Ajuste estándar" };
    if (val <= 26.5) return { us: "8.5 US", col: "40.5 COL", eu: "42 EU", fit: "Ajuste estándar" };
    if (val <= 27.0) return { us: "9 US", col: "41 COL", eu: "42.5 EU", fit: "Ajuste óptimo urbano" };
    if (val <= 27.5) return { us: "9.5 US", col: "41.5 COL", eu: "43 EU", fit: "Ajuste óptimo urbano" };
    if (val <= 28.0) return { us: "10 US", col: "42 COL", eu: "44 EU", fit: "Ajuste óptimo urbano" };
    if (val <= 28.5) return { us: "10.5 US", col: "42.5 COL", eu: "44.5 EU", fit: "Ajuste cómodo" };
    if (val <= 29.0) return { us: "11 US", col: "43 COL", eu: "45 EU", fit: "Ajuste cómodo" };
    if (val <= 29.5) return { us: "11.5 US", col: "43.5 COL", eu: "45.5 EU", fit: "Ajuste amplio" };
    return { us: "12 US", col: "44 COL", eu: "46 EU", fit: "Ajuste amplio" };
  };

  // Prendas superiores: Cálculo
  const calculateUpperSize = (chest, preference) => {
    const c = parseInt(chest, 10) || 100;
    let base = "M";
    if (c < 92) base = "S";
    else if (c <= 100) base = "M";
    else if (c <= 108) base = "L";
    else if (c <= 116) base = "XL";
    else base = "XXL";

    if (preference === "oversized") {
      if (base === "S") return { size: "M (Oversized)", note: "Recomendamos M para caída amplia estilo streetwear" };
      if (base === "M") return { size: "L (Oversized)", note: "Caída relajada y hombros caídos tipo SAUZ Black Edition" };
      if (base === "L") return { size: "XL (Oversized)", note: "Corte boxy amplio contemporáneo" };
      if (base === "XL") return { size: "XXL (Oversized)", note: "Silueta extra holgada" };
      return { size: "XXL", note: "Silueta máxima disponible" };
    }
    return { size: base, note: preference === "fitted" ? "Ajuste ceñido al cuerpo" : "Ajuste estándar regular" };
  };

  // Pantalones: Cálculo
  const calculatePantsSize = (waist) => {
    const w = parseInt(waist, 10) || 82;
    if (w < 76) return { size: "S (Talla 28-30)", note: "Cintura 71-76 cm" };
    if (w <= 84) return { size: "M (Talla 31-33)", note: "Cintura 77-84 cm - Más versátil" };
    if (w <= 92) return { size: "L (Talla 34-36)", note: "Cintura 85-92 cm" };
    if (w <= 100) return { size: "XL (Talla 38)", note: "Cintura 93-100 cm" };
    return { size: "XXL (Talla 40+)", note: "Cintura > 100 cm" };
  };

  // Gorras: Cálculo
  const calculateCapSize = (cm) => {
    const val = parseFloat(cm) || 58.5;
    if (val < 55.5) return { fitted: "7 (55.8 cm)", snapback: "Ajustable (Broche estándar)" };
    if (val <= 56.8) return { fitted: "7 1/8 (56.8 cm)", snapback: "Ajustable" };
    if (val <= 57.7) return { fitted: "7 1/4 (57.7 cm)", snapback: "Ajustable (Recomendada)" };
    if (val <= 58.7) return { fitted: "7 3/8 (58.7 cm)", snapback: "Ajustable (Recomendada)" };
    if (val <= 59.6) return { fitted: "7 1/2 (59.6 cm)", snapback: "Ajustable" };
    if (val <= 60.6) return { fitted: "7 5/8 (60.6 cm)", snapback: "Ajustable (Posición amplia)" };
    return { fitted: "7 3/4+ (61.5 cm)", snapback: "Ajustable (Últimos broches)" };
  };

  const shoeResult = calculateShoeSize(footCm);
  const upperResult = calculateUpperSize(chestCm, upperFitPreference);
  const pantsResult = calculatePantsSize(waistCm);
  const capResult = calculateCapSize(headCircumferenceCm);

  return (
    <main className="sauz-experience-page size-finder-view" id="main-content">
      {/* Editorial Header */}
      <section className="exp-hero">
        <div className="exp-hero-eyebrow">
          <span>07</span>
          <span className="exp-dot"></span>
          <span>SAUZ PRECISION LAB</span>
        </div>
        <h1 className="exp-title">SAUZ SIZE FINDER</h1>
        <p className="exp-desc">
          Encuentra tu talla exacta en sneakers, hoodies, tees y gorras de nuestras marcas oficiales: Nike, Jordan, Adidas, New Era y SAUZ.
          Ingresa tus medidas corporales para obtener una recomendación algorítmica sin margen de error.
        </p>

        {/* Tab Selector */}
        <div className="size-finder-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "sneakers"}
            className={`sf-tab-btn ${activeTab === "sneakers" ? "active" : ""}`}
            onClick={() => setActiveTab("sneakers")}
          >
            👟 Sneakers & Calzado
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "upper"}
            className={`sf-tab-btn ${activeTab === "upper" ? "active" : ""}`}
            onClick={() => setActiveTab("upper")}
          >
            👕 Hoodies & Camisetas
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "pants"}
            className={`sf-tab-btn ${activeTab === "pants" ? "active" : ""}`}
            onClick={() => setActiveTab("pants")}
          >
            👖 Pantalones & Pants
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "caps"}
            className={`sf-tab-btn ${activeTab === "caps" ? "active" : ""}`}
            onClick={() => setActiveTab("caps")}
          >
            🧢 Gorras & Headwear
          </button>
        </div>
      </section>

      {/* Main Interactive Grid */}
      <section className="sf-calculator-container">
        {activeTab === "sneakers" && (
          <div className="sf-calc-grid">
            {/* Input Controls */}
            <div className="sf-inputs-card">
              <div className="sf-card-header">
                <h3>Calculador de Calzado Urbano</h3>
                <span className="sf-tag">Nike / Jordan / Adidas</span>
              </div>

              <div className="sf-field-group">
                <div className="sf-field-label-row">
                  <label htmlFor="foot-slider">Longitud del pie en centímetros (CM)</label>
                  <span className="sf-val-badge">{footCm} cm</span>
                </div>
                <input
                  id="foot-slider"
                  type="range"
                  min="24.0"
                  max="30.5"
                  step="0.5"
                  value={footCm}
                  onChange={(e) => setFootCm(parseFloat(e.target.value))}
                  className="sf-range-slider"
                />
                <div className="sf-range-ticks">
                  <span>24 cm (6 US)</span>
                  <span>27 cm (9 US)</span>
                  <span>30 cm (12 US)</span>
                </div>
              </div>

              <div className="sf-guide-box">
                <h4>¿Cómo medir tu pie en casa?</h4>
                <ol>
                  <li>Coloca una hoja de papel en el suelo pegada a la pared.</li>
                  <li>Pisa con el talón apoyado contra la pared.</li>
                  <li>Marca con un lápiz el punto más sobresaliente del dedo gordo.</li>
                  <li>Mide la distancia en centímetros con una regla.</li>
                </ol>
              </div>
            </div>

            {/* Results Output */}
            <div className="sf-results-card">
              <div className="sf-result-badge-top">Tu talla recomendada</div>
              <div className="sf-main-size-display">
                <span className="sf-size-big">{shoeResult.us}</span>
                <span className="sf-size-sub">{shoeResult.col} • {shoeResult.eu}</span>
              </div>
              <div className="sf-fit-indicator">
                <span className="sf-fit-dot"></span>
                <span>{shoeResult.fit}</span>
              </div>

              <div className="sf-brand-breakdown">
                <div className="sf-brand-row">
                  <span>Nike Sportswear / Retro</span>
                  <strong>{shoeResult.us}</strong>
                </div>
                <div className="sf-brand-row">
                  <span>Air Jordan 1 & 4</span>
                  <strong>{shoeResult.us} (True to Size)</strong>
                </div>
                <div className="sf-brand-row">
                  <span>Adidas Originals / Campus</span>
                  <strong>{shoeResult.us}</strong>
                </div>
              </div>

              <div className="sf-actions">
                <button
                  className="sf-cta-btn"
                  onClick={() => {
                    if (onCategorySelect) onCategorySelect("Zapatillas");
                    else if (setActivePage) setActivePage("catalog");
                  }}
                >
                  Explorar Sneakers en Catálogo →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "upper" && (
          <div className="sf-calc-grid">
            <div className="sf-inputs-card">
              <div className="sf-card-header">
                <h3>Prendas Superiores (Hoodies, Chaquetas, Tees)</h3>
                <span className="sf-tag">SAUZ / Nike / Adidas</span>
              </div>

              <div className="sf-field-group">
                <div className="sf-field-label-row">
                  <label htmlFor="chest-input">Contorno de Pecho (cm)</label>
                  <span className="sf-val-badge">{chestCm} cm</span>
                </div>
                <input
                  id="chest-input"
                  type="range"
                  min="85"
                  max="125"
                  step="1"
                  value={chestCm}
                  onChange={(e) => setChestCm(parseInt(e.target.value, 10))}
                  className="sf-range-slider"
                />
                <div className="sf-range-ticks">
                  <span>88 cm (S)</span>
                  <span>100 cm (M)</span>
                  <span>108 cm (L)</span>
                  <span>118 cm (XL)</span>
                </div>
              </div>

              <div className="sf-field-group">
                <div className="sf-field-label-row">
                  <label htmlFor="height-input">Estatura aproximada (cm)</label>
                  <span className="sf-val-badge">{heightCm} cm</span>
                </div>
                <input
                  id="height-input"
                  type="range"
                  min="160"
                  max="200"
                  step="1"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseInt(e.target.value, 10))}
                  className="sf-range-slider"
                />
              </div>

              <div className="sf-field-group">
                <label className="sf-block-label">Preferencia de Silueta:</label>
                <div className="sf-pref-toggle">
                  <button
                    className={`sf-pref-btn ${upperFitPreference === "fitted" ? "active" : ""}`}
                    onClick={() => setUpperFitPreference("fitted")}
                  >
                    Fitted (Al cuerpo)
                  </button>
                  <button
                    className={`sf-pref-btn ${upperFitPreference === "regular" ? "active" : ""}`}
                    onClick={() => setUpperFitPreference("regular")}
                  >
                    Regular Fit
                  </button>
                  <button
                    className={`sf-pref-btn ${upperFitPreference === "oversized" ? "active" : ""}`}
                    onClick={() => setUpperFitPreference("oversized")}
                  >
                    Oversized (Streetwear)
                  </button>
                </div>
              </div>
            </div>

            <div className="sf-results-card">
              <div className="sf-result-badge-top">Talla Sugerida</div>
              <div className="sf-main-size-display">
                <span className="sf-size-big">{upperResult.size}</span>
              </div>
              <p className="sf-note-text">{upperResult.note}</p>

              <div className="sf-brand-breakdown">
                <div className="sf-brand-row">
                  <span>SAUZ Black Edition Tees</span>
                  <strong>Corte Boxy Streetwear</strong>
                </div>
                <div className="sf-brand-row">
                  <span>Hoodies & Sudaderas</span>
                  <strong>Drop shoulder premium</strong>
                </div>
                <div className="sf-brand-row">
                  <span>Chaquetas Bombers</span>
                  <strong>Silueta estándar forrada</strong>
                </div>
              </div>

              <div className="sf-actions">
                <button
                  className="sf-cta-btn"
                  onClick={() => {
                    if (onCategorySelect) onCategorySelect("Sudaderas");
                    else if (setActivePage) setActivePage("catalog");
                  }}
                >
                  Ver Prendas Superiores →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "pants" && (
          <div className="sf-calc-grid">
            <div className="sf-inputs-card">
              <div className="sf-card-header">
                <h3>Pantalones, Joggers & Cargos</h3>
                <span className="sf-tag">Cintura y Cadera</span>
              </div>

              <div className="sf-field-group">
                <div className="sf-field-label-row">
                  <label htmlFor="waist-input">Contorno de Cintura (cm)</label>
                  <span className="sf-val-badge">{waistCm} cm</span>
                </div>
                <input
                  id="waist-input"
                  type="range"
                  min="70"
                  max="110"
                  step="1"
                  value={waistCm}
                  onChange={(e) => setWaistCm(parseInt(e.target.value, 10))}
                  className="sf-range-slider"
                />
                <div className="sf-range-ticks">
                  <span>75 cm (S/28)</span>
                  <span>82 cm (M/32)</span>
                  <span>90 cm (L/34)</span>
                  <span>100 cm (XL/38)</span>
                </div>
              </div>

              <div className="sf-guide-box">
                <h4>Tip de ajuste SAUZ:</h4>
                <p>Nuestros joggers y pants incluyen cordón elástico regulable en pretina de alta densidad, permitiendo adaptar hasta +/- 3 cm en cintura.</p>
              </div>
            </div>

            <div className="sf-results-card">
              <div className="sf-result-badge-top">Talla Sugerida</div>
              <div className="sf-main-size-display">
                <span className="sf-size-big">{pantsResult.size}</span>
              </div>
              <p className="sf-note-text">{pantsResult.note}</p>

              <div className="sf-brand-breakdown">
                <div className="sf-brand-row">
                  <span>Talla Colombia</span>
                  <strong>{pantsResult.size.split(" ")[1] || "32"}</strong>
                </div>
                <div className="sf-brand-row">
                  <span>Largo estándar</span>
                  <strong>32" (Inseam 81 cm)</strong>
                </div>
              </div>

              <div className="sf-actions">
                <button
                  className="sf-cta-btn"
                  onClick={() => {
                    if (onCategorySelect) onCategorySelect("Pantalones");
                    else if (setActivePage) setActivePage("catalog");
                  }}
                >
                  Ver Pantalones y Cargos →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "caps" && (
          <div className="sf-calc-grid">
            <div className="sf-inputs-card">
              <div className="sf-card-header">
                <h3>Gorras & Headwear New Era / SAUZ</h3>
                <span className="sf-tag">Fitted & Ajustables</span>
              </div>

              <div className="sf-field-group">
                <div className="sf-field-label-row">
                  <label htmlFor="head-input">Circunferencia de la cabeza (cm)</label>
                  <span className="sf-val-badge">{headCircumferenceCm} cm</span>
                </div>
                <input
                  id="head-input"
                  type="range"
                  min="54.0"
                  max="62.5"
                  step="0.5"
                  value={headCircumferenceCm}
                  onChange={(e) => setHeadCircumferenceCm(parseFloat(e.target.value))}
                  className="sf-range-slider"
                />
                <div className="sf-range-ticks">
                  <span>55 cm</span>
                  <span>58.5 cm (Promedio)</span>
                  <span>62 cm</span>
                </div>
              </div>

              <div className="sf-guide-box">
                <h4>¿Cómo medir tu cabeza?</h4>
                <p>Usa una cinta métrica flexible. Pásala alrededor de la parte más ancha de la cabeza, aproximadamente 1 cm por encima de las cejas y las orejas.</p>
              </div>
            </div>

            <div className="sf-results-card">
              <div className="sf-result-badge-top">Talla Recomendada</div>
              <div className="sf-main-size-display">
                <span className="sf-size-big">{capResult.fitted}</span>
                <span className="sf-size-sub">New Era 59FIFTY Fitted</span>
              </div>
              <p className="sf-note-text">Para siluetas ajustables 9FORTY / 9TWENTY / SAUZ: <strong>{capResult.snapback}</strong>.</p>

              <div className="sf-brand-breakdown">
                <div className="sf-brand-row">
                  <span>59FIFTY (Cerrada)</span>
                  <strong>{capResult.fitted}</strong>
                </div>
                <div className="sf-brand-row">
                  <span>9FORTY / 9FIFTY (Broche)</span>
                  <strong>One Size Fits Most (55 - 61 cm)</strong>
                </div>
              </div>

              <div className="sf-actions">
                <button
                  className="sf-cta-btn"
                  onClick={() => {
                    if (onCategorySelect) onCategorySelect("Gorras");
                    else if (setActivePage) setActivePage("catalog");
                  }}
                >
                  Explorar Gorras New Era & SAUZ →
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Official Brand Conversion Reference Tables */}
      <section className="sf-tables-section">
        <div className="sf-tables-header">
          <h2>Tablas Oficiales de Conversión por Marca</h2>
          <p>Especificaciones técnicas provistas directamente por los fabricantes oficiales distribuidos en SAUZ STORE.</p>
          <div className="sf-brand-table-toggles">
            {["Nike", "Jordan", "Adidas", "New Era", "SAUZ"].map((b) => (
              <button
                key={b}
                className={`sf-brand-tab-btn ${selectedBrandTable === b ? "active" : ""}`}
                onClick={() => setSelectedBrandTable(b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="sf-table-wrapper">
          {selectedBrandTable === "Nike" && (
            <table className="sf-data-table">
              <thead>
                <tr>
                  <th>US Men</th>
                  <th>UK</th>
                  <th>EU / Col Equivalente</th>
                  <th>Centímetros (CM)</th>
                  <th>Ajuste Característico</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>7.0 US</td><td>6.0</td><td>40 EU (39 COL)</td><td>25.0 cm</td><td>Standard fit</td></tr>
                <tr><td>7.5 US</td><td>6.5</td><td>40.5 EU (39.5 COL)</td><td>25.5 cm</td><td>Standard fit</td></tr>
                <tr><td>8.0 US</td><td>7.0</td><td>41 EU (40 COL)</td><td>26.0 cm</td><td>Standard fit</td></tr>
                <tr><td>8.5 US</td><td>7.5</td><td>42 EU (40.5 COL)</td><td>26.5 cm</td><td>Standard fit</td></tr>
                <tr><td>9.0 US</td><td>8.0</td><td>42.5 EU (41 COL)</td><td>27.0 cm</td><td>True to size</td></tr>
                <tr><td>9.5 US</td><td>8.5</td><td>43 EU (41.5 COL)</td><td>27.5 cm</td><td>True to size</td></tr>
                <tr><td>10.0 US</td><td>9.0</td><td>44 EU (42 COL)</td><td>28.0 cm</td><td>True to size</td></tr>
                <tr><td>10.5 US</td><td>9.5</td><td>44.5 EU (42.5 COL)</td><td>28.5 cm</td><td>True to size</td></tr>
                <tr><td>11.0 US</td><td>10.0</td><td>45 EU (43 COL)</td><td>29.0 cm</td><td>Comfort fit</td></tr>
              </tbody>
            </table>
          )}

          {selectedBrandTable === "Jordan" && (
            <table className="sf-data-table">
              <thead>
                <tr>
                  <th>Modelo Jordan</th>
                  <th>Corte / Silueta</th>
                  <th>Recomendación de Talla</th>
                  <th>Nota de Estilo</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Air Jordan 1 High / Mid / Low</td><td>Silueta clásica plana</td><td>True to Size (Tu talla habitual)</td><td>Empeine estrecho; si tienes pie ancho considera medio número más</td></tr>
                <tr><td>Air Jordan 4 Retro</td><td>Armazón estructurado con alas TPU</td><td>True to Size o +0.5 US</td><td>Caja de puntera firme</td></tr>
                <tr><td>Jordan Apparel (Hoodies & Tees)</td><td>Heavyweight Streetwear</td><td>Corte ligeramente holgado</td><td>Perfecto para caída urbana sin ser excesivo</td></tr>
              </tbody>
            </table>
          )}

          {selectedBrandTable === "Adidas" && (
            <table className="sf-data-table">
              <thead>
                <tr>
                  <th>US Men</th>
                  <th>UK</th>
                  <th>EU</th>
                  <th>Centímetros (CM)</th>
                  <th>Siluetas Populares (Campus / Forum)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>8.0 US</td><td>7.5</td><td>41 1/3</td><td>26.0 cm</td><td>True to size</td></tr>
                <tr><td>8.5 US</td><td>8.0</td><td>42</td><td>26.5 cm</td><td>True to size</td></tr>
                <tr><td>9.0 US</td><td>8.5</td><td>42 2/3</td><td>27.0 cm</td><td>Ajuste óptimo</td></tr>
                <tr><td>9.5 US</td><td>9.0</td><td>43 1/3</td><td>27.5 cm</td><td>Ajuste óptimo</td></tr>
                <tr><td>10.0 US</td><td>9.5</td><td>44</td><td>28.0 cm</td><td>Ajuste óptimo</td></tr>
                <tr><td>10.5 US</td><td>10.0</td><td>44 2/3</td><td>28.5 cm</td><td>True to size</td></tr>
              </tbody>
            </table>
          )}

          {selectedBrandTable === "New Era" && (
            <table className="sf-data-table">
              <thead>
                <tr>
                  <th>Talla 59FIFTY (Fitted)</th>
                  <th>Pulgadas</th>
                  <th>Centímetros (CM)</th>
                  <th>Equivalencia Snapback</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>7</td><td>22"</td><td>55.8 cm</td><td>Ajustable - Posición inicial</td></tr>
                <tr><td>7 1/8</td><td>22 3/8"</td><td>56.8 cm</td><td>Ajustable</td></tr>
                <tr><td>7 1/4</td><td>22 3/4"</td><td>57.7 cm</td><td>Ajustable (Posición media)</td></tr>
                <tr><td>7 3/8</td><td>23 1/8"</td><td>58.7 cm</td><td>Ajustable (Posición media)</td></tr>
                <tr><td>7 1/2</td><td>23 1/2"</td><td>59.6 cm</td><td>Ajustable</td></tr>
                <tr><td>7 5/8</td><td>23 7/8"</td><td>60.6 cm</td><td>Ajustable - Posición amplia</td></tr>
                <tr><td>7 3/4</td><td>24 1/4"</td><td>61.5 cm</td><td>Ajustable - Últimos pines</td></tr>
              </tbody>
            </table>
          )}

          {selectedBrandTable === "SAUZ" && (
            <table className="sf-data-table">
              <thead>
                <tr>
                  <th>Talla SAUZ</th>
                  <th>Pecho (cm)</th>
                  <th>Largo Prenda (cm)</th>
                  <th>Cintura Pants (cm)</th>
                  <th>Fit Signature</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>S</td><td>90 - 98</td><td>71</td><td>72 - 78</td><td>Boxy relaxed fit</td></tr>
                <tr><td>M</td><td>99 - 106</td><td>74</td><td>79 - 86</td><td>Signature Black Edition Oversized</td></tr>
                <tr><td>L</td><td>107 - 114</td><td>76</td><td>87 - 94</td><td>Signature Black Edition Oversized</td></tr>
                <tr><td>XL</td><td>115 - 122</td><td>78</td><td>95 - 102</td><td>Drop-shoulder Streetwear</td></tr>
                <tr><td>XXL</td><td>123 - 130</td><td>80</td><td>103 - 110</td><td>Extra Heavyweight Loose</td></tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Legal Disclaimer */}
        <div className="sf-legal-disclaimer">
          <p>
            <strong>Aviso de precisión técnica:</strong> Las medidas y conversiones mostradas son aproximadas y se basan en las especificaciones oficiales provistas por los fabricantes.
            El ajuste real puede variar sutilmente dependiendo del material, la confección y la silueta específica de cada prenda o calzado (Oversized, Slim o Regular Fit).
            En SAUZ STORE ofrecemos garantía total de cambio por talla en prendas no usadas con sus etiquetas originales.
          </p>
        </div>
      </section>
    </main>
  );
};
