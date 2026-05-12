'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Testimonial {
  metric: string;
  quote: string;
  name: string;
  business: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    metric: '220% más facturación',
    quote:
      'Desde que migramos a JO, nuestras ventas se triplicaron. La mejor inversión que hemos hecho.',
    name: 'Carlos Mendoza',
    business: 'ModaExpress, Bogotá',
    initials: 'CM',
  },
  {
    metric: '500+ pedidos/mes',
    quote:
      'Pasamos de vender por WhatsApp a tener una tienda profesional. Ahora procesamos más de 500 pedidos mensuales.',
    name: 'Ana Rodríguez',
    business: 'Dulce Tentación, Medellín',
    initials: 'AR',
  },
  {
    metric: '3x más clientes',
    quote:
      'La app móvil nos abrió un mundo nuevo. Nuestros clientes pueden comprar desde cualquier lugar.',
    name: 'Miguel Torres',
    business: 'TechStore, Quito',
    initials: 'MT',
  },
  {
    metric: '40% menos tiempo',
    quote:
      'El dashboard nos ahorra horas de trabajo diario. Ahora enfocamos el tiempo en hacer crecer el negocio.',
    name: 'Laura Gómez',
    business: 'NaturalFit, Caracas',
    initials: 'LG',
  },
  {
    metric: '$50K+ en ventas',
    quote:
      'En nuestros primeros 3 meses ya habíamos recuperado la inversión. La tienda se paga sola.',
    name: 'Diego Fernández',
    business: 'CasaDeporte, Lima',
    initials: 'DF',
  },
  {
    metric: '98% satisfacción',
    quote:
      'Nuestros clientes están más felices que nunca. El proceso de compra es fluido y rápido.',
    name: 'Sofía Martínez',
    business: 'BellezaPrime, Santiago',
    initials: 'SM',
  },
];

/* ------------------------------------------------------------------ */
/*  CSS-in-JS                                                          */
/* ------------------------------------------------------------------ */

const cssStyles = `
  /* ---------- Fade-in on scroll ---------- */
  @keyframes v2TestimonialsFadeIn {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .v2-testimonials-section {
    opacity: 0;
  }
  .v2-testimonials-section.visible {
    animation: v2TestimonialsFadeIn 0.8s ease forwards;
  }

  /* ---------- Track ---------- */
  .v2-testimonials-track {
    display: flex;
    align-items: stretch;
    transition: transform 0.4s ease;
    will-change: transform;
  }

  /* ---------- Dots ---------- */
  .v2-testimonial-dot {
    border: none;
    padding: 0;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
  }
  .v2-testimonial-dot:hover {
    transform: scale(1.35);
  }

  /* ---------- Arrows ---------- */
  .v2-testimonials-arrows {
    display: none;
    position: absolute;
    top: 50%;
    left: -4px;
    right: -4px;
    transform: translateY(-50%);
    justify-content: space-between;
    pointer-events: none;
    z-index: 5;
  }
  .v2-testimonials-arrows button {
    pointer-events: auto;
  }

  @media (max-width: 767px) {
    .v2-testimonials-arrows {
      display: flex;
    }
  }

  /* ---------- Arrow button hover ---------- */
  .v2-arrow-btn {
    transition: background-color 0.25s ease, border-color 0.25s ease;
  }
  .v2-arrow-btn:hover {
    background-color: rgba(201,168,76,0.15) !important;
    border-color: rgba(201,168,76,0.3) !important;
  }
`;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function V2Testimonials({ primary = '#C9A84C' }: { primary?: string } = {}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.ceil(testimonials.length / visibleCount);

  /* ---------- Reset page on breakpoint change ---------- */
  useEffect(() => {
    setCurrentPage(0);
  }, [visibleCount]);

  /* ---------- Responsive: detect visible count ---------- */
  useEffect(() => {
    const update = () => setVisibleCount(window.innerWidth >= 768 ? 3 : 1);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  /* ---------- IntersectionObserver for fade-in ---------- */
  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  /* ---------- Auto-play ---------- */
  useEffect(() => {
    if (isPaused) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      return;
    }

    autoPlayRef.current = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 4000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [isPaused, totalPages]);

  /* ---------- Cleanup resume timeout ---------- */
  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  /* ---------- Handlers ---------- */
  const handleTouchStart = useCallback(() => {
    setIsPaused(true);
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
  }, []);

  const handleTouchEnd = useCallback(() => {
    resumeTimeoutRef.current = setTimeout(() => setIsPaused(false), 2000);
  }, []);

  const goNext = useCallback(
    () => setCurrentPage((prev) => (prev + 1) % totalPages),
    [totalPages],
  );
  const goPrev = useCallback(
    () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages),
    [totalPages],
  );
  const goToPage = useCallback((page: number) => setCurrentPage(page), []);

  /* ---------- Render ---------- */
  return (
    <>
      <style>{cssStyles}</style>

      <section
        id="testimonios"
        ref={sectionRef}
        className={`v2-testimonials-section${isVisible ? ' visible' : ''}`}
        style={{
          padding: '80px 24px',
          maxWidth: '1100px',
          margin: '0 auto',
          backgroundColor: '#0A0A0A',
          position: 'relative',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ---- Eyebrow ---- */}
        <p
          style={{
            fontFamily: 'Jost, sans-serif',
            fontSize: '10px',
            color: '#C9A84C',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            textAlign: 'center',
            margin: 0,
          }}
        >
          TESTIMONIOS
        </p>

        {/* ---- Title ---- */}
        <h2
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '2rem',
            color: '#F5F0E8',
            fontWeight: 300,
            textAlign: 'center',
            marginTop: '12px',
            marginBottom: 0,
          }}
        >
          Lo que dicen nuestros clientes
        </h2>

        {/* ---- Carousel ---- */}
        <div
          style={{
            marginTop: '40px',
            position: 'relative',
          }}
        >
          {/* Overflow clip */}
          <div style={{ overflow: 'hidden' }}>
            <div
              className="v2-testimonials-track"
              style={{
                transform: `translateX(-${currentPage * 100}%)`,
              }}
            >
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  style={{
                    flex: `0 0 ${100 / visibleCount}%`,
                    padding: visibleCount === 3 ? '0 8px' : '0',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: 'rgba(245,240,232,.03)',
                      border: '1px solid rgba(245,240,232,.07)',
                      borderRadius: '8px',
                      padding: '28px',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Metric */}
                    <div
                      style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '2rem',
                        color: '#C9A84C',
                        fontWeight: 600,
                        lineHeight: 1.2,
                      }}
                    >
                      {t.metric}
                    </div>

                    {/* Quote */}
                    <p
                      style={{
                        fontFamily: 'Jost, sans-serif',
                        fontSize: '14px',
                        color: 'rgba(245,240,232,.6)',
                        lineHeight: 1.7,
                        fontStyle: 'italic',
                        margin: '12px 0 0 0',
                      }}
                    >
                      &ldquo;{t.quote}&rdquo;
                    </p>

                    {/* Bottom row */}
                    <div
                      style={{
                        marginTop: 'auto',
                        paddingTop: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {/* Avatar + info */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        {/* Avatar circle */}
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(201,168,76,.1)',
                            border: '1px solid rgba(201,168,76,.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'Jost, sans-serif',
                              fontSize: '13px',
                              fontWeight: 500,
                              color: '#C9A84C',
                              lineHeight: 1,
                            }}
                          >
                            {t.initials}
                          </span>
                        </div>

                        {/* Name + Business */}
                        <div>
                          <div
                            style={{
                              fontFamily: 'Jost, sans-serif',
                              fontSize: '13px',
                              color: '#F5F0E8',
                              fontWeight: 500,
                              lineHeight: 1.3,
                            }}
                          >
                            {t.name}
                          </div>
                          <div
                            style={{
                              fontFamily: 'Jost, sans-serif',
                              fontSize: '11px',
                              color: 'rgba(245,240,232,.35)',
                              marginTop: '2px',
                              lineHeight: 1.3,
                            }}
                          >
                            {t.business}
                          </div>
                        </div>
                      </div>

                      {/* Stars */}
                      <div
                        style={{
                          color: '#C9A84C',
                          fontSize: '12px',
                          letterSpacing: '1px',
                          flexShrink: 0,
                          lineHeight: 1,
                        }}
                        aria-label="5 out of 5 stars"
                      >
                        {'★'.repeat(5)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ---- Mobile arrows ---- */}
          <div className="v2-testimonials-arrows">
            <button
              className="v2-arrow-btn"
              onClick={goPrev}
              aria-label="Testimonio anterior"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245,240,232,.08)',
                border: '1px solid rgba(245,240,232,.12)',
                color: '#F5F0E8',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                lineHeight: 1,
                padding: 0,
              }}
            >
              ‹
            </button>
            <button
              className="v2-arrow-btn"
              onClick={goNext}
              aria-label="Siguiente testimonio"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245,240,232,.08)',
                border: '1px solid rgba(245,240,232,.12)',
                color: '#F5F0E8',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                lineHeight: 1,
                padding: 0,
              }}
            >
              ›
            </button>
          </div>
        </div>

        {/* ---- Dots ---- */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '32px',
          }}
          role="tablist"
          aria-label="Navegación de testimonios"
        >
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className="v2-testimonial-dot"
              role="tab"
              aria-selected={i === currentPage}
              aria-label={`Grupo ${i + 1} de ${totalPages}`}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor:
                  i === currentPage ? '#C9A84C' : 'rgba(245,240,232,.15)',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
}
