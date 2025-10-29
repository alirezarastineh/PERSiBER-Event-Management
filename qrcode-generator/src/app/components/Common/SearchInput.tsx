import { motion } from "framer-motion";
import { SearchInputProps } from "@/types/common";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  label = "Search",
  id = "search-input",
  className = "",
}: Readonly<SearchInputProps>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-2">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <motion.input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-accent-amber focus:border-accent-amber text-white transition-all duration-300"
          whileFocus={{ scale: 1.01 }}
        />
      </div>
    </div>
  );
}
