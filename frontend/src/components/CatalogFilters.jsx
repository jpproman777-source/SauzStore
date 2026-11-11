import React from 'react';
import { ChevronDown } from 'lucide-react';

export function CatalogFilters({ scope, groups, hasPrices, min, max, setMin, setMax }) {
  return <div className="sauz-filter-groups">
    {groups.filter(group => group.options.length > 1).map(group => <details key={group.key} open className="sauz-filter-group">
      <summary>{group.title}<ChevronDown size={16} aria-hidden="true" /></summary>
      <fieldset><legend className="sr-only">{group.title}</legend>
        {group.options.map(({ value, label, count }) => <label key={value} className="sauz-filter-choice">
          <input type="radio" name={`${scope}-${group.key}`} value={value} checked={group.value === value} onChange={() => group.onChange(value)} />
          <span>{label}</span>{count !== undefined && <small>{count}</small>}
        </label>)}
      </fieldset>
    </details>)}
    {hasPrices && <details open className="sauz-filter-group"><summary>Precio en COP<ChevronDown size={16} aria-hidden="true" /></summary>
      <div className="premium-price-range"><label>Mínimo<input type="number" min="0" value={min} onChange={event => setMin(event.target.value)} placeholder="Sin mínimo" /></label><label>Máximo<input type="number" min="0" value={max} onChange={event => setMax(event.target.value)} placeholder="Sin máximo" /></label></div>
    </details>}
  </div>;
}
