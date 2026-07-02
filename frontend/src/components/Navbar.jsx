import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, LogOut, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Navbar({
    homeHref = "/",
    userLabel = "Usuario",
    onLogout,
    navItems = [],
    fixed = false,
}) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        setIsMenuOpen(false);
        onLogout?.();
    };

    return (
        <header
            className={`top-0 z-30 border-b border-slate-200/80 bg-white/92 backdrop-blur ${
                fixed ? "fixed left-0 right-0" : "sticky"
            }`}
        >
            <div className="flex flex-wrap items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <Link
                    to={homeHref}
                    className="inline-flex shrink-0 items-center rounded-2xl px-1 py-1 transition hover:opacity-90"
                >
                    <img
                        src="/LogoMunicity.png"
                        alt="Logo de Municity"
                        className="h-10 w-auto object-contain"
                    />
                </Link>

                <div>

                {navItems.length > 0 ? (
                    <nav className="order-3 flex w-full flex-wrap items-center justify-center gap-1 md:order-2 md:flex-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    
                                    className={({ isActive }) =>
                                        `inline-flex h-12 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition ${
                                            isActive
                                                ? "border-sky-600 text-sky-700 hover:text-sky-800  bg-sky-50"
                                                : "border-transparent text-slate-500 hover:text-slate-800 "
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            {Icon ? (
                                                <Icon
                                                    size={18}
                                                    className={
                                                        isActive ? "text-sky-600" : "text-slate-400"
                                                    }
                                                />
                                            ) : null}
                                            <span>{item.label}</span>
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>
                ) : null}
</div>
                <div className="relative ml-auto">
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((current) => !current)}
                        className="inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                            <UserRound size={18} />
                        </span>
                        <span className="hidden text-left sm:block">
                            <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">
                                Usuario
                            </span>
                            <span className="block max-w-[180px] truncate text-sm font-semibold text-slate-700">
                                {userLabel}
                            </span>
                        </span>
                        <ChevronDown size={16} className={`transition ${isMenuOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isMenuOpen ? (
                        <div className="absolute right-0 top-[calc(100%+0.6rem)] w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,62,106,0.16)]">
                            <div className="rounded-xl px-3 py-2 text-sm text-slate-500">
                                Sesión iniciada como
                                <p className="mt-1 font-semibold text-slate-800">{userLabel}</p>
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleLogout}
                                className="mt-1 h-11 w-full justify-start rounded-xl px-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                                <LogOut size={16} />
                                Cerrar sesión
                            </Button>
                        </div>
                    ) : null}
                </div>
            </div>
        </header>
    );
}
