/**
 * Project: mxfrragrance
 * Created: 2026/05/18 03:04
 * Author: Scarra Luba
 *
 * UPDATE:
 * - Whole filter row is clickable (not just the text).
 * - Row has hover bg + padding, and keyboard support (Enter/Space).
 * - Indicator box is pointer-events-none so clicks always hit the row.
 */

import { CheckCircle2, ChevronUp, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

/* ---------------- Reusable filter row ---------------- */
const FilterRow = ({ checked, label, onClick, shape = "square" }) => {
    const handleKey = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <div
            role="checkbox"
            aria-checked={checked}
            tabIndex={0}
            onClick={onClick}
            onKeyDown={handleKey}
            className={[
                "group flex items-center gap-3 cursor-pointer select-none outline-none",
                "px-2 py-2 -mx-2 rounded-sm transition-colors",
                checked ? "bg-[#D4AF37]/10" : "hover:bg-white/5",
                "focus-visible:ring-1 focus-visible:ring-[#D4AF37]/60",
            ].join(" ")}
        >
            <div
                className={[
                    "w-4 h-4 border transition-all flex items-center justify-center pointer-events-none shrink-0",
                    shape === "round" ? "rounded-full" : "rounded-sm",
                    checked
                        ? "bg-[#D4AF37] border-[#D4AF37]"
                        : "border-white/20 group-hover:border-white/40",
                ].join(" ")}
            >
                {checked && shape === "square" && (
                    <CheckCircle2 size={10} className="text-black" />
                )}
                {checked && shape === "round" && (
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                )}
            </div>

            <span
                className={[
                    "text-xs uppercase tracking-widest pointer-events-none",
                    checked
                        ? "text-white"
                        : "text-white/40 group-hover:text-white/70",
                ].join(" ")}
            >
                {label}
            </span>
        </div>
    );
};

/* ---------------- Section wrapper ---------------- */
const FilterSection = ({ id, title, expandedSection, onToggle, children }) => (
    <div className="border-b border-white/5">
        <button
            onClick={() => onToggle(id)}
            className="w-full flex items-center justify-between group py-4"
        >
            <h4 className="text-white/40 group-hover:text-white transition-colors text-[10px] uppercase tracking-[0.3em] font-bold">
                {title}
            </h4>
            {expandedSection === id ? (
                <ChevronUp size={14} className="text-white/40 group-hover:text-white transition-colors" />
            ) : (
                <ChevronDown size={14} className="text-white/40 group-hover:text-white transition-colors" />
            )}
        </button>

        <AnimatePresence initial={false}>
            {expandedSection === id && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="flex flex-col gap-1 pb-4">{children}</div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

/* ---------------- Sidebar ---------------- */
const FilterSideBar = ({
                           activeFilters,
                           onFilterChange,
                           onReset,
                           availableOptions,
                           filterVisibility,
                       }) => {
    const firstVisible = ["categories", "brands", "types", "sizes", "prices"].find(
        (k) => filterVisibility[k]
    );
    const [expandedSection, setExpandedSection] = useState(firstVisible);

    const toggleSection = (section) => {
        setExpandedSection((cur) => (cur === section ? null : section));
    };

    return (
        <div className="flex flex-col text-left pr-4">
            {/* Categories */}
            {filterVisibility.categories && availableOptions.categories.length > 0 && (
                <FilterSection
                    id="categories"
                    title="Category"
                    expandedSection={expandedSection}
                    onToggle={toggleSection}
                >
                    {availableOptions.categories.map((cat) => (
                        <FilterRow
                            key={cat}
                            label={cat}
                            checked={activeFilters.categories.includes(cat)}
                            onClick={() => onFilterChange("categories", cat)}
                        />
                    ))}
                </FilterSection>
            )}

            {/* Brands */}
            {filterVisibility.brands && availableOptions.brands.length > 0 && (
                <FilterSection
                    id="brands"
                    title="Brand"
                    expandedSection={expandedSection}
                    onToggle={toggleSection}
                >
                    {availableOptions.brands.map((brand) => (
                        <FilterRow
                            key={brand}
                            label={brand}
                            checked={activeFilters.brands.includes(brand)}
                            onClick={() => onFilterChange("brands", brand)}
                        />
                    ))}
                </FilterSection>
            )}

            {/* Types */}
            {filterVisibility.types && availableOptions.types.length > 0 && (
                <FilterSection
                    id="types"
                    title="Type / Protocol"
                    expandedSection={expandedSection}
                    onToggle={toggleSection}
                >
                    {availableOptions.types.map((type) => (
                        <FilterRow
                            key={type}
                            label={type}
                            checked={activeFilters.types.includes(type)}
                            onClick={() => onFilterChange("types", type)}
                        />
                    ))}
                </FilterSection>
            )}

            {/* Sizes */}
            {filterVisibility.sizes && availableOptions.sizes.length > 0 && (
                <FilterSection
                    id="sizes"
                    title="Size (ml)"
                    expandedSection={expandedSection}
                    onToggle={toggleSection}
                >
                    {availableOptions.sizes.map((size) => (
                        <FilterRow
                            key={size}
                            label={`${size} ml`}
                            checked={activeFilters.sizes.includes(size)}
                            onClick={() => onFilterChange("sizes", size)}
                        />
                    ))}
                </FilterSection>
            )}

            {/* Prices */}
            {filterVisibility.prices && availableOptions.priceRanges.length > 0 && (
                <FilterSection
                    id="prices"
                    title="Valuation"
                    expandedSection={expandedSection}
                    onToggle={toggleSection}
                >
                    {availableOptions.priceRanges.map((range) => (
                        <FilterRow
                            key={range.label}
                            label={range.label}
                            shape="round"
                            checked={activeFilters.priceRange === range.label}
                            onClick={() => onFilterChange("priceRange", range.label)}
                        />
                    ))}
                </FilterSection>
            )}

            <div className="pt-6">
                <button
                    onClick={onReset}
                    className="w-full py-3 text-[9px] uppercase tracking-widest border border-white/10 text-white/40 hover:text-white hover:border-[#D4AF37] transition-all rounded-sm font-bold"
                >
                    Reset Filters
                </button>
            </div>
        </div>
    );
};

export default FilterSideBar;