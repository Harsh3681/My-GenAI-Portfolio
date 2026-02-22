'use client';

import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import React from 'react';

interface Props {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop: () => void;
  isToolInProgress: boolean;
  disabled?: boolean;
}

export default function ChatBottombar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  isToolInProgress,
  disabled = false,
}: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
        className="relative w-full md:px-4"
      >
        <div className="mx-auto flex items-center rounded-full border border-neutral-300 bg-neutral-100 py-2 pr-2 pl-6">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask something…"
            className="w-full bg-transparent text-black placeholder:text-gray-500 focus:outline-none"
            disabled={isLoading || disabled}
          />

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-full bg-[#0171E3] p-2 text-white transition hover:bg-blue-600 disabled:opacity-60"
          >
            <ArrowUp className="h-6 w-6" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
