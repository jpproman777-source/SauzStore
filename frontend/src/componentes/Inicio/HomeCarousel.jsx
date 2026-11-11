import React, { useEffect, useRef, useState } from "react";
import { BrandStrip } from "../BarraNavegacion/BrandLogo";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import "./home-carousel-layout.css";

const root = "/SAUZ_CARRUSEL_3_IMAGENES/";
export const campaignSlides = [
  {
    key: "jordan",
    file: "01-jordan-original",
    width: 2048,
    height: 1024,
    webWidth: 1920,
    title: ["DOMINA.", "LA CALLE."],
    subtitle: "La colección Jordan que lleva tu estilo al siguiente nivel.",
    button: "Explorar Jordan",
    collection: "Jordan",
    alt: "Sneakers Jordan negros con detalles rojos sobre cajas y suelo de madera.",
  },
  {
    key: "camisetas",
    file: "02-camisetas",
    width: 1774,
    height: 887,
    webWidth: 1774,
    heroImage: {
      file: "02-modelos-editorial",
      originalFile: "Moda urbana sobre fondo turquesa.png",
      width: 1672,
      height: 941,
      webWidth: 1672,
      alt: "Tres modelos con ropa Jordan, Nike y Adidas sobre arquitectura de concreto y fondo azul verdoso.",
    },
    title: ["VISTE.", "DIFERENTE."],
    subtitle: "Streetwear diseñado para destacar.",
    button: "Explorar camisetas",
    collection: "Camisetas",
    alt: "Tres camisetas negras en un perchero de estudio sobre bloques de concreto.",
  },
  {
    key: "gorras",
    file: "03-gorras-nike-jordan-adidas",
    width: 1774,
    height: 887,
    webWidth: 1774,
    heroImage: {
      file: "03-new-era",
      originalFile: "3760a51c-daef-4779-9c25-ff6bdd8627cc.png",
      width: 1672,
      height: 941,
      webWidth: 1672,
      alt: "Cinco gorras New Era: Yankees negra, Dodgers negra, Athletics verde, Bulls roja y Raiders negra sobre plataformas de estudio gris claro.",
    },
    eyebrow: "03 / NEW ERA COLLECTION",
    showBrands: false,
    title: ["LA CALLE.", "TIENE ESTILO."],
    subtitle: "Gorras icónicas. Actitud sin límites.",
    button: "Explorar gorras",
    collection: "Gorras",
    alt: "Gorras negras Nike, Jordan y Adidas sobre bloques de concreto.",
  },
];

export const CampaignImage = ({ slide, priority = false, className = "" }) => (
  <picture className={className}>
    <source
      type="image/webp"
      srcSet={`${root}${slide.file}-960.webp 960w, ${root}${slide.file}-${slide.webWidth}.webp ${slide.webWidth}w`}
      sizes="(max-width: 700px) 100vw, 80vw"
    />
    <img
      src={`${root}${slide.originalFile || `${slide.file}.png`}`}
      alt={slide.alt}
      width={slide.width}
      height={slide.height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  </picture>
);

export const HomeCarousel = ({ onCollectionSelect }) => {
  const region = useRef(null),
    touchStart = useRef(null);
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [playing, setPlaying] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [hovered, setHovered] = useState(false),
    [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(!document.hidden),
    [inView, setInView] = useState(true);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      setReduced(media.matches);
      if (media.matches) setPlaying(false);
    };
    const visibility = () => setVisible(!document.hidden);
    media.addEventListener("change", change);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(region.current);
    return () => {
      media.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", visibility);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!playing || hovered || focused || !visible || !inView || reduced)
      return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % campaignSlides.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [playing, hovered, focused, visible, inView, reduced]);
  const go = (next) => {
    setPlaying(false);
    setIndex((next + campaignSlides.length) % campaignSlides.length);
  };
  const keyboard = (event) => {
    const actions = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: campaignSlides.length - 1,
    };
    if (event.key in actions) {
      event.preventDefault();
      go(actions[event.key]);
    }
  };
  return (
    <section
      className="edition-hero"
      ref={region}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Campaña SAUZ Black Edition"
      tabIndex={0}
      onKeyDown={keyboard}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
        setPlaying(false);
      }}
      onTouchEnd={(event) => {
        if (!touchStart.current) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - touchStart.current.x,
          dy = touch.clientY - touchStart.current.y;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3)
          go(index + (dx < 0 ? 1 : -1));
        touchStart.current = null;
      }}
    >
      <div className="edition-hero-edition">FULL BLACK / EDITION 001</div>
      {campaignSlides.map((slide, position) => (
        <article
          key={slide.key}
          className={`edition-slide edition-slide-${slide.key} ${index === position ? "is-active" : ""}`}
          aria-hidden={index !== position}
          aria-roledescription="diapositiva"
          aria-label={`${position + 1} de 3: ${slide.collection}`}
        >
          <CampaignImage
            slide={slide.heroImage ? { ...slide, ...slide.heroImage } : slide}
            priority={position === 0}
            className="edition-hero-image"
          />
          <div className="edition-hero-shade" />
          <div className="edition-hero-copy">
            <span className="edition-eyebrow">
              {slide.eyebrow || `${String(position + 1).padStart(2, "0")} / EL ESTILO ES TUYO`}
            </span>
            <h1>
              {slide.title.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
            <p>{slide.subtitle}</p>
            <button
              tabIndex={index === position ? 0 : -1}
              className="bf-button edition-cta"
              onClick={() => onCollectionSelect(slide.collection)}
            >
              {slide.button}
              <ArrowRight size={19} aria-hidden="true" />
            </button>
            {slide.showBrands !== false && <BrandStrip />}
          </div>
        </article>
      ))}
      <button
        className="edition-side-arrow edition-side-prev"
        aria-label="Diapositiva anterior"
        onClick={() => go(index - 1)}
      >
        <ArrowLeft size={20} />
      </button>
      <button
        className="edition-side-arrow edition-side-next"
        aria-label="Diapositiva siguiente"
        onClick={() => go(index + 1)}
      >
        <ArrowRight size={20} />
      </button>
      <div className="edition-carousel-footer">
        <a className="edition-discover" href="#categorias">
          DESCUBRE LA COLECCIÓN <span>↓</span>
        </a>
        <div className="edition-carousel-controls">
          <button
            className="edition-bottom-arrow"
            aria-label="Diapositiva anterior"
            onClick={() => go(index - 1)}
          >
            <ArrowLeft size={19} />
          </button>
          <div
            className="edition-indicators"
            role="group"
            aria-label="Seleccionar diapositiva"
          >
            {campaignSlides.map((slide, position) => (
              <button
                key={slide.key}
                aria-label={`Ver diapositiva ${position + 1}: ${slide.collection}`}
                aria-current={index === position ? "true" : undefined}
                onClick={() => go(position)}
              >
                <span>{String(position + 1).padStart(2, "0")}</span>
              </button>
            ))}
          </div>
          <span
            className="edition-slide-count"
            aria-live={playing ? "off" : "polite"}
          >
            {String(index + 1).padStart(2, "0")} / 03
          </span>
          <button
            className="edition-bottom-arrow"
            aria-label="Diapositiva siguiente"
            onClick={() => go(index + 1)}
          >
            <ArrowRight size={19} />
          </button>
          <button
            className="edition-play"
            disabled={reduced}
            aria-label={playing ? "Pausar carrusel" : "Reanudar carrusel"}
            aria-pressed={playing}
            onClick={() => {
              setPlaying(!playing);
              setFocused(false);
            }}
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
        </div>
      </div>
    </section>
  );
};
