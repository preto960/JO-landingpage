'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const faqItems = [
  {
    question: '¿Cuánto cuesta crear una tienda online con JO?',
    answer:
      'Nuestros planes empiezan desde $299 USD, pago único. Sin suscripciones mensuales ni costos ocultos. El plan incluye tienda online, panel de administración, certificado SSL y soporte.',
  },
  {
    question: '¿Necesito ser técnico o tener conocimientos de programación?',
    answer:
      'No, para nada. Nosotros nos encargamos de todo el desarrollo técnico. Tú solo nos cuentas qué vendes y cómo es tu negocio, y nosotros creamos todo por ti.',
  },
  {
    question: '¿En cuánto tiempo puedo tener mi tienda lista?',
    answer:
      'Normalmente entre 10 y 14 días. Depende de la complejidad de tu catálogo y las integraciones que necesites. Verás el diseño antes de que vaya en vivo.',
  },
  {
    question: '¿Qué pasa si no me gusta el resultado?',
    answer:
      'Ofrecemos 14 días de garantía de satisfacción. Si no estás contento con el resultado, te devolvemos tu dinero. Sin preguntas.',
  },
  {
    question: '¿Puedo vender en redes sociales desde la tienda?',
    answer:
      'Sí, puedes integrar tu tienda con Instagram Shopping, Facebook Marketplace y WhatsApp Business. Los clientes pueden comprar directamente desde redes sociales.',
  },
  {
    question: '¿Qué pasarelas de pago aceptan?',
    answer:
      'Integramos MercadoPago, Wompi, PayU, Stripe y más. Puedes aceptar tarjetas de crédito, débito, transferencias y pagos en efectivo según el país.',
  },
  {
    question: '¿Ofrecen soporte después del lanzamiento?',
    answer:
      'Sí, todos nuestros planes incluyen soporte técnico. El plan Profesional incluye soporte prioritario 24/7. Estamos para ayudarte a crecer.',
  },
  {
    question: '¿Puedo migrar mi tienda desde otra plataforma?',
    answer:
      'Sí, ayudamos con la migración desde Shopify, WooCommerce, Tienda Nube y otras plataformas. Migramos tus productos, clientes y historial de pedidos.',
  },
];

export default function V2FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
    };
  }, []);

  const toggleItem = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section
      id="faq"
      ref={sectionRef}
      style={{
        padding: '80px 24px',
        backgroundColor: '#0A0A0A',
        display: 'flex',
        justifyContent: 'center',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <div style={{ maxWidth: 700, width: '100%' }}>
        {/* Eyebrow */}
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
          PREGUNTAS FRECUENTES
        </p>

        {/* Title */}
        <h2
          style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '2rem',
            fontWeight: 300,
            color: '#F5F0E8',
            textAlign: 'center',
            marginTop: 12,
            marginBottom: 0,
          }}
        >
          ¿Tienes dudas? Aquí las resolvemos
        </h2>

        {/* Accordion */}
        <div style={{ marginTop: 40 }}>
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                style={{
                  borderBottom: '1px solid rgba(245, 240, 232, 0.06)',
                }}
              >
                {/* Question button */}
                <button
                  onClick={() => toggleItem(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '18px 0',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Jost, sans-serif',
                    fontSize: 14,
                    fontWeight: 400,
                    color: '#F5F0E8',
                    textAlign: 'left',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                  }}
                >
                  <span>{item.question}</span>
                  <span
                    style={{
                      fontSize: 18,
                      color: 'rgba(245, 240, 232, 0.3)',
                      flexShrink: 0,
                      marginLeft: 16,
                      lineHeight: 1,
                      userSelect: 'none',
                      transition: 'color 0.3s ease',
                    }}
                    aria-hidden="true"
                  >
                    {isOpen ? '−' : '+'}
                  </span>
                </button>

                {/* Answer panel */}
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  style={{
                    maxHeight: isOpen ? 200 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'Jost, sans-serif',
                      fontSize: 13,
                      color: 'rgba(245, 240, 232, 0.4)',
                      lineHeight: 1.7,
                      margin: 0,
                      paddingBottom: 18,
                    }}
                  >
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
