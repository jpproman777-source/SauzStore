import React from "react";
import { approvedBrandAssets } from "../../assets/brandAssets";

export const BrandLogo = ({
  brand = "SAUZ",
  className = "",
  variant = "default",
}) => {
  const name = brand.toUpperCase();
  const asset = approvedBrandAssets[name];
  if (variant !== "default") {
    return asset ? (
      <img
        className={`integrated-brand-logo integrated-brand-${name.toLowerCase()} ${className}`}
        src={asset.src}
        alt={name === "SAUZ" ? "SAUZ STORE" : name}
        width={asset.width}
        height={asset.height}
      />
    ) : (
      <span className={`brand-wordmark integrated-brand-fallback ${className}`}>
        {name === "SAUZ" ? "SAUZ STORE" : name}
      </span>
    );
  }
  return name === "SAUZ" && asset ? (
    <img
      className={`brand-logo sauz-logo ${className}`}
      src={asset.src}
      alt="SAUZ STORE"
      width={asset.width}
      height={asset.height}
    />
  ) : (
    <span className={`brand-wordmark ${className}`}>{name}</span>
  );
};

export const BrandStrip = () => (
  <div
    className="integrated-brand-strip"
    role="group"
    aria-label="Jordan, Nike y Adidas"
  >
    {["JORDAN", "NIKE", "ADIDAS"].map((brand) => (
      <div
        className={`integrated-brand-slot integrated-brand-slot-${brand.toLowerCase()}`}
        key={brand}
      >
        <BrandLogo brand={brand} variant="campaign" />
      </div>
    ))}
  </div>
);
