"use client";

import type { CardValue } from "@/lib/types";

type Props = {
  value: CardValue;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export default function Card({ value, selected, disabled, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-14 w-10 shrink-0 items-center justify-center rounded-lg border-2 text-sm font-semibold transition sm:h-20 sm:w-14 sm:text-lg md:h-24 md:w-16 md:text-xl ${
        selected
          ? "border-indigo-600 bg-indigo-600 text-white shadow-md -translate-y-1"
          : "border-zinc-200 bg-white text-zinc-800 hover:-translate-y-1 hover:border-indigo-400 hover:shadow dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      } ${disabled ? "cursor-not-allowed opacity-50 hover:translate-y-0 hover:border-zinc-200 dark:hover:border-zinc-700" : "cursor-pointer"}`}
    >
      {value}
    </button>
  );
}
