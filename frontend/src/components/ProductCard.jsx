import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const ProductArtwork = ({ category }) => {
  const isHoodie = category === 'Sudaderas';

  return (
    <div className={`product-art ${isHoodie ? 'product-art--hoodie' : 'product-art--tee'}`} aria-hidden="true">
      <svg viewBox="0 0 420 500" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`shirtShade-${isHoodie ? 'hoodie' : 'tee'}`} x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#131a22" />
            <stop offset="45%" stopColor="#0c1118" />
            <stop offset="100%" stopColor="#070b10" />
          </linearGradient>
          <linearGradient id={`gold-${isHoodie ? 'hoodie' : 'tee'}`} x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#ead7a4" />
            <stop offset="35%" stopColor="#d4b363" />
            <stop offset="100%" stopColor="#b98f3c" />
          </linearGradient>
        </defs>

        <g opacity="0.16">
          <ellipse cx="211" cy="405" rx="145" ry="38" fill="#f0d79e" />
        </g>

        <path
          d="M124 121 L169 83 L250 83 L296 121 L330 147 L346 425 C346 440 334 452 318 452 H103 C87 452 75 440 75 425 L92 147 L124 121 Z"
          fill={`url(#shirtShade-${isHoodie ? 'hoodie' : 'tee'})`}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="2"
        />

        {isHoodie && (
          <path
            d="M170 72 L153 54 C138 36 152 15 177 15 H243 C268 15 282 36 267 54 L250 72"
            fill="#0c121a"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
          />
        )}

        <path
          d="M140 133 L103 154 L89 208 L137 211 L154 176 L176 164 L165 136 Z"
          fill={`url(#shirtShade-${isHoodie ? 'hoodie' : 'tee'})`}
          opacity="0.9"
        />
        <path
          d="M280 133 L317 154 L331 208 L283 211 L266 176 L244 164 L255 136 Z"
          fill={`url(#shirtShade-${isHoodie ? 'hoodie' : 'tee'})`}
          opacity="0.9"
        />

        <g transform="translate(0 8)">
          <path d="M205 148 C235 148 252 166 253 191 L258 227 L181 227 L188 191 C189 166 205 148 205 148 Z" fill={`url(#gold-${isHoodie ? 'hoodie' : 'tee'})`} opacity="0.9" />
          <path d="M181 227 L163 267 C150 300 150 346 177 382 L191 370 C177 339 184 296 206 256 L208 227 Z" fill={`url(#gold-${isHoodie ? 'hoodie' : 'tee'})`} opacity="0.8" />
          <path d="M258 227 L276 267 C289 300 289 346 262 382 L248 370 C262 339 255 296 233 256 L231 227 Z" fill={`url(#gold-${isHoodie ? 'hoodie' : 'tee'})`} opacity="0.8" />
          <path d="M213 200 L230 239 L262 264 L235 318 L188 318 L160 264 L192 239 Z" fill={`url(#gold-${isHoodie ? 'hoodie' : 'tee'})`} opacity="0.95" />
          <circle cx="210" cy="127" r="32" fill={`url(#gold-${isHoodie ? 'hoodie' : 'tee'})`} opacity="0.9" />
          <path d="M176 245 C202 221 225 219 245 247" fill="none" stroke="#0d1218" strokeWidth="9" strokeLinecap="round" opacity="0.65" />
          <path d="M196 159 C205 177 221 175 230 159" fill="none" stroke="#0d1218" strokeWidth="8" strokeLinecap="round" opacity="0.42" />
          <path d="M152 338 C180 323 191 355 196 383" fill="none" stroke={`url(#gold-${isHoodie ? 'hoodie' : 'tee'})`} strokeWidth="9" strokeLinecap="round" />
          <path d="M288 336 C260 321 249 353 244 381" fill="none" stroke={`url(#gold-${isHoodie ? 'hoodie' : 'tee'})`} strokeWidth="9" strokeLinecap="round" />
        </g>

        <text
          x="211"
          y="312"
          textAnchor="middle"
          fontSize="34"
          fontWeight="700"
          fontStyle="italic"
          fontFamily="Georgia, 'Times New Roman', serif"
          fill="rgba(255,255,255,0.92)"
          transform="rotate(-7 211 312)"
        >
          Flight
        </text>
      </svg>
    </div>
  );
};

export const ProductCard = ({ product }) => {
  const { addToCart, formatMoney } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    await addToCart(product.id, 1);
    setAdding(false);
  };

  return (
    <article className="product-card" data-id={product.id}>
      <div className="product-media">
        <ProductArtwork category={product.category} />
        <span className="product-tag">{product.category || 'Streetwear'}</span>
        {product.stock && (
          <span className="product-stock">{product.stock} disponibles</span>
        )}
      </div>

      <div className="product-info">
        <div className="product-row">
          <h3>{product.name}</h3>
          <span className="product-price">{formatMoney(product.price)}</span>
        </div>
        <p>{product.description}</p>
        <button
          type="button"
          className="btn btn-dark add-btn"
          onClick={handleAdd}
          disabled={adding}
        >
          {adding ? 'Agregando...' : '+ Agregar a la bolsa'}
        </button>
      </div>
    </article>
  );
};
