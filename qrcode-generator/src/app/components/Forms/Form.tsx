import { FormProps } from "@/types/types";
import Input from "./Input";
import Spinner from "../Common/Spinner";

export default function Form({
  config,
  isLoading,
  btnText,
  onSubmit,
  onChange,
}: Readonly<FormProps>) {
  return (
    <form className="space-y-6 max-w-md mx-auto" onSubmit={onSubmit}>
      {config.map((input) => (
        <Input
          key={input.labelId}
          label={input.label}
          labelId={input.labelId}
          type={input.type}
          onChange={onChange}
          value={input.value}
          required={input.required}
          link={input.link}
        />
      ))}

      <div>
        <button
          type="submit"
          className="flex w-full justify-center text-white rounded-md px-4 py-2 text-sm font-semibold shadow-xs focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
          disabled={isLoading}
        >
          {isLoading ? <Spinner sm /> : btnText}
        </button>
      </div>
    </form>
  );
}
