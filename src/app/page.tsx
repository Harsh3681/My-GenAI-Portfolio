'use client';

import FluidCursor from '@/components/FluidCursor';
import { Button } from '@/components/ui/button';
import { motion, type Variants } from 'framer-motion';
import {
  ArrowRight,
  BriefcaseBusiness,
  Laugh,
  Layers,
  PartyPopper,
  UserRoundSearch,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/* ---------- quick-question data ---------- */
const questions = {
  Me: 'Who is Harshal Sonawane?',
  Projects: "Show me Harshal's projects.",
  Skills: "List Harshal's technical skills.",
  Fun: 'Tell me something fun about Harshal.',
  Contact: 'How can I contact Harshal?',
} as const;

const questionConfig = [
  { key: 'Me', color: '#329696', icon: Laugh },
  { key: 'Projects', color: '#3E9858', icon: BriefcaseBusiness },
  { key: 'Skills', color: '#856ED9', icon: Layers },
  { key: 'Fun', color: '#B95F9D', icon: PartyPopper },
  { key: 'Contact', color: '#C19433', icon: UserRoundSearch },
] as const;

export default function Home() {
  const [input, setInput] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const goToChat = (query: string, tab?: string) => {
    if (tab)
      return router.push(`/chat?tab=${tab}&query=${encodeURIComponent(query)}`);
    return router.push(`/chat?query=${encodeURIComponent(query)}`);
  };

  const topElementVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'tween' as const,
      duration: 0.6,
      ease: 'easeOut',
    },
  },
} satisfies Variants;

const bottomElementVariants: Variants = {
  hidden: { opacity: 0, y: 80 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'tween' as const,
      duration: 0.8,
      delay: 0.2,
    },
  },
};

  useEffect(() => {
    const img = new window.Image();
    img.src = '/landing-memojis.png';

    const linkWebm = document.createElement('link');
    linkWebm.rel = 'preload';
    linkWebm.as = 'video';
    linkWebm.href = '/final_memojis.webm';
    document.head.appendChild(linkWebm);

    const linkMp4 = document.createElement('link');
    linkMp4.rel = 'prefetch';
    linkMp4.as = 'video';
    linkMp4.href = '/final_memojis_ios.mp4';
    document.head.appendChild(linkMp4);
  }, []);

  return (
    <div className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 pb-8 md:pb-16">
      {/* big blurred footer word */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden">
        <div
          className="hidden bg-linear-to-b from-neutral-500/10 to-neutral-500/0 bg-clip-text text-[6rem] leading-none font-black text-transparent select-none sm:block lg:text-[10rem]"
          style={{ marginBottom: '-1.5rem' }}
        >
          Harshal
        </div>
      </div>

      {/* header */}
      <motion.div
        className="z-1 mt-8 mb-6 flex flex-col items-center text-center md:mt-4 md:mb-8"
        variants={topElementVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="mt-1 text-sm font-semibold text-neutral-600 md:text-base">
          Hey, I'm <span className="font-bold">Harshal</span> 👋
        </h2>
        <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
          AI Portfolio
        </h1>

        <p className="mt-2 max-w-xl text-sm text-neutral-600">
          Full-stack developer focused on performance, clean architecture, and
          AI-augmented experiences. Ask my AI avatar anything about my work,
          projects, and skills.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/Harshal-Sonawane-Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-800 shadow-sm hover:bg-neutral-100"
          >
            Download my CV
          </Link>

          <Link
            href="https://github.com/Harsh3681"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
          >
            View GitHub
          </Link>
        </div>
      </motion.div>

      {/* centre memoji */}
      <div className="relative z-10 flex h-44 w-44 items-center justify-center sm:h-60 sm:w-60">
        <Image
          src="/landing-memojis.png"
          alt="Hero memoji"
          fill
          priority
          className="object-contain"
          style={{
            transform: 'translateY(4%) scale(1.05)',
            transformOrigin: 'center',
          }}
        />
      </div>

      {/* input + quick buttons */}
      <motion.div
        variants={bottomElementVariants}
        initial="hidden"
        animate="visible"
        className="z-10 mt-2 flex w-full flex-col items-center justify-center md:px-0"
      >
        {/* INPUT BAR */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) goToChat(input.trim());
          }}
          className="relative w-full max-w-lg"
        >
          <div className="mx-auto flex items-center rounded-full border border-neutral-200 bg-white/30 py-2.5 pr-2 pl-6 backdrop-blur-lg transition-all hover:border-neutral-300">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about Harshal…"
              className="w-full border-none bg-transparent text-sm text-neutral-800 placeholder:text-neutral-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Submit question"
              className="flex items-center justify-center rounded-full bg-[#0171E3] p-2.5 text-white transition-colors hover:bg-blue-600 disabled:opacity-70"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* quick-question grid */}
        <div className="mt-3 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {questionConfig.map(({ key, color, icon: Icon }) => (
            <Button
              key={key}
              onClick={() => goToChat(questions[key], key.toLowerCase())}
              variant="outline"
              className="border-border hover:bg-border/30 aspect-square w-full cursor-pointer rounded-2xl border bg-white/30 py-4 shadow-none backdrop-blur-lg active:scale-95 md:p-6"
            >
              <div className="flex h-full flex-col items-center justify-center gap-1 text-gray-700">
                <Icon size={22} strokeWidth={2} color={color} />
                <span className="text-xs font-medium sm:text-sm">{key}</span>
              </div>
            </Button>
          ))}
        </div>
      </motion.div>

      <FluidCursor />
    </div>
  );
}
