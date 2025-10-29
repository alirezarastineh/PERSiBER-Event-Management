import Link from "next/link";
import { InputProps } from "@/types/common";

export default function Input({
  label,
  labelId,
  type,
  value,
  onChange,
  required = false,
  link,
}: Readonly<InputProps>) {
  return (
    <div className="w-full mb-4">
      <div className="flex justify-between items-center">
        <label
          htmlFor={labelId}
          className="block text-sm font-medium text-white"
        >
          {label}
        </label>
        {link && (
          <div className="text-sm">
            <Link
              href={link.linkUrl}
              className="font-semibold text-blue-400 hover:text-blue-800 transition duration-300"
            >
              {link.linkText}
            </Link>
          </div>
        )}
      </div>
      <div className="mt-2">
        <input
          id={labelId}
          name={labelId}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          className="block w-full text-white bg-gray-700 rounded-md border border-gray-600 py-2 px-3 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition duration-300"
        />
      </div>
    </div>
  );
}
