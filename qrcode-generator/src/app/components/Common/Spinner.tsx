import cn from "classnames";
import { ImSpinner3 } from "react-icons/im";

interface SpinnerProps {
  readonly sm?: boolean;
  readonly md?: boolean;
  readonly lg?: boolean;
  readonly xl?: boolean;
}

export default function Spinner({ sm, md, lg, xl }: SpinnerProps) {
  const className = cn("animate-spin text-white-300 fill-white-300 mr-2", {
    "w-4 h-4": sm,
    "w-6 h-6": md,
    "w-8 h-8": lg,
    "w-10 h-10": xl,
  });

  return (
    <output>
      <ImSpinner3 className={className} />
      <span className="sr-only">Lädt...</span>
    </output>
  );
}
