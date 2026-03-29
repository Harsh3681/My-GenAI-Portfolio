'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  AnimatePresence,
  LayoutGroup,
  easeOut,
  motion,
  type Transition,
  type Variants,
} from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import {
  Info,
  MoreHorizontal,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import ChatBottombar from '@/components/chat/chat-bottombar';
import { portfolioContent, TabType } from '@/data/content';

const MOTION: {
  initial: { opacity: number; y: number };
  animate: { opacity: number; y: number };
  exit: { opacity: number; y: number };
  transition: Transition;
} = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 14 },
  transition: { type: 'tween', duration: 0.28, ease: easeOut },
};

const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : null;
};

const Avatar = dynamic(
  () =>
    Promise.resolve(({ videoRef, isTalking }: any) => {
      const isIOS = () =>
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' &&
          (navigator as any).maxTouchPoints > 1);

      return (
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-transparent">
          <motion.div
            className="relative h-full w-full cursor-pointer overflow-hidden rounded-full"
            onClick={() => (window.location.href = '/')}
            animate={isTalking ? { scale: [1, 1.03, 1] } : { scale: 1 }}
            transition={{ duration: 1.1, repeat: isTalking ? Infinity : 0 }}
          >
            <AnimatePresence>
              {isTalking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 0.35, scale: 1.1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute -inset-2 rounded-full bg-blue-400/20 blur-md"
                />
              )}
            </AnimatePresence>

            {isIOS() ? (
              <img
                src="/landing-memojis.png"
                alt="Avatar"
                draggable={false}
                className="h-full w-full rounded-full bg-transparent object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                muted
                playsInline
                loop
                className="h-full w-full rounded-full bg-transparent object-cover"
              >
                <source src="/final_memojis.webm" type="video/webm" />
                <source src="/final_memojis_ios.mp4" type="video/mp4" />
              </video>
            )}
          </motion.div>
        </div>
      );
    }),
  { ssr: false }
);

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-1">
      <span className="sr-only">Typing</span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-zinc-500/60 dark:bg-zinc-300/50"
          initial={{ opacity: 0.25, y: 0 }}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

/** Chat bubble that works in both themes (no dependency on ChatBubble component styles) */
function Bubble({
  side,
  children,
}: {
  side: 'left' | 'right';
  children: React.ReactNode;
}) {
  if (side === 'right') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] rounded-full bg-blue-500 px-5 py-2 text-sm text-white shadow-md">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[78%] rounded-3xl border border-black/5 bg-white px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-[#141417]">
        {children}
      </div>
    </div>
  );
}

export default function Chat() {
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerH, setHeaderH] = useState(0);

  const stopSpeech = () => {
    if (typeof window === 'undefined') return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // extra safety: clear any current utterance hooks
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
      utteranceRef.current.onstart = null;
      utteranceRef.current = null;
    }

    setIsTalking(false);
  };

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Load voices properly (important fix)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      setHeaderH(el.getBoundingClientRect().height);
    });

    ro.observe(el);
    setHeaderH(el.getBoundingClientRect().height);

    return () => ro.disconnect();
  }, []);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [modalScreenshots, setModalScreenshots] = useState<string[] | null>(
    null
  );

  const searchParams = useSearchParams();
  const bootedRef = useRef(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const menuTimeoutRef = useRef<number | null>(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // ------------------- Question Sheet ( ... ) -------------------
  const [questionSheetOpen, setQuestionSheetOpen] = useState(false);
  const [sheetTab, setSheetTab] = useState<TabType>('me');

  const quickQuestionsByTab: Record<TabType, string[]> = {
    me: [
      'Tell me something about you?',
      'What are your passions?',
      'How did you get started in tech?',
      'Where do you see yourself in 5 years?',
    ],
    projects: [
      'What projects are you most proud of?',
      'Which project best shows your backend skills?',
      'Which project best shows your frontend skills?',
    ],
    skills: [
      'What are your core skills?',
      'What tech stack do you use most often?',
      'What are you strongest at: backend or frontend?',
    ],
    fun: [
      'Mac or PC?',
      'What’s the craziest thing you’ve ever done?',
      'What are you certain about that 90% get wrong?',
    ],
    contact: [
      'How can I reach you?',
      'Where are you located?',
      'What kind of project would make you say ‘yes’ immediately?',
    ],
  };
  // --------------------------------------------------------------

  // ------- for custom answer
  type ViewTab = TabType | 'custom';
  const [customAnswer, setCustomAnswer] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ViewTab>('me');
  const [revealedTab, setRevealedTab] = useState<ViewTab>('me');
  // -------------------------

  // const [activeTab, setActiveTab] = useState<TabType>('me');
  // const [revealedTab, setRevealedTab] = useState<TabType>('me');

  const [currentQuestion, setCurrentQuestion] = useState<string>(
    portfolioContent.me.question
  );
  const [isTyping, setIsTyping] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  // 🔊 Voice Mode
  const [voiceMode, setVoiceMode] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [input, setInput] = useState('');

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const typingDelayMs = 3000;

  // const content = useMemo(() => portfolioContent[revealedTab], [revealedTab]);

  const content = useMemo(
    () => (revealedTab === 'custom' ? null : portfolioContent[revealedTab]),
    [revealedTab]
  );

  const [mounted, setMounted] = useState(false);

  // Add Scroll State Detection
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const updateScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const tolerance = 5;

      const atStart = scrollLeft <= tolerance;
      const atEnd = scrollWidth - (scrollLeft + clientWidth) <= tolerance;

      if (atStart) {
        // Reset to initial state
        setCanScrollRight(true);
        setCanScrollLeft(false);
      } else if (atEnd) {
        // Switch glow to left
        setCanScrollRight(false);
        setCanScrollLeft(true);
      }
      // IMPORTANT: Do nothing in middle
    };

    updateScroll();

    el.addEventListener('scroll', updateScroll);
    window.addEventListener('resize', updateScroll);

    return () => {
      el.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, [revealedTab]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedProject(null);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.play().catch(() => null);

    return () => {
      v.pause();
    };
  }, []);

  //  Speech synthesis for voice mode

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();

    // Fallback logic: pick first English voice if male not found
    const preferredVoice =
      voices.find((v) =>
        v.name.toLowerCase().includes('google uk english male')
      ) ||
      voices.find((v) => v.name.toLowerCase().includes('male')) ||
      voices.find((v) => v.lang.toLowerCase().includes('en')) ||
      voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 0.95;
    utterance.pitch = 0.9;

    utterance.onstart = () => {
      setIsTalking(true);
    };

    utterance.onend = () => {
      setIsTalking(false);
    };

    utterance.onerror = () => {
      setIsTalking(false);
    };

    utteranceRef.current = utterance;

    // Important: small timeout improves reliability
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  // This is for custom answer------------
  const askRag = async (question: string) => {
    stopSpeech();

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    setCurrentQuestion(question);
    setActiveTab('custom');

    // show dots immediately and KEEP until reply arrives
    setCustomAnswer('');
    setRevealedTab('custom');
    setIsTyping(true);
    setIsTalking(true);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });

    let targetText = '';
    let visibleText = '';
    let done = false;

    // typewriter loop
    const revealInterval = window.setInterval(() => {
      if (isTyping) return; // don't type while dots are showing

      if (visibleText.length < targetText.length) {
        visibleText += targetText.charAt(visibleText.length);
        setCustomAnswer(visibleText);
        return;
      }

      if (done && visibleText.length >= targetText.length) {
        window.clearInterval(revealInterval);
        setIsTalking(false);
      }
    }, 25);

    try {
      const res = await fetch('/api/harshal-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: question }],
          stream: false,
        }),
      });

      const data = await res.json().catch(() => ({}));
      targetText = String(data?.reply ?? '').trim();

      if (!targetText) targetText = "Sorry — I couldn't answer that right now.";
    } catch (e) {
      targetText = "Sorry — I couldn't answer that right now.";
    } finally {
      done = true;

      // ✅ hide dots ONLY once we have final text ready
      setIsTyping(false);
      setIsTalking(true);
      videoRef.current?.play().catch(() => null);

      // ✅ speak only after full text is ready
      if (voiceMode && targetText.trim()) {
        setTimeout(() => speak(targetText), 200);
      }

      // safety stop
      setTimeout(() => {
        if (done && visibleText.length >= targetText.length) {
          setIsTalking(false);
        }
      }, 2500);
    }
  };
  // ----------------------------------

  const triggerTab = (tab: TabType) => {
    stopSpeech(); // ✅ stop voice when switching static tabs
    const q = portfolioContent[tab].question;

    setActiveTab(tab);
    setCustomAnswer('');
    setCurrentQuestion(q);

    // clear any previous pending reveal timers
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    setIsTyping(true);
    setIsTalking(true);
    videoRef.current?.play().catch(() => null);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });

    typingTimeoutRef.current = window.setTimeout(() => {
      setRevealedTab(tab);
      setIsTyping(false);

      // Brief natural talking animation for static answers
      setIsTalking(true);

      setTimeout(() => {
        setIsTalking(false);
      }, 1500);
    }, typingDelayMs);
  };

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;

    const tabParam = (searchParams.get('tab') || '').toLowerCase();
    const queryParam = (searchParams.get('query') || '').trim();

    const isValidTab = (v: string): v is TabType =>
      v === 'me' ||
      v === 'projects' ||
      v === 'skills' ||
      v === 'fun' ||
      v === 'contact';

    // 1) If URL has ?tab=projects -> open that
    if (isValidTab(tabParam)) {
      triggerTab(tabParam);
      return;
    }

    // 2) If URL has ?query=... -> try to map to correct tab question
    if (queryParam) {
      const normalized = queryParam.toLowerCase();

      const byQuestion = (Object.keys(portfolioContent) as TabType[]).find(
        (t) => normalized.includes(portfolioContent[t].question.toLowerCase())
      );

      if (byQuestion) {
        triggerTab(byQuestion);
        return;
      }

      // fallback keyword mapping
      if (normalized.includes('project')) return triggerTab('projects');
      if (normalized.includes('skill')) return triggerTab('skills');
      if (normalized.includes('fun')) return triggerTab('fun');
      if (
        normalized.includes('contact') ||
        normalized.includes('email') ||
        normalized.includes('linkedin')
      )
        return triggerTab('contact');
    }

    // 3) Default
    triggerTab('me');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-close menu after 3 seconds when it opens
  useEffect(() => {
    if (showMenu) {
      // Clear any previous timeout
      if (menuTimeoutRef.current) {
        window.clearTimeout(menuTimeoutRef.current);
      }

      // Set new timeout to close menu after 3 seconds
      menuTimeoutRef.current = window.setTimeout(() => {
        setShowMenu(false);
      }, 3000);
    }

    return () => {
      if (menuTimeoutRef.current) {
        window.clearTimeout(menuTimeoutRef.current);
      }
    };
  }, [showMenu]);

  const matchTabFromText = (text: string): TabType | null => {
    const q = text.trim().toLowerCase();

    // only when user clearly wants navigation
    if (q === 'projects' || q.startsWith('show projects')) return 'projects';
    if (q === 'skills' || q.startsWith('show skills')) return 'skills';
    if (q === 'fun' || q.startsWith('show fun')) return 'fun';
    if (q === 'contact' || q.startsWith('show contact')) return 'contact';
    if (q === 'me' || q === 'about' || q.startsWith('about you')) return 'me';

    return null;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const q = input.trim();
    if (!q) return;

    setInput('');

    // If it matches your tabs, show static answer
    const matched = matchTabFromText(q);
    if (matched) {
      triggerTab(matched);
      return;
    }

    // Otherwise fallback to RAG
    askRag(q);
  };

  const scrollCarousel = (dir: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = 320;
    el.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  // Fetch screenshots for modal when a project is expanded
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (expandedProject === null) {
        setModalScreenshots(null);
        return;
      }

      const idx = expandedProject as number;
      const project = portfolioContent.projects.cards[idx];

      // Derive slug: prefer explicit slug, otherwise from image filename
      const slug =
        (project as any).slug ?? project.image?.split('/').pop()?.split('.')[0];

      // Fallback: use project image if no other screenshots available
      const fallbackScreenshots = (
        project.screenshots?.length ? project.screenshots : [project.image]
      ).filter(Boolean);

      if (!slug) {
        setModalScreenshots(fallbackScreenshots);
        return;
      }

      try {
        const res = await fetch(
          `/api/project-screenshots?slug=${encodeURIComponent(slug)}`
        );
        if (!res.ok) throw new Error('no files');
        const data = await res.json();
        if (cancelled) return;

        if (
          data.screenshots &&
          Array.isArray(data.screenshots) &&
          data.screenshots.length
        )
          setModalScreenshots(data.screenshots);
        else setModalScreenshots(fallbackScreenshots);
      } catch (err) {
        setModalScreenshots(fallbackScreenshots);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [expandedProject]);

  const renderAnswer = () => {
    switch (revealedTab) {
      case 'me': {
        const me = portfolioContent.me;
        return (
          <div className="space-y-5">
            <div className="flex items-start gap-6">
              <img
                src={me.profile.image}
                alt={me.profile.name}
                className="h-[220px] w-[220px] rounded-3xl bg-black/5 object-cover object-[50%_15%] shadow-sm dark:bg-white/5"
              />

              <div className="flex-1 space-y-3">
                <div>
                  <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {me.profile.name}
                  </div>
                  <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {me.profile.age} &nbsp; • &nbsp; {me.profile.location}
                  </div>
                </div>

                <div className="text-sm leading-relaxed whitespace-pre-line text-zinc-800 dark:text-zinc-200">
                  {me.intro}
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {me.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-black/5 px-3 py-1 text-xs text-zinc-800 dark:bg-white/10 dark:text-zinc-100"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-sm leading-relaxed whitespace-pre-line text-zinc-800 dark:text-zinc-200">
              {me.bio}
            </div>
          </div>
        );
      }

      case 'projects': {
        const p = portfolioContent.projects;
        return (
          <LayoutGroup>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {p.heading}
                </div>

                <div className="flex gap-2">
                  {/* Left button 👇👇👇 for card */}

                  <motion.button
                    onClick={() => scrollCarousel('left')}
                    aria-label="Previous"
                    className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black/5 shadow-sm dark:bg-white/10"
                    animate={
                      canScrollLeft
                        ? {
                            boxShadow: [
                              '0 0 0px rgba(0,0,0,0)',
                              '0 0 20px rgba(99,102,241,0.8), 0 0 35px rgba(56,189,248,0.6)',
                              '0 0 0px rgba(0,0,0,0)',
                            ],
                            scale: [1, 1.08, 1],
                          }
                        : { boxShadow: '0 0 0px rgba(0,0,0,0)', scale: 1 }
                    }
                    transition={{
                      duration: 1.6,
                      repeat: canScrollLeft ? Infinity : 0,
                    }}
                  >
                    <ChevronLeft className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                  </motion.button>

                  {/* Right button 👇👇👇 for card */}

                  <motion.button
                    onClick={() => scrollCarousel('right')}
                    aria-label="Next"
                    className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black/5 shadow-sm dark:bg-white/10"
                    animate={
                      canScrollRight
                        ? {
                            boxShadow: [
                              '0 0 0px rgba(0,0,0,0)',
                              '0 0 20px rgba(99,102,241,0.8), 0 0 35px rgba(56,189,248,0.6)',
                              '0 0 0px rgba(0,0,0,0)',
                            ],
                            scale: [1, 1.08, 1],
                          }
                        : { boxShadow: '0 0 0px rgba(0,0,0,0)', scale: 1 }
                    }
                    transition={{
                      duration: 1.6,
                      repeat: canScrollRight ? Infinity : 0,
                    }}
                  >
                    <ChevronRight className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                  </motion.button>
                </div>
              </div>

              <div
                ref={carouselRef}
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
                style={{ scrollbarWidth: 'none' as any }}
              >
                {p.cards.map((card, i) => {
                  const theme =
                    card.theme === 'light'
                      ? 'bg-white text-black'
                      : card.theme === 'red'
                        ? 'bg-gradient-to-br from-[#2a0b0b] to-black text-white'
                        : 'bg-black text-white';

                  return (
                    <motion.div
                      key={i}
                      layoutId={`project-${i}`}
                      onClick={() => setExpandedProject(i)}
                      whileHover={{ y: -6, scale: 1.02 }}
                      transition={{ duration: 0.22 }}
                      className={`relative h-[340px] w-[250px] min-w-[250px] cursor-pointer snap-start overflow-hidden rounded-[28px] shadow-xl ${theme}`}
                    >
                      {/* Background image */}
                      <div className="absolute inset-0">
                        {card.image ? (
                          <img
                            src={card.image}
                            alt={card.title}
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <div className="h-full w-full bg-white/10" />
                        )}

                        {/* Dark gradient for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      </div>

                      {/* Top shadow overlay for header text */}
                      <div className="absolute top-0 right-0 left-0 z-10 h-32 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />

                      {/* Subtitle + Bold white title */}
                      <div className="absolute top-6 right-6 left-6 z-20">
                        <div className="text-sm font-medium text-white opacity-80">
                          {card.subtitle}
                        </div>
                        <div className="mt-2 text-3xl leading-tight font-bold text-white">
                          {card.title}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="space-y-4 pt-2">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {p.highlightsTitle}
                </div>

                <ol className="list-decimal space-y-4 pl-6 text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
                  {p.highlights.map((h, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">{h.title}</span> —{' '}
                      {h.text}
                    </li>
                  ))}
                </ol>

                <div className="pt-1 text-sm text-zinc-700 dark:text-zinc-300">
                  {p.closing}
                </div>
              </div>
            </div>
          </LayoutGroup>
        );
      }

      case 'skills': {
        const s = portfolioContent.skills;
        return (
          <div className="space-y-6">
            <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {s.heading}
            </div>

            <div className="space-y-5">
              {s.sections.map((sec) => (
                <div key={sec.title} className="space-y-2">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {sec.title}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {sec.chips.map((chip) => (
                      <motion.span
                        key={chip}
                        whileHover={{ y: -2 }}
                        className="rounded-full bg-black px-3 py-1.5 text-xs text-white shadow-sm dark:bg-white dark:text-black"
                      >
                        {chip}
                      </motion.span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {s.achievementsHeading}
              </div>

              <div className="space-y-3">
                {s.achievements.map((a) => (
                  <div
                    key={a.title}
                    className="rounded-2xl border border-black/5 bg-zinc-50 px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {a.title}
                    </div>
                    <div className="mt-1 text-zinc-700 dark:text-zinc-300">
                      {a.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-1 text-sm text-zinc-700 dark:text-zinc-300">
                {s.closing}
              </div>
            </div>
          </div>
        );
      }

      // case 'fun': {
      //   const f = portfolioContent.fun;
      //   return (
      //     <div className="space-y-2">
      //       <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
      //         {f.heading}
      //       </div>
      //       <div className="text-sm leading-relaxed whitespace-pre-line text-zinc-800 dark:text-zinc-200">
      //         {f.content}
      //       </div>
      //     </div>
      //   );
      // }

      case 'fun': {
        const f = portfolioContent.fun;

        return (
          <div className="space-y-6">
            {/* Heading */}
            <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {f.heading}
            </div>

            {/* Hero title */}
            {f.heroTitle && (
              <div className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
                {f.heroTitle}
              </div>
            )}

            {/* Image */}
            {f.image && (
              <div className="overflow-hidden rounded-3xl border border-black/5 dark:border-white/10">
                <img
                  src={f.image}
                  alt={f.imageAlt || 'Fun image'}
                  className="w-full object-cover"
                />
              </div>
            )}

            {/* Story OR fallback content */}
            <div className="text-sm leading-relaxed whitespace-pre-line text-zinc-800 dark:text-zinc-200">
              {f.story || f.content}
            </div>

            {/* Hobbies */}
            {f.hobbies && f.hobbies.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {f.hobbiesTitle || 'What I enjoy'}
                </div>

                <div className="flex flex-wrap gap-2">
                  {f.hobbies.map((h: string, i: number) => (
                    <span
                      key={i}
                      className="rounded-full bg-black/5 px-3 py-1 text-xs text-zinc-800 dark:bg-white/10 dark:text-zinc-100"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Closing */}
            {f.closing && (
              <div className="text-sm text-zinc-700 dark:text-zinc-300">
                {f.closing}
              </div>
            )}
          </div>
        );
      }

      case 'contact': {
        const c = portfolioContent.contact;
        return (
          <div className="space-y-3">
            <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
              {c.heading}
            </div>

            <div className="text-sm text-zinc-800 dark:text-zinc-200">
              {c.content}
            </div>

            <div className="space-y-2 pt-2 text-sm">
              <div>
                <span className="text-zinc-500 dark:text-zinc-400">Email:</span>{' '}
                <a
                  className="text-blue-600 hover:underline dark:text-blue-400"
                  href={`mailto:${c.email}`}
                >
                  {c.email}
                </a>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {c.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
                  >
                    <span>{(l as any).emoji}</span>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case 'custom': {
        return (
          <div className="text-sm leading-relaxed whitespace-pre-line text-zinc-800 dark:text-zinc-200">
            {customAnswer}
          </div>
        );
      }
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      {/* <div className="relative h-screen overflow-hidden bg-white text-zinc-900 transition-colors dark:bg-[#0b0b0d] dark:text-zinc-100"> */}

      <div className="relative h-[100dvh] overflow-hidden bg-white text-zinc-900 transition-colors dark:bg-[#0b0b0d] dark:text-zinc-100">
        {/* Top-right info icon */}
        <div className="absolute top-6 right-8 z-50">
          <div className="cursor-pointer rounded-2xl px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/10">
            <Info className="h-8 text-zinc-900 dark:text-zinc-100" />
          </div>
        </div>

        {/* Header blur */}
        <div
          ref={headerRef}
          className="fixed top-0 right-0 left-0 z-50 bg-gradient-to-b from-white via-white/90 to-transparent pb-4 backdrop-blur-xl dark:from-[#0b0b0d] dark:via-[#0b0b0d]/90"
        >
          <div className="relative flex justify-center py-6">
            <ClientOnly>
              <Avatar videoRef={videoRef} isTalking={isTalking} />
            </ClientOnly>

            {/* 3 dots menu */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Menu"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-black/5 bg-white/90 p-2 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#151518]/90"
                  >
                    <button
                      className="w-full rounded-xl px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10"
                      onClick={() => setShowQuick((v) => !v)}
                    >
                      {showQuick
                        ? 'Hide quick questions'
                        : 'Show quick questions'}
                    </button>

                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10"
                      onClick={() => setDarkMode((v) => !v)}
                    >
                      {darkMode ? (
                        <Sun className="h-4 w-4" />
                      ) : (
                        <Moon className="h-4 w-4" />
                      )}
                      {darkMode ? 'Light mode' : 'Dark mode'}
                    </button>

                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10"
                      onClick={() => {
                        setVoiceMode((v) => !v);
                        window.speechSynthesis.cancel();
                      }}
                    >
                      {voiceMode ? '🔊 Voice On' : '🔇 Voice Off'}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* User question bubble (RIGHT) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              {...MOTION}
              className="mx-auto max-w-3xl px-4"
            >
              <Bubble side="right">{currentQuestion}</Bubble>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Chat body */}
        <div
          className="container mx-auto flex h-full max-w-3xl flex-col"
          style={{ paddingTop: headerH }}
        >
          <div
            ref={scrollRef}
            className="relative flex-1 overflow-y-auto [mask-image:linear-gradient(to_bottom,black_0%,black_86%,transparent_100%)] px-2 pb-10 [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_86%,transparent_100%)]"
          >
            <div className="space-y-4 px-2 pt-10">
              {/* Typing bubble (LEFT) */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div {...MOTION}>
                    <Bubble side="left">
                      <TypingDots />
                    </Bubble>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Answer bubble (LEFT) */}
              <AnimatePresence mode="wait">
                {!isTyping &&
                  (revealedTab !== 'custom' || customAnswer.length > 0) && (
                    <motion.div key={revealedTab + '-answer'} {...MOTION}>
                      <Bubble side="left">{renderAnswer()}</Bubble>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="sticky bottom-0 px-2 pt-3 pb-4">
            {/* glass blur behind quick questions */}

            <div className="mb-3 flex justify-center">
              <div className="rounded-2xl border border-black/5 bg-white/70 px-4 py-2 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#151518]/70">
                {/* TOGGLE BUTTON - ALWAYS VISIBLE */}
                <div className="mb-2 flex items-center justify-center gap-2 text-xs">
                  <motion.button
                    onClick={() => setShowQuick((v) => !v)}
                    className="relative rounded-full px-3 py-1 text-xs"
                    animate={
                      !showQuick
                        ? {
                            boxShadow: [
                              '0 0 0px rgba(0,0,0,0)',
                              '0 0 20px rgba(99,102,241,0.8), 0 0 35px rgba(56,189,248,0.6)',
                              '0 0 0px rgba(0,0,0,0)',
                            ],
                            scale: [1, 1.05, 1],
                          }
                        : { boxShadow: '0 0 0px rgba(0,0,0,0)', scale: 1 }
                    }
                    transition={{
                      duration: 1.6,
                      repeat: !showQuick ? Infinity : 0,
                    }}
                  >
                    {showQuick
                      ? 'Hide quick questions'
                      : 'Show quick questions'}
                  </motion.button>
                </div>

                {/* QUICK QUESTION BUTTONS - ONLY WHEN TRUE */}
                {showQuick && (
                  <div className="flex gap-3">
                    {(
                      [
                        { key: 'me', label: 'Me', emoji: '👤' },
                        { key: 'projects', label: 'Projects', emoji: '🚀' },
                        { key: 'skills', label: 'Skills', emoji: '⚡' },
                        { key: 'fun', label: 'Fun', emoji: '🎨' },
                        { key: 'contact', label: 'Contact', emoji: '💬' },
                      ] as { key: TabType; label: string; emoji: string }[]
                    ).map((item) => (
                      <motion.button
                        key={item.key}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => triggerTab(item.key)}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${
                          activeTab === item.key
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'bg-white/60 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10'
                        }`}
                      >
                        <span className="text-lg">{item.emoji}</span>
                        {item.label}
                      </motion.button>
                    ))}

                    {/* More questions button */}
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        stopSpeech();
                        const t =
                          activeTab === 'custom'
                            ? 'me'
                            : (activeTab as TabType);
                        setSheetTab(t);
                        setQuestionSheetOpen(true);
                      }}
                      className="flex items-center gap-2 rounded-xl bg-white/60 px-4 py-2 text-sm hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
                      aria-label="More questions"
                    >
                      <span className="text-lg">…</span>
                      More
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#0b0b0d]">
              <ChatBottombar
                input={input}
                handleInputChange={(e) => setInput(e.target.value)}
                handleSubmit={onSubmit}
                isLoading={false}
                stop={() => {}}
                isToolInProgress={false}
                disabled={false}
              />
            </div>
          </div>

          {/* ------------------- QUESTION SHEET ( ... ) ------------------- */}
          {mounted &&
            createPortal(
              <AnimatePresence>
                {questionSheetOpen && (
                  <motion.div
                    className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setQuestionSheetOpen(false)}
                  >
                    <motion.div
                      initial={{ y: 40, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 40, opacity: 0 }}
                      transition={{
                        type: 'spring' as const,
                        stiffness: 140,
                        damping: 18,
                      }}
                      className="absolute right-0 bottom-0 left-0 mx-auto w-full max-w-3xl rounded-t-[28px] bg-white p-4 shadow-2xl dark:bg-[#0f0f12]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between pb-2">
                        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          Quick questions
                        </div>

                        <button
                          onClick={() => setQuestionSheetOpen(false)}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20"
                          aria-label="Close"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="flex gap-2 overflow-x-auto pb-3">
                        {(
                          [
                            'me',
                            'projects',
                            'skills',
                            'fun',
                            'contact',
                          ] as TabType[]
                        ).map((t) => (
                          <button
                            key={t}
                            onClick={() => setSheetTab(t)}
                            className={`rounded-full px-3 py-1 text-xs transition ${
                              sheetTab === t
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2 pb-2">
                        {quickQuestionsByTab[sheetTab].map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              stopSpeech();
                              setQuestionSheetOpen(false);
                              askRag(q);
                            }}
                            className="flex w-full items-center justify-between rounded-2xl bg-black px-4 py-3 text-left text-sm text-white hover:opacity-95"
                          >
                            <span>{q}</span>
                            <span className="opacity-80">›</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body
            )}
          {/* -------------------------------------------------------------- */}

          {/* ------------------------ */}
          {mounted &&
            createPortal(
              <AnimatePresence>
                {expandedProject !== null &&
                  (() => {
                    const idx = expandedProject as number;
                    const project = portfolioContent.projects.cards[idx];

                    return (
                      <motion.div
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-2xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <motion.div
                          layoutId={`project-${idx}`}
                          drag="y"
                          dragConstraints={{ top: 0, bottom: 0 }}
                          onDragEnd={(e, info) => {
                            if (info.offset.y > 120) {
                              setExpandedProject(null);
                            }
                          }}
                          initial={{ borderRadius: 40 }}
                          animate={{ borderRadius: 24 }}
                          exit={{ scale: 0.95, opacity: 0 }}
                          transition={{
                            type: 'spring' as const,
                            stiffness: 120,
                            damping: 20,
                          }}
                          className="relative h-[95vh] w-[96vw] max-w-6xl overflow-hidden rounded-[40px] bg-white shadow-2xl dark:bg-[#0f0f12]"
                        >
                          {/* CLOSE BUTTON */}
                          <button
                            onClick={() => setExpandedProject(null)}
                            className="absolute top-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-black/10 backdrop-blur-md hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20"
                          >
                            ✕
                          </button>

                          {/* FADE MASK TOP */}
                          <div className="pointer-events-none absolute top-0 right-0 left-0 h-20 bg-gradient-to-b from-white to-transparent dark:from-[#0f0f12]" />

                          {/* FADE MASK BOTTOM */}
                          <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-[#0f0f12]" />

                          {/* SCROLLABLE CONTENT */}
                          <div className="h-full space-y-16 overflow-y-auto px-12 py-16">
                            {/* TITLE SECTION */}
                            <motion.div
                              initial={{ opacity: 0, y: 40 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 }}
                            >
                              <h2 className="text-5xl font-bold">
                                {project.title}
                              </h2>

                              <p className="mt-6 max-w-3xl text-lg text-zinc-600 dark:text-zinc-300">
                                {project.description}
                              </p>
                            </motion.div>

                            {/* CLICKABLE PARALLAX IMAGE */}
                            {project.image && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="overflow-hidden rounded-3xl"
                              >
                                {/* Prevent drag conflict */}
                                <div onPointerDown={(e) => e.stopPropagation()}>
                                  <a
                                    href={project.liveUrl ?? undefined}
                                    target={
                                      project.liveUrl ? '_blank' : undefined
                                    }
                                    rel={
                                      project.liveUrl
                                        ? 'noopener noreferrer'
                                        : undefined
                                    }
                                    className="group relative block overflow-hidden rounded-3xl"
                                  >
                                    <motion.img
                                      src={project.image}
                                      alt={project.title + ' cover'}
                                      className="w-full object-cover transition-transform duration-700"
                                      whileHover={{ scale: 1.05 }}
                                    />

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-500 group-hover:bg-black/40">
                                      <div className="translate-y-6 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                                        <div className="rounded-full bg-white/90 px-6 py-3 text-sm font-semibold backdrop-blur-md">
                                          Visit Live Project ↗
                                        </div>
                                      </div>
                                    </div>
                                  </a>
                                </div>
                              </motion.div>
                            )}

                            {/* VERTICAL IMAGE SCROLL (Optional Screenshots Section) */}
                            <div className="space-y-4">
                              <div className="text-sm font-semibold tracking-wider uppercase">
                                Screenshots
                              </div>

                              <div className="flex flex-col gap-6">
                                {(modalScreenshots ?? [project.image])
                                  .filter(Boolean)
                                  .map((src, i) => (
                                    <motion.div
                                      key={i}
                                      whileHover={{ scale: 1.02 }}
                                      className="w-full overflow-hidden rounded-2xl"
                                    >
                                      <img
                                        src={src}
                                        alt={`${project.title} screenshot ${i + 1}`}
                                        className="h-auto w-full object-cover"
                                      />
                                    </motion.div>
                                  ))}
                              </div>
                            </div>

                            {/* TECH STACK */}
                            <div className="space-y-4">
                              <div className="text-sm font-semibold tracking-wider uppercase">
                                Technologies
                              </div>

                              <div className="flex flex-wrap gap-4">
                                {project.stack.map((tech) => (
                                  <span
                                    key={tech}
                                    className="rounded-full bg-black/5 px-5 py-2 text-sm dark:bg-white/10"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })()}
              </AnimatePresence>,
              document.body
            )}
          {/* ------------------------ */}
        </div>
      </div>
    </div>
  );
}
