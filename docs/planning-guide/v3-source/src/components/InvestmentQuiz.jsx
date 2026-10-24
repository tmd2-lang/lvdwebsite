import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function InvestmentQuiz() {
    const [step, setStep] = useState(0);
    const [score, setScore] = useState(0);

    // Helper arrays for questions to keep component clean
    const questions = [
        {
            id: 'guests',
            question: "How many guests are you expecting?",
            options: [
                { label: "Under 50", points: 5 },
                { label: "50 – 100", points: 10 },
                { label: "100 – 200", points: 20 },
                { label: "200+", points: 30 }
            ],
            type: 'single'
        },
        {
            id: 'venue',
            question: "What best describes your venue?",
            options: [
                { label: "Backyard / intimate private space", points: 5 },
                { label: "Restaurant / small event space", points: 10 },
                { label: "Barn / vineyard / outdoor estate", points: 15 },
                { label: "Ballroom / hotel / luxury estate", points: 25 },
                { label: "Multiple venues (ceremony + reception separate)", points: 30 }
            ],
            type: 'single'
        },
        {
            id: 'style',
            question: "How would you describe your floral vision?",
            options: [
                { label: "Simple & minimal — just the essentials", points: 5 },
                { label: "Elegant & refined — intentional but not over the top", points: 15 },
                { label: "Lush & abundant — I want it to feel full and romantic", points: 25 },
                { label: "Over the top — flowers EVERYWHERE, total transformation", points: 40 }
            ],
            type: 'single'
        },
        {
            id: 'involvement',
            question: "How involved do you want to be?",
            options: [
                { label: "Very — I'll handle setup and coordinate vendors", points: 0 },
                { label: "Somewhat — I want guidance but can manage some things", points: 10 },
                { label: "Minimal — I want someone to handle the details", points: 20 },
                { label: "None — please take EVERYTHING off my plate", points: 30 }
            ],
            type: 'single'
        }
    ];

    const handleSelection = (points) => {
        setScore(prev => prev + points);
        if (step < questions.length - 1) {
            setStep(prev => prev + 1);
        } else {
            setStep('results');
        }
    };

    const calculateResult = () => {
        if (score <= 40) return { range: "$12k – $15k", message: "Your vision is beautifully achievable with our Elegant experience." };
        if (score <= 70) return { range: "$15k – $19k", message: "You're dreaming in the sweet spot — elevated design with thoughtful details." };
        if (score <= 110) return { range: "$20k – $34k", message: "Your vision calls for lush, layered design and hands-on coordination." };
        return { range: "$35k – $55k+", message: "You're envisioning a full transformation — and we're here for it." };
    };

    return (
        <section id="quiz" className="w-full bg-background py-32 px-6">
            <div className="max-w-3xl mx-auto flex flex-col items-center">

                <div className="text-center mb-12">
                    <div className="text-accent font-sans text-xs tracking-[0.2em] uppercase mb-4">Personalize Your Estimate</div>
                    <h2 className="font-serif text-4xl md:text-5xl text-textLight mb-4">What Will Your Wedding Vision Cost?</h2>
                    <p className="font-sans text-mutedText text-lg italic">Answer a few questions and we'll give you a personalized investment range based on your vision.</p>
                </div>

                <div className="w-full bg-white rounded-[3rem] shadow-xl p-8 md:p-16 border border-subtleBorder min-h-[400px] flex flex-col justify-center relative overflow-hidden transition-all duration-500">

                    {typeof step === 'number' && (
                        <>
                            {/* Progress Bar */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-subtleBorder/30">
                                <div
                                    className="h-full bg-accent transition-all duration-500"
                                    style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                                />
                            </div>

                            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-right-8 duration-500">
                                <p className="font-sans text-xs uppercase tracking-[0.2em] text-mutedText/60">
                                    Question {step + 1} of {questions.length}
                                </p>
                                <h3 className="font-serif text-3xl text-textLight">
                                    {questions[step].question}
                                </h3>

                                <div className="flex flex-col gap-4">
                                    {questions[step].options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelection(opt.points)}
                                            className="w-full text-left p-6 rounded-2xl border border-subtleBorder hover:border-accent hover:bg-accent/5 transition-all text-textLight font-sans group relative overflow-hidden"
                                        >
                                            <span className="relative z-10">{opt.label}</span>
                                            <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {step === 'results' && (
                        <div className="flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in-95 duration-700 delay-150">
                            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                                <div className="w-10 h-10 bg-accent rounded-full animate-ping opacity-20 absolute"></div>
                                <div className="w-4 h-4 bg-accent rounded-full"></div>
                            </div>
                            <h3 className="font-serif text-3xl text-textLight">Your Estimated Investment</h3>
                            <div className="font-sans text-6xl md:text-7xl text-accent pb-6 border-b border-subtleBorder w-full mt-4">
                                {calculateResult().range}
                            </div>
                            <p className="font-serif text-2xl italic text-textLight max-w-lg mt-4">
                                "{calculateResult().message}"
                            </p>

                            <button
                                onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
                                className="mt-8 bg-primaryDark text-white px-8 py-4 rounded-full font-sans text-sm tracking-widest uppercase hover:bg-[#3D332A] transition-colors"
                            >
                                Inquire Now
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </section>
    );
}
