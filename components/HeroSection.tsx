'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Scenario {
  name: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  monthlyCostUsd: number;
}

const SCENARIOS: Scenario[] = [
  {
    name: 'Chatbot Workload',
    model: 'GPT-4o',
    inputTokens: 1000000,
    outputTokens: 200000,
    monthlyCostUsd: 135.0,
  },
  {
    name: 'RAG Knowledge Agent',
    model: 'Claude 3.7 Sonnet',
    inputTokens: 5000000,
    outputTokens: 500000,
    monthlyCostUsd: 225.0,
  },
  {
    name: 'Fast Production Engine',
    model: 'Gemini 3.7 Flash',
    inputTokens: 10000000,
    outputTokens: 1000000,
    monthlyCostUsd: 45.0,
  },
  {
    name: 'Batch Data Extraction',
    model: 'DeepSeek R1',
    inputTokens: 20000000,
    outputTokens: 2000000,
    monthlyCostUsd: 110.0,
  },
];

export const HeroSection: React.FC = () => {
  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      timeoutRef.current = setTimeout(() => {
        setActiveScenarioIndex((prev) => (prev + 1) % SCENARIOS.length);
        setIsAnimating(false);
      }, 200);
    }, 4500);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPaused]);

  const scenario = SCENARIOS[activeScenarioIndex];

  return (
    <section className="relative overflow-hidden py-10 md:py-16">
      {/* Subtle Background Glows */}
      <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-72 w-full max-w-4xl rounded-full radial-glow-blue opacity-70 blur-3xl"></div>
      <div className="pointer-events-none absolute right-10 top-0 h-56 w-56 rounded-full radial-glow-violet opacity-50 blur-2xl"></div>

      <div className="relative mx-auto max-w-4xl text-center">
        {/* 1. Badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-950/30 px-3.5 py-1 text-xs font-semibold text-blue-400 shadow-sm backdrop-blur-md"
          style={{
            animation: 'fadeInUp 500ms cubic-bezier(0.16, 1, 0.3, 1) 0ms forwards',
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
          AI COST ENGINE
        </div>

        {/* 2. Headline */}
        <h1
          className="mt-4 text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl lg:text-6xl"
          style={{
            animation: 'fadeInUp 550ms cubic-bezier(0.16, 1, 0.3, 1) 80ms forwards',
          }}
        >
          Calculate Your LLM Costs{' '}
          <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
            Before They Surprise You
          </span>
        </h1>

        {/* 3. Subtitle */}
        <p
          className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-400"
          style={{
            animation: 'fadeInUp 600ms cubic-bezier(0.16, 1, 0.3, 1) 160ms forwards',
          }}
        >
          Compare models, estimate API spend, and understand your AI budget instantly with 100% verified provider pricing.
        </p>

        {/* 4. Action CTAs */}
        <div
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
          style={{
            animation: 'fadeInUp 650ms cubic-bezier(0.16, 1, 0.3, 1) 240ms forwards',
          }}
        >
          <a
            href="#calculator-section"
            className="rounded-xl border border-blue-500/40 bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-500 hover:shadow-blue-500/30 active:scale-[0.98]"
          >
            Open Calculator
          </a>
          <Link
            href="/llm-price-comparison"
            className="rounded-xl border border-white/10 bg-slate-900/80 px-6 py-2.5 text-xs font-bold text-slate-200 transition-all duration-200 hover:border-white/20 hover:bg-slate-800 hover:text-white active:scale-[0.98]"
          >
            Compare Models Side-by-Side
          </Link>
        </div>

        {/* 5. Live Interactive Preview Card */}
        <div
          className="mt-10 mx-auto max-w-lg"
          style={{
            animation: 'fadeInUp 700ms cubic-bezier(0.16, 1, 0.3, 1) 320ms forwards',
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <div className="rounded-2xl border border-white/10 bg-[#0B1020]/90 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/20">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Live Preview: {scenario.name}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {isPaused ? 'Paused' : 'Cycling'}
              </span>
            </div>

            <div
              className={`mt-4 grid grid-cols-3 gap-3 transition-all duration-200 ${
                isAnimating ? 'opacity-30 translate-y-2' : 'opacity-100 translate-y-0'
              }`}
            >
              <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3 text-left">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Model</div>
                <div className="mt-1 font-bold text-xs text-white truncate">{scenario.model}</div>
              </div>

              <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3 text-left">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Input Tokens</div>
                <div className="mt-1 font-mono font-bold text-xs text-blue-400">
                  {(scenario.inputTokens / 1000000).toFixed(1)}M
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3 text-left">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">Est. Monthly</div>
                <div className="mt-1 font-mono font-bold text-xs text-emerald-400">
                  ${scenario.monthlyCostUsd.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
