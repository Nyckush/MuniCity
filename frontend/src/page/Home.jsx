import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    ClipboardList,
    LogIn,
    Menu,
    MapPinned,
    UserPlus,
    Vote,
    X,
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

const MOBILE_MENU_CLOSE_DURATION_MS = 240;

export default function Home() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);

    useEffect(() => {
        if (!isMobileMenuVisible) {
            const scrollY = Math.abs(parseInt(document.body.style.top || "0", 10)) || 0;

            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";

            if (scrollY > 0) {
                window.scrollTo(0, scrollY);
            }
        } else {
            const scrollY = window.scrollY;

            document.body.style.overflow = "hidden";
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.left = "0";
            document.body.style.right = "0";
            document.body.style.width = "100%";
        }

        return () => {
            document.body.style.overflow = "";
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";
        };
    }, [isMobileMenuVisible]);

    useEffect(() => {
        let closeTimer;

        if (isMobileMenuOpen) {
            setIsMobileMenuVisible(true);
        } else if (isMobileMenuVisible) {
            closeTimer = window.setTimeout(() => {
                setIsMobileMenuVisible(false);
            }, MOBILE_MENU_CLOSE_DURATION_MS);
        }

        return () => {
            window.clearTimeout(closeTimer);
        };
    }, [isMobileMenuOpen, isMobileMenuVisible]);

    const openMobileMenu = () => {
        setIsMobileMenuVisible(true);
        setIsMobileMenuOpen(true);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <main className="home-page">
            <div className="home-orb home-orb-left" />
            <div className="home-orb home-orb-right" />
            <div className="home-spark home-spark-a" />
            <div className="home-spark home-spark-b" />

            <header className="public-header" id="inicio">
                <div className="public-header__inner">
                    <div className="public-header__mobile-row">
                        <button
                            type="button"
                            onClick={openMobileMenu}
                            className="public-header__menu-button"
                            aria-label="Abrir menú"
                        >
                            <Menu size={18} />
                        </button>

                        <Link className="brand" to="/">
                            <img
                                className="brand__logo"
                                src="/LogoMunicity.png"
                                alt="Logo de Municity"
                            />
                        </Link>
                    </div>

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

            {isMobileMenuVisible ? (
                <div className={`public-mobile-menu${isMobileMenuOpen ? " is-open" : " is-closing"}`}>
                    <button
                        type="button"
                        className="public-mobile-menu__overlay"
                        onClick={closeMobileMenu}
                        aria-label="Cerrar menú"
                    />

                    <aside className="public-mobile-menu__panel">
                        <div className="public-mobile-menu__header">
                            <p>Menu</p>
                            <button
                                type="button"
                                onClick={closeMobileMenu}
                                className="public-mobile-menu__close"
                                aria-label="Cerrar menú"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <nav className="public-mobile-menu__nav" aria-label="Menú principal">
                            {quickLinks.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={closeMobileMenu}
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>

                        <div className="public-mobile-menu__actions">
                            <Link to="/login" onClick={closeMobileMenu}>
                                Iniciar sesión
                            </Link>
                            <Link to="/register" onClick={closeMobileMenu}>
                                Registrate
                            </Link>
                        </div>
                    </aside>
                </div>
            ) : null}

            <section className="hero-band">
                <div className="hero-section">
                    <div className="hero-copy">
                        <h1>Conecta. Actúa. Mejora. Construye tu comunidad con Municity.</h1>
                        <p>
                            Un espacio pensado para que vecinos, barrios y centros vecinales
                            coordinen propuestas, seguimiento y observaciones en un solo lugar.
                        </p>

                        <div className="hero-actions hero-actions--desktop">
                            <Link className="cta-primary" to="/register">
                                <UserPlus size={18} />
                                Registrate ahora
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>

                    <div className="hero-visual" aria-hidden="true">
                        <div className="hero-visual__frame">
                            <img
                                className="hero-visual__image"
                                src="/fondo.webp"
                                alt=""
                            />
                        </div>
                    </div>

                    <div className="hero-actions hero-actions--mobile">
                        <Link className="cta-primary" to="/register">
                            <UserPlus size={18} />
                            Registrate ahora
                            <ArrowRight size={18} />
                        </Link>
                        <Link className="cta-secondary" to="/login">
                            <LogIn size={18} />
                            Iniciar sesión
                        </Link>
                    </div>
                </div>
            </section>

            <section className="feature-grid-section" id="caracteristicas">
                <h2 className="feature-grid-section__mobile-title">Participá con tu comunidad</h2>
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

                <p>© iunex /Municity</p>
            </footer>
        </main>
    );
}
