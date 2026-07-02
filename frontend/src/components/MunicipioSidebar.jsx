import React from "react";
import { NavLink } from "react-router-dom";

export default function MunicipioSidebar({
    sidebarItems,
}) {
    return (
        <aside className="shrink-0 border-b border-slate-200 bg-[linear-gradient(180deg,#0c3055_0%,#114874_38%,#155e92_100%)] px-5 py-6 text-white lg:fixed lg:left-0 lg:top-[73px] lg:z-20 lg:h-[calc(100vh-73px)] lg:w-[290px] lg:overflow-y-auto lg:border-b-0 lg:border-r">

            <nav className="mt-8 grid gap-2">
                {sidebarItems.map(({ id, label, icon: Icon, to }) => (
                    <NavLink
                        key={id}
                        to={to}
                        end={to === "/municipio/dashboard"}
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                                isActive
                                    ? "bg-sky-50 text-sky-950 ring-1 ring-white/70 shadow-[0_18px_35px_rgba(7,27,48,0.18)]"
                                    : "bg-white/6 text-cyan-50/88 hover:bg-white/12 hover:text-white"
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <Icon
                                    size={18}
                                    className={isActive ? "text-sky-700" : "text-cyan-100/90"}
                                />
                                <span className={isActive ? "text-sky-950" : "text-inherit"}>
                                    {label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

        </aside>
    );
}
