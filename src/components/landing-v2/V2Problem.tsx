'use client';

import { useRef, useEffect, useState } from 'react';

const problems = [
  {
    icon: '📱',
    title: 'Pedidos perdidos por WhatsApp',
    metric: '40%',
    description: 'de las ventas se pierden por no tener un canal de venta online',
  },
  {
    icon: '🕐',
    title: 'Horas respondiendo mensajes',
    metric: '3+ hrs',
    description: 'diarias que podrías invertir en hacer crecer tu negocio',
  },
  {
    icon: '💸',
    title: 'Clientes que abandonan la compra',
    metric: '67%',
    description: 'de los usuarios abandonan si el proceso de compra es complicado',
  },
  {
    icon: '📊',
    title: 'Sin visibilidad de tu negocio',
    metric: '0',
    description: 'presencia online = clientes que nunca te encontrarán',
  },
];

export default function V2Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&family=Jost:wght@300;400;500&display=swap');

        .v2-problem-section {
          background: #0A0A0A;
          padding: 80px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .v2-problem-inner {
          max-width: 1100px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .v2-problem-eyebrow {
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          color: #C9A84C;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-align: center;
        }

        .v2-problem-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem;
          color: #F5F0E8;
          font-weight: 300;
          text-align: center;
          margin-top: 12px;
          line-height: 1.3;
        }

        .v2-problem-subtitle {
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          color: rgba(245, 240, 232, 0.4);
          text-align: center;
          margin-top: 8px;
          max-width: 480px;
          line-height: 1.6;
        }

        .v2-problem-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-top: 48px;
          width: 100%;
        }

        .v2-problem-card {
          background: rgba(245, 240, 232, 0.02);
          border: 1px solid rgba(245, 240, 232, 0.06);
          border-radius: 6px;
          padding: 28px;
          transition: border-color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease;
          cursor: default;
        }

        .v2-problem-card:hover {
          border-color: rgba(201, 168, 76, 0.15);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(201, 168, 76, 0.06);
        }

        .v2-problem-card-icon {
          font-size: 28px;
          line-height: 1;
          margin-bottom: 16px;
        }

        .v2-problem-card-title {
          font-family: 'Jost', sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: #F5F0E8;
          line-height: 1.4;
          margin-bottom: 20px;
        }

        .v2-problem-card-metric {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 600;
          color: #C9A84C;
          line-height: 1;
          margin-bottom: 12px;
        }

        .v2-problem-card-desc {
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          color: rgba(245, 240, 232, 0.45);
          line-height: 1.55;
        }

        /* Fade-in animation */
        .v2-problem-fade {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }

        .v2-problem-fade.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .v2-problem-fade.visible .v2-problem-card:nth-child(1) {
          transition-delay: 0s;
        }

        .v2-problem-fade.visible .v2-problem-card:nth-child(2) {
          transition-delay: 0.1s;
        }

        .v2-problem-fade.visible .v2-problem-card:nth-child(3) {
          transition-delay: 0.2s;
        }

        .v2-problem-fade.visible .v2-problem-card:nth-child(4) {
          transition-delay: 0.3s;
        }

        /* Header stagger */
        .v2-problem-header-fade {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .v2-problem-header-fade.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (min-width: 768px) {
          .v2-problem-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <section
        id="problema"
        ref={sectionRef}
        className="v2-problem-section"
      >
        <div className="v2-problem-inner">
          {/* Header */}
          <div
            className="v2-problem-header-fade"
            style={{
              opacity: visible ? undefined : 0,
              transform: visible ? undefined : 'translateY(18px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
              transitionDelay: '0s',
            }}
          >
            <p className="v2-problem-eyebrow">¿TE SUENA FAMILIAR?</p>
            <h2 className="v2-problem-title">
              Los problemas que te están costando ventas
            </h2>
            <p className="v2-problem-subtitle">
              Cada día sin una tienda online es dinero que dejas sobre la mesa.
            </p>
          </div>

          {/* Cards Grid */}
          <div
            className="v2-problem-grid v2-problem-fade"
            style={{
              opacity: visible ? undefined : 0,
              transform: visible ? undefined : 'translateY(24px)',
              transition: visible
                ? 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s'
                : 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            {problems.map((item, idx) => (
              <div className="v2-problem-card" key={idx}>
                <div className="v2-problem-card-icon">{item.icon}</div>
                <div className="v2-problem-card-title">{item.title}</div>
                <div className="v2-problem-card-metric">{item.metric}</div>
                <div className="v2-problem-card-desc">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
