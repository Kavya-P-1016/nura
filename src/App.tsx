/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Activity, 
  ArrowRight, 
  Brain, 
  Check, 
  ChevronRight, 
  Clock, 
  Dna, 
  Fingerprint, 
  Menu, 
  MessageSquare, 
  Mic, 
  MoveRight, 
  Scan, 
  Sparkles, 
  X,
  Image as ImageIcon,
  Send,
  Loader2,
  Download
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// --- API CLIENT ---
// Initialize lazily to avoid crashes if key is missing during build
const getAIClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("GEMINI_API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
};

// --- TYPES ---
type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

// --- COMPONENTS ---

// 1. NAVBAR
const Navbar = ({ onOpenChat, onOpenVision }: { onOpenChat: () => void, onOpenVision: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      ref={navRef}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-8 py-4 rounded-full transition-all duration-300 flex items-center gap-12
        ${scrolled 
          ? 'bg-white/80 backdrop-blur-md border border-moss-800/10 shadow-sm text-moss-800' 
          : 'bg-transparent text-white border border-transparent'
        }`}
    >
      <div className="font-sans font-bold text-xl tracking-tighter">NURA</div>
      
      <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
        <a href="#audit" className="hover:opacity-70 transition-opacity">Audit</a>
        <a href="#protocol" className="hover:opacity-70 transition-opacity">Protocol</a>
        <a href="#membership" className="hover:opacity-70 transition-opacity">Membership</a>
        <button onClick={onOpenVision} className="hover:opacity-70 transition-opacity flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Vision
        </button>
      </div>

      <button 
        onClick={onOpenChat}
        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 magnetic-btn group
          ${scrolled ? 'bg-moss-800 text-cream' : 'bg-white text-moss-900'}`}
      >
        <span className="relative z-10 flex items-center gap-2">
          Enter System <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </button>
    </nav>
  );
};

// 2. HERO SECTION
const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      
      tl.from(".hero-text-line", {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        delay: 0.5
      })
      .from(".hero-cta", {
        y: 20,
        opacity: 0,
        duration: 0.8
      }, "-=0.5");

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-[100dvh] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?q=80&w=2560&auto=format&fit=crop" 
          alt="Abstract Organic Form" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-moss-900 via-moss-900/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 w-full p-8 md:p-20 z-10 max-w-5xl">
        <div ref={textRef} className="flex flex-col gap-2">
          <h1 className="hero-text-line font-sans text-6xl md:text-8xl font-bold text-white tracking-tight leading-[0.9]">
            Nature is the
          </h1>
          <h1 className="hero-text-line font-serif italic text-7xl md:text-9xl text-moss-300 leading-[0.9]">
            Algorithm.
          </h1>
        </div>
        
        <div className="hero-cta mt-12">
          <button className="group relative px-8 py-4 bg-clay-500 text-white rounded-full overflow-hidden transition-transform hover:scale-105 active:scale-95">
            <span className="relative z-10 font-sans font-semibold tracking-wide flex items-center gap-3">
              Begin Analysis <MoveRight className="w-5 h-5" />
            </span>
            <div className="absolute inset-0 bg-clay-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
};

// 3. FEATURES SECTION
const Features = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Card 1 State
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const cardLabels = ["Epigenetic Age", "Microbiome Score", "Cortisol Optimization"];
  
  // Card 2 State
  const [typewriterText, setTypewriterText] = useState("");
  const messages = ["Optimizing Circadian Rhythm...", "Analyzing Microbiome...", "Calculating Cortisol Index..."];
  const [msgIndex, setMsgIndex] = useState(0);

  // Card 1 Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCardIndex(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Card 2 Logic
  useEffect(() => {
    let currentText = "";
    let targetText = messages[msgIndex];
    let charIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const type = () => {
      if (charIndex < targetText.length) {
        currentText += targetText[charIndex];
        setTypewriterText(currentText);
        charIndex++;
        timeoutId = setTimeout(type, 50); // Typing speed
      } else {
        timeoutId = setTimeout(() => {
          // Fade out logic handled by CSS or just clear
          setMsgIndex(prev => (prev + 1) % messages.length);
          setTypewriterText("");
        }, 2000); // Wait before next message
      }
    };

    timeoutId = setTimeout(type, 500);
    return () => clearTimeout(timeoutId);
  }, [msgIndex]);

  return (
    <section id="audit" className="py-32 px-4 md:px-12 bg-cream relative z-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Card 1: Audit Intelligence */}
        <div className="bg-white rounded-[2rem] p-8 h-[450px] relative overflow-hidden shadow-sm border border-moss-100 group hover:shadow-md transition-shadow">
          <div className="absolute top-8 left-8 z-20">
            <h3 className="font-sans font-bold text-xl text-moss-900">Audit Intelligence</h3>
            <p className="font-serif italic text-moss-500">Diagnostic Shuffler</p>
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center mt-12">
            {[0, 1, 2].map((i) => {
              // Calculate position based on active index
              // This is a simplified simulation of the requested complex animation
              // Ideally we'd use GSAP flip or complex state, but CSS transition is safer for this snippet
              const isActive = i === activeCardIndex;
              const isNext = i === (activeCardIndex + 1) % 3;
              const isLast = i === (activeCardIndex + 2) % 3;
              
              let transform = '';
              let opacity = 1;
              let zIndex = 0;

              if (isActive) {
                transform = 'translateY(0) scale(1)';
                zIndex = 30;
              } else if (isNext) {
                transform = 'translateY(20px) scale(0.95)';
                zIndex = 20;
                opacity = 0.7;
              } else {
                transform = 'translateY(40px) scale(0.9)';
                zIndex = 10;
                opacity = 0.4;
              }

              return (
                <div 
                  key={i}
                  className="absolute w-48 h-64 bg-moss-50 rounded-xl border border-moss-200 shadow-sm flex flex-col items-center justify-center transition-all duration-500 ease-spring"
                  style={{ transform, zIndex, opacity }}
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                    {i === 0 && <Dna className="text-clay-500 w-6 h-6" />}
                    {i === 1 && <Fingerprint className="text-moss-500 w-6 h-6" />}
                    {i === 2 && <Activity className="text-charcoal w-6 h-6" />}
                  </div>
                  <span className="font-mono text-xs text-moss-400 uppercase tracking-wider mb-2">Metric</span>
                  <span className="font-sans font-bold text-moss-900">{cardLabels[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Neural Stream */}
        <div className="bg-moss-900 rounded-[2rem] p-8 h-[450px] relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-sans font-bold text-xl text-white">Neural Stream</h3>
              <p className="font-serif italic text-moss-300">Telemetry</p>
            </div>
            <div className="relative flex items-center justify-center w-4 h-4">
              <div className="absolute w-full h-full bg-clay-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-2 h-2 bg-clay-500 rounded-full"></div>
            </div>
          </div>
          
          <div className="flex-1 font-mono text-sm text-moss-100 leading-relaxed relative">
            <span className="text-clay-400 mr-2">{">"}</span>
            {typewriterText}
            <span className="inline-block w-2 h-4 bg-clay-500 ml-1 animate-pulse align-middle"></span>
          </div>

          <div className="mt-auto pt-8 border-t border-moss-800 grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-moss-400 uppercase">Heart Rate</div>
              <div className="text-2xl font-mono text-white">62 <span className="text-sm text-moss-400">BPM</span></div>
            </div>
            <div>
              <div className="text-xs text-moss-400 uppercase">HRV</div>
              <div className="text-2xl font-mono text-white">104 <span className="text-sm text-moss-400">ms</span></div>
            </div>
          </div>
        </div>

        {/* Card 3: Adaptive Regimen */}
        <div className="bg-cream rounded-[2rem] p-8 h-[450px] relative overflow-hidden border border-moss-200 shadow-sm">
           <div className="mb-6">
            <h3 className="font-sans font-bold text-xl text-moss-900">Adaptive Regimen</h3>
            <p className="font-serif italic text-moss-600">Protocol Scheduler</p>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-8">
            {['S','M','T','W','T','F','S'].map((day, i) => (
              <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-colors duration-300 ${i === 2 ? 'bg-clay-500 text-white shadow-md' : 'bg-moss-100 text-moss-600'}`}>
                {day}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-4 p-3 rounded-xl bg-white border border-moss-100">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item === 1 ? 'bg-clay-100 text-clay-600' : 'bg-moss-50 text-moss-400'}`}>
                  <Check className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="h-2 w-24 bg-moss-100 rounded-full mb-2"></div>
                  <div className="h-2 w-16 bg-moss-50 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Simulated Cursor */}
          <div className="absolute bottom-8 right-8 pointer-events-none animate-bounce">
             <div className="px-4 py-2 bg-moss-800 text-white text-xs rounded-full shadow-lg">
               Auto-Optimized
             </div>
          </div>
        </div>

      </div>
    </section>
  );
};

// 4. PHILOSOPHY SECTION
const Philosophy = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".philosophy-line", 
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
      
      gsap.to(".parallax-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-24">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2560&auto=format&fit=crop" 
          alt="Philosophy Background" 
          className="parallax-bg w-full h-[120%] object-cover -mt-[10%]"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-charcoal/70 mix-blend-multiply" />
      </div>

      <div ref={textRef} className="relative z-10 max-w-6xl mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-center md:text-left">
        <h2 className="philosophy-line font-sans font-bold text-5xl md:text-7xl text-white leading-tight">
          Modern medicine asks: <br/>
          <span className="text-moss-300">What is wrong?</span>
        </h2>
        <h2 className="philosophy-line font-serif italic text-5xl md:text-7xl text-clay-400 leading-tight">
          We ask: <br/>
          <span className="text-cream">What is optimal?</span>
        </h2>
      </div>
    </section>
  );
};

// 5. PROTOCOL SECTION (Sticky Cards)
const Protocol = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.protocol-card');
      
      cards.forEach((card: any, i) => {
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          pin: true,
          pinSpacing: false,
          end: "bottom top", // Keep pinned until next one pushes it
          // scrub: true, // Optional: smooth scrubbing
        });

        // Scale effect for previous card
        if (i > 0) {
           gsap.from(card, {
             scale: 0.9,
             opacity: 0,
             scrollTrigger: {
               trigger: card,
               start: "top bottom",
               end: "top top",
               scrub: true
             }
           });
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="protocol" className="bg-charcoal relative">
      
      {/* Card 1 */}
      <div className="protocol-card h-screen sticky top-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-moss-800 to-moss-950 text-cream">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <svg width="600" height="600" viewBox="0 0 100 100" className="animate-[spin_20s_linear_infinite]">
             <path d="M50 10 Q 80 10 80 50 T 50 90 T 20 50 T 50 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
             <path d="M50 10 Q 20 10 20 50 T 50 90 T 80 50 T 50 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-50" />
          </svg>
        </div>
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full border border-clay-500/30 flex items-center justify-center">
            <Scan className="w-10 h-10 text-clay-500" />
          </div>
          <h2 className="font-serif italic text-6xl mb-4">Complete Health Audit</h2>
          <p className="font-sans text-moss-200 max-w-md mx-auto">Deep phenotypic analysis across 150+ biomarkers.</p>
        </div>
      </div>

      {/* Card 2 */}
      <div className="protocol-card h-screen sticky top-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-charcoal to-moss-900 text-cream">
        <div className="absolute inset-0 opacity-20">
           <div className="w-full h-full grid grid-cols-12 gap-1">
             {Array.from({length: 144}).map((_, i) => (
               <div key={i} className="bg-moss-500/20 rounded-sm animate-pulse" style={{animationDelay: `${Math.random() * 2}s`}}></div>
             ))}
           </div>
        </div>
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full border border-clay-500/30 flex items-center justify-center">
            <Brain className="w-10 h-10 text-clay-500" />
          </div>
          <h2 className="font-serif italic text-6xl mb-4">Real-Time Analysis</h2>
          <p className="font-sans text-moss-200 max-w-md mx-auto">Continuous telemetry monitoring and AI-driven insights.</p>
        </div>
      </div>

      {/* Card 3 */}
      <div className="protocol-card h-screen sticky top-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-cream to-moss-100 text-charcoal">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
           <svg width="100%" height="200" viewBox="0 0 1000 200" preserveAspectRatio="none">
             <path d="M0 100 Q 100 50 200 100 T 400 100 T 600 100 T 800 100 T 1000 100" fill="none" stroke="#CC5833" strokeWidth="2" className="animate-[dash_5s_linear_infinite]" strokeDasharray="1000" strokeDashoffset="1000" />
           </svg>
        </div>
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full border border-clay-500/30 flex items-center justify-center">
            <Activity className="w-10 h-10 text-clay-500" />
          </div>
          <h2 className="font-serif italic text-6xl mb-4 text-moss-900">Continuous Optimization</h2>
          <p className="font-sans text-moss-700 max-w-md mx-auto">Adaptive protocols that evolve with your biology.</p>
        </div>
      </div>

    </section>
  );
};

// 6. MEMBERSHIP & FOOTER
const Footer = () => {
  return (
    <section id="membership" className="bg-cream pt-24 pb-0 relative z-20">
      <div className="max-w-7xl mx-auto px-8 mb-24">
        <h2 className="text-center font-sans font-bold text-4xl mb-16 text-moss-900">Membership Tiers</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Tier 1 */}
          <div className="bg-white p-8 rounded-[2rem] border border-moss-100 h-[400px] flex flex-col">
            <h3 className="font-serif italic text-2xl text-moss-800 mb-2">Explore</h3>
            <div className="text-3xl font-bold font-sans mb-8">$250<span className="text-sm font-normal text-moss-500">/mo</span></div>
            <ul className="space-y-4 mb-auto text-sm text-moss-600">
              <li className="flex gap-2"><Check className="w-4 h-4 text-moss-400" /> Quarterly Audit</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-moss-400" /> Basic Telemetry</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-moss-400" /> App Access</li>
            </ul>
            <button className="w-full py-4 rounded-xl border border-moss-200 hover:bg-moss-50 transition-colors font-semibold text-moss-800">Select</button>
          </div>

          {/* Tier 2 (Featured) */}
          <div className="bg-moss-800 p-8 rounded-[2rem] border-2 border-clay-500 h-[460px] flex flex-col relative shadow-xl transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-clay-500 text-white text-xs font-bold px-4 py-2 rounded-bl-xl rounded-tr-[1.8rem]">MOST POPULAR</div>
            <h3 className="font-serif italic text-3xl text-white mb-2">Performance</h3>
            <div className="text-4xl font-bold font-sans mb-8 text-white">$500<span className="text-sm font-normal text-moss-300">/mo</span></div>
            <ul className="space-y-4 mb-auto text-sm text-moss-100">
              <li className="flex gap-2"><Check className="w-4 h-4 text-clay-400" /> Monthly Deep Audit</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-clay-400" /> Full Telemetry Suite</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-clay-400" /> Dedicated Physician</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-clay-400" /> Priority Lab Access</li>
            </ul>
            <button className="w-full py-4 rounded-xl bg-clay-500 hover:bg-clay-600 transition-colors font-semibold text-white shadow-lg">Apply Now</button>
          </div>

          {/* Tier 3 */}
          <div className="bg-white p-8 rounded-[2rem] border border-moss-100 h-[400px] flex flex-col">
            <h3 className="font-serif italic text-2xl text-moss-800 mb-2">Prescribe</h3>
            <div className="text-3xl font-bold font-sans mb-8">$1200<span className="text-sm font-normal text-moss-500">/mo</span></div>
            <ul className="space-y-4 mb-auto text-sm text-moss-600">
              <li className="flex gap-2"><Check className="w-4 h-4 text-moss-400" /> Weekly Analysis</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-moss-400" /> 24/7 Concierge</li>
              <li className="flex gap-2"><Check className="w-4 h-4 text-moss-400" /> Home Visits</li>
            </ul>
            <button className="w-full py-4 rounded-xl border border-moss-200 hover:bg-moss-50 transition-colors font-semibold text-moss-800">Inquire</button>
          </div>
        </div>
      </div>

      <footer className="bg-charcoal text-cream rounded-t-[4rem] px-8 py-16 md:px-20">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <div className="font-sans font-bold text-3xl mb-4">NURA</div>
            <div className="flex items-center gap-2 text-moss-400 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              System Operational
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm text-moss-300">
            <div className="flex flex-col gap-4">
              <span className="text-white font-semibold">Platform</span>
              <a href="#" className="hover:text-clay-400 transition-colors">Intelligence</a>
              <a href="#" className="hover:text-clay-400 transition-colors">Protocol</a>
              <a href="#" className="hover:text-clay-400 transition-colors">Research</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-white font-semibold">Company</span>
              <a href="#" className="hover:text-clay-400 transition-colors">Manifesto</a>
              <a href="#" className="hover:text-clay-400 transition-colors">Careers</a>
              <a href="#" className="hover:text-clay-400 transition-colors">Contact</a>
            </div>
             <div className="flex flex-col gap-4">
              <span className="text-white font-semibold">Legal</span>
              <a href="#" className="hover:text-clay-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-clay-400 transition-colors">Terms</a>
            </div>
          </div>
        </div>
        <div className="mt-20 pt-8 border-t border-white/10 text-center text-xs text-white/30 font-mono">
          © 2026 NURA HEALTH INC. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </section>
  );
};

// 7. CHATBOT COMPONENT
const Chatbot = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Welcome to Nura Intelligence. How can I assist with your biological optimization today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const ai = getAIClient();
      if (!ai) throw new Error("API Key missing");

      const result = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ role: 'user', parts: [{ text: userMsg }] }],
      });
      const response = result.text;
      if (response) {
        setMessages(prev => [...prev, { role: 'model', text: response }]);
      } else {
        throw new Error("Empty response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I apologize, but I am unable to process that request at the moment. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-8 right-8 w-[350px] md:w-[400px] h-[600px] bg-white rounded-[2rem] shadow-2xl z-50 flex flex-col overflow-hidden border border-moss-100 animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-moss-900 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-clay-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-sans font-bold">Nura Intelligence</span>
        </div>
        <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-moss-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-moss-800 text-white rounded-br-none' : 'bg-white border border-moss-100 text-moss-900 rounded-bl-none shadow-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-moss-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
              <span className="w-2 h-2 bg-moss-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-moss-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-moss-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-moss-100">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your protocol..."
            className="flex-1 bg-moss-50 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-moss-500 outline-none"
          />
          <button onClick={handleSend} disabled={loading} className="bg-clay-500 text-white p-2 rounded-full hover:bg-clay-600 transition-colors disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 8. VISION GENERATOR COMPONENT
const VisionGenerator = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setGenerating(true);
    setGeneratedImage(null);

    try {
      const ai = getAIClient();
      if (!ai) throw new Error("API Key missing");

      // Note: The SDK structure for image generation might vary.
      // We are using the standard generateContent with imageConfig as requested.
      const result = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            // @ts-ignore - imageConfig is valid for this model
            imageConfig: {
                imageSize: size
            }
        }
      });
      
      if (result.candidates && result.candidates[0].content.parts) {
          // Iterate to find inlineData
          const part = result.candidates[0].content.parts.find(p => p.inlineData);
          if (part && part.inlineData) {
              setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          } else {
              throw new Error("No image data found in response");
          }
      } else {
          throw new Error("Invalid response structure");
      }

    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[80vh] md:h-[600px]">
        
        {/* Controls */}
        <div className="w-full md:w-1/3 bg-moss-50 p-8 flex flex-col border-r border-moss-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-serif italic text-3xl text-moss-900">Nura Vision</h2>
            <button onClick={onClose} className="p-2 hover:bg-moss-200 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-6 flex-1">
            <div>
              <label className="block text-xs font-bold text-moss-500 uppercase tracking-wider mb-2">Prompt</label>
              <textarea 
                className="w-full p-4 rounded-xl border border-moss-200 bg-white focus:ring-2 focus:ring-clay-500 outline-none resize-none h-32 text-sm"
                placeholder="Describe your biological visualization..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-moss-500 uppercase tracking-wider mb-2">Resolution</label>
              <div className="flex gap-2">
                {(['1K', '2K', '4K'] as const).map((s) => (
                  <button 
                    key={s}
                    onClick={() => setSize(s)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${size === s ? 'bg-moss-800 text-white' : 'bg-white border border-moss-200 text-moss-600 hover:bg-moss-100'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={generating || !prompt}
            className="mt-8 w-full py-4 bg-clay-500 text-white rounded-xl font-semibold hover:bg-clay-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {generating ? 'Synthesizing...' : 'Generate Visualization'}
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 bg-charcoal relative flex items-center justify-center p-8">
          {generatedImage ? (
            <div className="relative w-full h-full flex items-center justify-center group">
              <img src={generatedImage} alt="Generated" className="max-w-full max-h-full rounded-lg shadow-2xl object-contain" />
              <a href={generatedImage} download="nura-vision.png" className="absolute bottom-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100">
                <Download className="w-5 h-5" />
              </a>
            </div>
          ) : (
            <div className="text-center text-white/20">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-mono text-sm">Waiting for input stream...</p>
            </div>
          )}
          
          {/* Decorative grid */}
          <div className="absolute inset-0 pointer-events-none opacity-10" 
               style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVisionOpen, setIsVisionOpen] = useState(false);

  return (
    <div className="bg-cream min-h-screen relative selection:bg-clay-200 selection:text-clay-900">
      <div className="noise-overlay" />
      
      <Navbar 
        onOpenChat={() => setIsChatOpen(true)} 
        onOpenVision={() => setIsVisionOpen(true)} 
      />
      
      <main>
        <Hero />
        <Features />
        <Philosophy />
        <Protocol />
        <Footer />
      </main>

      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <VisionGenerator isOpen={isVisionOpen} onClose={() => setIsVisionOpen(false)} />
    </div>
  );
}
