import React from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    ClipboardList,
    MapPinned,
    Vote,
} from "lucide-react";

const primaryFeatures = [
    {
        image: "/apoyo.png",
        title: "Apoya Propuestas Barriales",
        description:
            "Respalda iniciativas de tu barrio y ayudá a que las prioridades vecinales ganen visibilidad real.",
    },
    {
        image: "/mapa.png",
        title: "Sigue el Estado de Trámites",
        description:
            "Consultá avances, revisiones y resoluciones sin perderte entre llamadas, papeles o demoras.",
    },
    {
        image: "/comunicacion+.png",
        title: "Comunica Observaciones",
        description:
            "Reportá problemas cotidianos como iluminación, limpieza o baches de forma simple y ordenada.",
    },
];

const quickLinks = [
    { label: "Inicio", href: "#inicio" },
    { label: "Características", href: "#caracteristicas" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Preguntas", href: "#preguntas" },
];

const faqs = [
    {
        question: "¿Quién puede usar Municity?",
        answer: "Vecinos, centros vecinales y ciudadanos que quieran participar activamente en su comunidad.",
    },
    {
        question: "¿Necesito ir presencialmente para apoyar propuestas?",
        answer: "No. La idea de la plataforma es centralizar esas acciones para que puedas hacerlas online.",
    },
    {
        question: "¿Las observaciones tienen seguimiento?",
        answer: "Sí, la plataforma está pensada para que cada observación tenga estado, historial y trazabilidad.",
    },
];

export default function Home() {
    return (
        <main className="home-page">
            <div className="home-orb home-orb-left" />
            <div className="home-orb home-orb-right" />
            <div className="home-spark home-spark-a" />
            <div className="home-spark home-spark-b" />

            <header className="public-header" id="inicio">
                <div className="public-header__inner">
                    <Link className="brand" to="/">
                        <img
                            className="brand__logo"
                            src="/LogoMunicity.png"
                            alt="Logo de Municity"
                        />
                    </Link>

                    <nav className="public-nav" aria-label="Navegación principal">
                        {quickLinks.map((item) => (
                            <a key={item.label} href={item.href}>
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <Link className="public-header__cta" to="/login">
                        Iniciar sesión
                    </Link>
                </div>
            </header>

            <section className="hero-band">
                <div className="hero-section">
                    <div className="hero-copy">
                        <h1>Conecta. Actúa. Mejora. Construye tu comunidad con Municity.</h1>
                        <p>
                            Un espacio pensado para que vecinos, barrios y centros vecinales
                            coordinen propuestas, seguimiento y observaciones en un solo lugar.
                        </p>

                        <div className="hero-actions">
                            <Link className="cta-primary" to="/register">
                                Registrate ahora
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>

                    <div className="hero-visual" aria-hidden="true">
                        <div className="hero-visual__frame">
                            <img
                                className="hero-visual__image"
                                src="/fondo.png"
                                alt=""
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="feature-grid-section" id="caracteristicas">
                <div className="feature-grid">
                    {primaryFeatures.map(({ image, title, description }) => (
                        <article key={title} className="feature-card">
                            <div
                                className="feature-card__icon"
                                style={{
                                    width: "4.8rem",
                                    height: "4.8rem",
                                    borderRadius: "24px",
                                }}
                            >
                                <img
                                    src={image}
                                    alt={title}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "contain",
                                        padding: "0.9rem",
                                        background: "#ffffff",
                                        borderRadius: "18px",
                                    }}
                                />
                            </div>
                            <h2>{title}</h2>
                            <p>{description}</p>
                        </article>
                    ))}
                </div>
            </section>

           

            <footer className="public-footer">
                <div className="public-footer__links">
                    <span>Quick links</span>
                    <a href="#caracteristicas">Características</a>
                    <a href="#preguntas">Preguntas</a>
                </div>

                <p>© Copyright Municity</p>
            </footer>
        </main>
    );
}
