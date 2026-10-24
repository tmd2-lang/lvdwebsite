import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { tiers } from '../data/tiers';

export default function StandaloneQuiz({ onBack }) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState([]);
    const isCalculating = false;
    const titleRef = useRef(null);
    useEffect(() => {
        window.scrollTo({top:0, behavior:'instant'});
        titleRef.current?.focus({preventScroll:true});
    }, [step]);
    const questions = [
        { question: 'Where are you in the planning process?', options: [
            {label:'Newly engaged. We haven’t booked our venue.', value:'starting'},
            {label:'Our venue is booked, and we’ve started choosing vendors.', value:'started'},
            {label:'Our venue and primary vendors are booked.', value:'ready'}
        ]},
        { question: 'What would you most like help with?', options: [
            {label:'Finding a venue and understanding what our budget can support.', value:'venue-finder'},
            {label:'Taking over the final logistics and managing the wedding day.', value:'coordinating'},
            {label:'Finishing our plans and sourcing up to four remaining vendors.', value:'partial-planning'},
            {label:'Guiding and managing the full planning process.', value:'full-planning'}
        ]},
        { question: 'What does your celebration look like?', options: [
            {label:'One wedding day at a single venue.', value:'single'},
            {label:'Multiple venues, a destination, or more complex logistics.', value:'complex'},
            {label:'A wedding with additional events around it.', value:'weekend'}
        ]}
    ];
    const handleSelection = value => {
        setAnswers(prev => [...prev.slice(0,step),value]);
        setStep(step < questions.length-1 ? step+1 : 'results');
    };
    const handleBack = () => { if (typeof step === 'number' && step > 0) setStep(step-1); else onBack(); };
    const calculateResult = () => {
        const chosen=answers[1];
        // Final-logistics and partial support assume a booked venue. Broader needs
        // at an earlier stage should be discussed under Full Planning.
        const id=answers[0]==='starting' && ['coordinating','partial-planning'].includes(chosen) ? 'full-planning' : chosen;
        const tier=tiers.find(x=>x.id===id) || tiers[0];
        const extra=answers[2]==='complex' ? ' Complex celebrations may need a custom scope.' : answers[2]==='weekend' ? ' Additional event coordination can be discussed from our à la carte menu.' : '';
        return {id:tier.id,range:tier.price,tier:tier.name,message:tier.desc+extra};
    };
    return (
        <div className="min-h-screen w-full bg-background flex flex-col relative">
            {/* Sticky Minimal Nav */}
            <nav className="fixed top-0 left-0 w-full p-6 flex items-center justify-between z-50 bg-background/90 backdrop-blur-sm border-b border-subtleBorder/50">
                <button onClick={onBack} className="flex items-center gap-2 text-textLight hover:text-accent transition-colors font-sans text-sm tracking-widest uppercase">
                    <ArrowLeft className="w-4 h-4" /> Back to Site
                </button>
                <div className="font-serif text-lg tracking-wide hidden md:block text-textLight">
                    Lady Victoria Designs
                </div>
                <div className="w-[100px] md:hidden"></div> {/* Spacer for mobile centering */}
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center py-32 px-6">
                <div className="w-full max-w-2xl mx-auto flex flex-col justify-center min-h-[500px] relative">
                    
                    {typeof step === 'number' && (
                        <>
                            {/* Progress Bar Container */}
                            <div className="w-full mb-12">
                                <div className="flex justify-between font-sans text-xs uppercase tracking-[0.2em] text-mutedText/60 mb-3">
                                    <span>Question {step + 1} of {questions.length}</span>
                                    <span>{Math.round(((step + 1) / questions.length) * 100)}%</span>
                                </div>
                                <div className="w-full h-1 bg-subtleBorder/50 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent transition-all duration-500 ease-out rounded-full"
                                        style={{ width: `${((step + 1) / questions.length) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-forwards">
                                <h2 ref={titleRef} tabIndex={-1} className="outline-none font-serif text-3xl md:text-5xl text-textLight leading-tight">
                                    {questions[step].question}
                                </h2>

                                <div className="flex flex-col gap-4">
                                    {questions[step].options.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelection(opt.value)}
                                            className="w-full text-left p-6 rounded-2xl border border-subtleBorder bg-white/50 hover:bg-white hover:border-accent hover:shadow-sm transition-all duration-300 text-textLight font-sans group relative overflow-hidden flex justify-between items-center"
                                        >
                                            <span className="relative z-10 pr-8 text-base md:text-lg">{opt.label}</span>
                                            <ArrowRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-accent flex-shrink-0" />
                                        </button>
                                    ))}
                                </div>
                                
                                {step > 0 && (
                                    <button 
                                        onClick={handleBack}
                                        className="text-mutedText hover:text-accent transition-colors font-sans text-sm tracking-widest uppercase self-start flex items-center gap-2 mt-4"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Previous Question
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                    {step === 'results' && isCalculating && (
                        <div className="flex flex-col items-center justify-center text-center gap-8 animate-in fade-in duration-500 absolute inset-0">
                            <div className="w-16 h-16 border-2 border-subtleBorder border-t-accent rounded-full animate-spin"></div>
                            <h3 className="font-serif text-3xl text-textLight animate-pulse">Calculating your personalized estimate...</h3>
                        </div>
                    )}

                    {step === 'results' && !isCalculating && (
                        <div className="flex flex-col items-center text-center gap-8 animate-in fade-in zoom-in-95 duration-700">
                            <div className="w-full bg-white rounded-3xl p-8 md:p-16 shadow-lg border border-subtleBorder relative overflow-hidden">
                                
                                <div className="absolute top-0 left-0 w-full h-2 bg-accent"></div>
                                
                                <div className="text-accent font-sans text-xs tracking-[0.2em] uppercase mb-4">
                                    Your Suggested Starting Point
                                </div>
                                
                                <div className="font-sans text-4xl md:text-6xl text-textLight mb-4">
                                    {calculateResult().range}
                                </div>
                                
                                <div className="inline-block bg-primaryDark text-white font-sans text-xs tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-8">
                                    {calculateResult().tier}
                                </div>
                                
                                <p className="font-serif text-xl md:text-2xl italic text-textLight max-w-lg mx-auto mb-10 leading-relaxed">
                                    "{calculateResult().message}"
                                </p>
                                
                                <div className="w-full h-[1px] bg-subtleBorder mb-10"></div>
                                
                                <p className="font-sans text-sm text-mutedText max-w-md mx-auto mb-10 italic">
                                    This is a package suggestion based on your planning stage and the support you need. Your final scope and investment will be tailored to your celebration with Irene.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <button
                                        onClick={() => window.open("https://www.ladyvictoriadesigns.com/planning", "_blank", "noopener,noreferrer")}
                                        className="w-full sm:w-auto bg-primaryDark text-white px-8 py-4 rounded-full font-sans text-sm tracking-widest uppercase hover:bg-accent hover:text-white transition-colors duration-300"
                                    >
                                        Continue to Planning Inquiry
                                    </button>
                                    <button
                                        onClick={() => onBack(calculateResult().id)}
                                        className="w-full sm:w-auto bg-transparent border border-subtleBorder text-textLight px-8 py-4 rounded-full font-sans text-sm tracking-widest uppercase hover:border-textLight transition-colors duration-300"
                                    >
                                        Explore This Package
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

        </div>
    );
}
