import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Flashcard, AspectRatio, ImageSize, CustomPackage, CustomWord } from '../types';
import { 
    Volume2, Wand2, Edit, Save, 
    Home, Dumbbell, BarChart2, 
    ArrowLeft, GraduationCap, Flame, Info, 
    CheckCircle2, Lock, MessageCircle,
    TrendingUp, BookOpen, Settings as SettingsIcon,
    Menu, HelpCircle, Bell, Crown, Share2, Award, Clock, Calendar,
    PenLine, Diamond, Search, Library, ThumbsUp, X, Download, MessageSquare, Mail,
    Plus, FolderPlus, Package, Check, Image as ImageIcon, ChevronRight,
    Pin, XCircle, Shuffle, Sprout, PenTool, Layers, FileText, CheckSquare,
    DraftingCompass, List, FileCheck, Equal, Zap, Leaf, Mic
} from 'lucide-react';
import { generateVocabImage, getSpeechBase64, editImage } from '../services/geminiService';
import { decode, decodeAudioData } from '../services/audioUtils';
import Settings from './Settings';

interface DashboardProps {
    onStartLive: () => void;
}

// --- MOCK DATA ---
const mockFlashcards: Flashcard[] = [
  { id: '1', german: 'der Apfel', turkish: 'elma', exampleSentence: 'Ich esse einen Apfel.', sentenceTranslation: 'Bir elma yiyorum.' },
  { id: '2', german: 'laufen', turkish: 'koşmak', exampleSentence: 'Er läuft schnell im Park.', sentenceTranslation: 'O parkta hızlı koşuyor.' },
  { id: '3', german: 'das Haus', turkish: 'ev', exampleSentence: 'Das Haus ist sehr groß.', sentenceTranslation: 'Ev çok büyük.' },
  { id: '4', german: 'glücklich', turkish: 'mutlu', exampleSentence: 'Sie ist heute sehr glücklich.', sentenceTranslation: 'O bugün çok mutlu.' },
];

const mockRankingData = [
    { rank: 1, name: "serhat ayvaz", words: 1808, points: 26760 },
    { rank: 2, name: "Emre Donmez", words: 1968, points: 12090 },
    { rank: 3, name: "Sefa Çermi", words: 289, points: 7865 },
    { rank: 4, name: "Sümeyra Deniz", words: 1202, points: 7630 },
    { rank: 5, name: "Gamze Yavuz", words: 1220, points: 7560 },
    { rank: 6, name: "Ekin Deniz Uyg...", words: 2369, points: 7355 },
    { rank: 7, name: "Güven Arıcı", words: 950, points: 6200 },
];

interface UnitWord {
    id: string;
    german: string;
    turkish: string;
    image: string;
    level: 1 | 2 | 3; // 1: Seed, 2: Sprout, 3: Tree (Learned)
    exampleSentence?: string;
    sentenceTranslation?: string;
    synonyms?: string;
}

// A1 Level Unit 1 Words
const mockUnitWordsData: UnitWord[] = [
    { 
        id: '1', german: 'Hallo', turkish: 'Merhaba', image: '👋', level: 1,
        exampleSentence: 'Hallo! Wie geht es dir?', sentenceTranslation: 'Merhaba! Nasılsın?', synonyms: 'Hi, Servus'
    },
    { 
        id: '2', german: 'Tschüss', turkish: 'Hoşça kal', image: '👋', level: 1,
        exampleSentence: 'Ich muss gehen, Tschüss!', sentenceTranslation: 'Gitmem gerek, hoşça kal!', synonyms: 'Auf Wiedersehen'
    },
    { 
        id: '3', german: 'Ja / Nein', turkish: 'Evet / Hayır', image: '👍👎', level: 1,
        exampleSentence: 'Ja, ich möchte Kaffee. Nein, danke.', sentenceTranslation: 'Evet, kahve isterim. Hayır, teşekkürler.'
    },
    { 
        id: '4', german: 'Danke', turkish: 'Teşekkürler', image: '🙏', level: 1,
        exampleSentence: 'Danke für deine Hilfe.', sentenceTranslation: 'Yardımın için teşekkürler.', synonyms: 'Dankeschön'
    },
    { 
        id: '5', german: 'Bitte', turkish: 'Lütfen / Rica ederim', image: '🤲', level: 1,
        exampleSentence: 'Einen Kaffee, bitte.', sentenceTranslation: 'Bir kahve, lütfen.', synonyms: 'Gern geschehen'
    },
    { 
        id: '6', german: 'Der Name', turkish: 'İsim', image: '📛', level: 1,
        exampleSentence: 'Mein Name ist Elif.', sentenceTranslation: 'Benim ismim Elif.'
    },
    { id: '7', german: 'Die Mutter', turkish: 'Anne', image: '👩', level: 1, exampleSentence: 'Meine Mutter kocht gut.', sentenceTranslation: 'Annem iyi yemek yapar.', synonyms: 'Mama' },
    { id: '8', german: 'Der Vater', turkish: 'Baba', image: '👨', level: 1, exampleSentence: 'Der Vater liest ein Buch.', sentenceTranslation: 'Baba kitap okuyor.', synonyms: 'Papa' },
    { id: '9', german: 'Das Kind', turkish: 'Çocuk', image: '🧒', level: 1, exampleSentence: 'Das Kind spielt im Park.', sentenceTranslation: 'Çocuk parkta oynuyor.' },
    { id: '10', german: 'Der Freund', turkish: 'Arkadaş', image: '🤝', level: 1, exampleSentence: 'Er ist mein bester Freund.', sentenceTranslation: 'O benim en iyi arkadaşım.', synonyms: 'Kumpel' },
    { id: '11', german: 'Das Wasser', turkish: 'Su', image: '💧', level: 1, exampleSentence: 'Kann ich bitte Wasser haben?', sentenceTranslation: 'Su alabilir miyim lütfen?' },
    { id: '12', german: 'Das Brot', turkish: 'Ekmek', image: '🍞', level: 1, exampleSentence: 'Das Brot ist frisch.', sentenceTranslation: 'Ekmek taze.' },
    { id: '13', german: 'Der Apfel', turkish: 'Elma', image: '🍎', level: 1, exampleSentence: 'Der Apfel ist rot.', sentenceTranslation: 'Elma kırmızıdır.' },
    { id: '14', german: 'Die Milch', turkish: 'Süt', image: '🥛', level: 1, exampleSentence: 'Ich trinke Milch zum Frühstück.', sentenceTranslation: 'Kahvaltıda süt içerim.' },
    { id: '15', german: 'Der Kaffee', turkish: 'Kahve', image: '☕', level: 1, exampleSentence: 'Der Kaffee schmeckt gut.', sentenceTranslation: 'Kahvenin tadı güzel.' },
    { id: '16', german: 'Das Haus', turkish: 'Ev', image: '🏠', level: 1, exampleSentence: 'Das Haus hat einen Garten.', sentenceTranslation: 'Evin bir bahçesi var.', synonyms: 'Heim' },
    { id: '17', german: 'Die Tür', turkish: 'Kapı', image: '🚪', level: 1, exampleSentence: 'Bitte schließ die Tür.', sentenceTranslation: 'Lütfen kapıyı kapat.' },
    { id: '18', german: 'Das Fenster', turkish: 'Pencere', image: '🪟', level: 1, exampleSentence: 'Das Fenster ist offen.', sentenceTranslation: 'Pencere açık.' },
    { id: '19', german: 'Der Tisch', turkish: 'Masa', image: '🛋️', level: 1, exampleSentence: 'Das Essen steht auf dem Tisch.', sentenceTranslation: 'Yemek masanın üzerinde.' },
    { id: '20', german: 'Der Stuhl', turkish: 'Sandalye', image: '🪑', level: 1, exampleSentence: 'Der Stuhl ist bequem.', sentenceTranslation: 'Sandalye rahat.' },
];

// A2 Level Unit 1 Words
const mockA2Unit1Words: UnitWord[] = [
    { id: '1', german: 'Der Urlaub', turkish: 'Tatil', image: '🏖️', level: 1, exampleSentence: 'Wir fahren in den Urlaub.', sentenceTranslation: 'Tatile gidiyoruz.' },
    { id: '2', german: 'Die Reise', turkish: 'Yolculuk', image: '🎒', level: 1, exampleSentence: 'Die Reise war sehr lang.', sentenceTranslation: 'Yolculuk çok uzundu.' },
    { id: '3', german: 'Der Bahnhof', turkish: 'Tren İstasyonu', image: '🚉', level: 1, exampleSentence: 'Der Zug steht am Bahnhof.', sentenceTranslation: 'Tren istasyonda duruyor.' },
    { id: '4', german: 'Das Flugzeug', turkish: 'Uçak', image: '✈️', level: 1, exampleSentence: 'Das Flugzeug fliegt hoch.', sentenceTranslation: 'Uçak yüksekten uçuyor.' },
    { id: '5', german: 'Der Koffer', turkish: 'Bavul', image: '🧳', level: 1, exampleSentence: 'Mein Koffer ist schwer.', sentenceTranslation: 'Bavulum ağır.' },
    { id: '6', german: 'Das Ticket', turkish: 'Bilet', image: '🎫', level: 1, exampleSentence: 'Ich habe das Ticket gekauft.', sentenceTranslation: 'Bileti satın aldım.' },
    { id: '7', german: 'Das Hotel', turkish: 'Otel', image: '🏨', level: 1, exampleSentence: 'Das Hotel ist sehr schön.', sentenceTranslation: 'Otel çok güzel.' },
    { id: '8', german: 'Der Pass', turkish: 'Pasaport', image: '🛂', level: 1, exampleSentence: 'Vergiss deinen Pass nicht.', sentenceTranslation: 'Pasaportunu unutma.' },
    { id: '9', german: 'Die Stadt', turkish: 'Şehir', image: '🏙️', level: 1, exampleSentence: 'Berlin ist eine große Stadt.', sentenceTranslation: 'Berlin büyük bir şehirdir.' },
    { id: '10', german: 'Die Straße', turkish: 'Cadde / Sokak', image: '🛣️', level: 1, exampleSentence: 'Die Straße ist belebt.', sentenceTranslation: 'Cadde kalabalık.' },
    { id: '11', german: 'Der Platz', turkish: 'Meydan / Yer', image: '📍', level: 1, exampleSentence: 'Der Platz ist im Zentrum.', sentenceTranslation: 'Meydan merkezde.' },
    { id: '12', german: 'Das Geschäft', turkish: 'Dükkan / Mağaza', image: '🏪', level: 1, exampleSentence: 'Das Geschäft schließt um 18 Uhr.', sentenceTranslation: 'Dükkan saat 18:00\'de kapanıyor.' },
    { id: '13', german: 'Der Markt', turkish: 'Pazar', image: '🥦', level: 1, exampleSentence: 'Ich kaufe Obst auf dem Markt.', sentenceTranslation: 'Pazardan meyve alıyorum.' },
    { id: '14', german: 'Kaufen', turkish: 'Satın almak', image: '🛒', level: 1, exampleSentence: 'Ich möchte das kaufen.', sentenceTranslation: 'Bunu satın almak istiyorum.' },
    { id: '15', german: 'Verkaufen', turkish: 'Satmak', image: '🏷️', level: 1, exampleSentence: 'Er will sein Auto verkaufen.', sentenceTranslation: 'Arabasını satmak istiyor.' },
    { id: '16', german: 'Teuer', turkish: 'Pahalı', image: '💎', level: 1, exampleSentence: 'Das Auto ist zu teuer.', sentenceTranslation: 'Araba çok pahalı.' },
    { id: '17', german: 'Billig', turkish: 'Ucuz', image: '📉', level: 1, exampleSentence: 'Dieses Hemd ist billig.', sentenceTranslation: 'Bu gömlek ucuz.' },
    { id: '18', german: 'Bezahlen', turkish: 'Ödemek', image: '💳', level: 1, exampleSentence: 'Kann ich mit Karte bezahlen?', sentenceTranslation: 'Kartla ödeyebilir miyim?' },
    { id: '19', german: 'Das Geld', turkish: 'Para', image: '💶', level: 1, exampleSentence: 'Ich habe kein Geld.', sentenceTranslation: 'Param yok.' },
    { id: '20', german: 'Die Rechnung', turkish: 'Fatura / Hesap', image: '🧾', level: 1, exampleSentence: 'Die Rechnung, bitte.', sentenceTranslation: 'Hesap lütfen.' },
];

// --- SUB-COMPONENTS ---

// Helper for Learning Level Icon (Fidan boyu)
const LearningLevelIcon: React.FC<{ level: 1 | 2 | 3 }> = ({ level }) => {
    return (
        <div className="flex items-end justify-center w-8 h-8 relative transition-all duration-300">
            {level === 1 && (
                // Level 1: Seed / No Leaf
                <>
                    <div className="absolute bottom-0 w-6 h-1 bg-gray-300 rounded-full"></div>
                    {/* Tiny seed dot */}
                    <div className="mb-0.5 w-1.5 h-1.5 bg-amber-600 rounded-full"></div> 
                </>
            )}
            {level === 2 && (
                // Level 2: Sprout (multiple leaves) on Soil
                <>
                    <div className="absolute bottom-0 w-6 h-1 bg-gray-300 rounded-full"></div>
                    <Sprout size={24} className="text-green-500 mb-0.5 fill-green-100 transition-all duration-300" />
                </>
            )}
            {level === 3 && (
                // Level 3: Just Checkmark
                <div className="flex flex-col items-center mb-1 animate-in zoom-in duration-300">
                    <CheckCircle2 size={26} className="text-green-600 fill-green-100" />
                </div>
            )}
        </div>
    );
};

// NEW: Word Detail Popup Component
const WordDetailModal: React.FC<{ word: UnitWord | null; onClose: () => void }> = ({ word, onClose }) => {
    if (!word) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-[32px] w-full max-w-sm relative pt-14 pb-8 px-6 shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Number Badge */}
                <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-[#A01B46] text-white rounded-full flex items-center justify-center text-xl font-bold border-[6px] border-gray-100 shadow-sm z-10">
                   {word.id}
                </div>

                {/* Header Info */}
                <div className="text-center mb-6">
                    <h2 className="text-4xl font-bold text-gray-800 mb-1">{word.german}</h2>
                    <p className="text-lg text-gray-500 font-light">{word.turkish}</p>
                </div>

                {/* Main Image */}
                <div className="flex justify-center mb-8 relative">
                   <div className="w-40 h-40 flex items-center justify-center text-9xl">
                        {word.image.startsWith('http') ? (
                            <img src={word.image} alt={word.german} className="w-full h-full object-contain" />
                        ) : (
                            <span>{word.image}</span>
                        )}
                   </div>
                   {/* Decorative Lightning Bolt from screenshot */}
                   <div className="absolute right-4 bottom-2 text-yellow-400">
                       <Zap size={32} className="fill-current" />
                   </div>
                </div>

                {/* Info Blocks */}
                <div className="space-y-4">
                   {/* Example Sentence */}
                   <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 items-start border border-gray-100">
                      <span className="text-yellow-500 font-bold text-sm mt-0.5 shrink-0">Ör.</span>
                      <p className="text-gray-600 text-base leading-snug">
                          {word.exampleSentence || "Bu kelime için henüz örnek cümle eklenmedi."}
                      </p>
                   </div>
                   {/* Translation */}
                   <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 items-start border border-gray-100">
                      <span className="text-yellow-500 font-bold text-sm mt-0.5 shrink-0">Çev.</span>
                      <p className="text-gray-600 text-base leading-snug">
                          {word.sentenceTranslation || "Örnek cümlenin çevirisi mevcut değil."}
                      </p>
                   </div>
                   {/* Synonyms */}
                   {word.synonyms && (
                       <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 items-start border border-gray-100">
                          <span className="text-yellow-500 font-bold text-sm mt-0.5 shrink-0">Eş.</span>
                          <p className="text-gray-600 text-base leading-snug">{word.synonyms}</p>
                       </div>
                   )}
                </div>
            </div>
        </div>
    );
};

// NEW: Multiple Choice Quiz View
const MultipleChoiceQuizView: React.FC<{ words: UnitWord[]; unitId: number; onBack: () => void; onUpdateLevel: (id: string, level: 1 | 2 | 3) => void }> = ({ words, unitId, onBack, onUpdateLevel }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Track selected wrong answers (allows multiple)
    const [wrongSelections, setWrongSelections] = useState<string[]>([]);
    // Track if correct was selected (to show green)
    const [isCorrectSelected, setIsCorrectSelected] = useState(false);
    
    const [options, setOptions] = useState<UnitWord[]>([]);
    const [showNextArrow, setShowNextArrow] = useState(false);

    // Touch Swipe State
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const currentWord = words[currentIndex];
    const progress = ((currentIndex + 1) / words.length) * 100;

    // Helper to shuffle array
    const shuffleArray = (array: any[]) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    // Generate options when index changes
    useEffect(() => {
        const currentWord = words[currentIndex];
        if (!currentWord) return;

        // Reset state for new question
        setWrongSelections([]);
        setIsCorrectSelected(false);
        setShowNextArrow(false);

        // Find 3 distractors
        const otherWords = words.filter(w => w.id !== currentWord.id);
        const shuffledOthers = shuffleArray(otherWords);
        const distractors = shuffledOthers.slice(0, 3);
        
        // Combine with correct answer and shuffle
        const quizOptions = shuffleArray([...distractors, currentWord]);
        setOptions(quizOptions);
    }, [currentIndex]); // Removed 'words' dependency to prevent reshuffle on level update

    const handleOptionSelect = (optionId: string) => {
        // If already completed the logic for a clean win, ignore (optional, but good UX to prevent double triggers)
        if (isCorrectSelected && wrongSelections.length === 0) return;

        const isCorrect = optionId === currentWord.id;

        if (isCorrect) {
            setIsCorrectSelected(true);
            
            // If user never made a mistake, auto-advance
            if (wrongSelections.length === 0) {
                setTimeout(() => {
                    handleNextQuestion();
                }, 1000);
            } 
            // If they made a mistake before, we don't auto-advance. They must use the arrow.
        } else {
            // Wrong Answer
            if (!wrongSelections.includes(optionId)) {
                setWrongSelections(prev => [...prev, optionId]);
                onUpdateLevel(currentWord.id, 1); // Demote
            }
            // Show footer arrow immediately on error
            setShowNextArrow(true);
        }
    };

    const handleNextQuestion = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onBack();
        }
    };

    const handlePreviousQuestion = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    // Swipe Handlers
    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null); 
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNextQuestion();
        }
        if (isRightSwipe) {
            handlePreviousQuestion();
        }
    };

    if (!currentWord) return null;

    return (
        <div 
            className="bg-gray-50 min-h-screen flex flex-col font-sans relative select-none"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* Pink Header */}
            <header className="bg-[#D81B60] p-4 flex items-center justify-between text-white shadow-md z-50 relative">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="hover:scale-110 transition-transform p-1">
                        <X size={28} />
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold leading-none">Akademik İsimler</h1>
                        <span className="text-xs opacity-80 font-light">Ünite: {unitId}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-[#ad1457] px-3 py-1 rounded-full text-sm font-bold shadow-inner">0</div>
                    <Zap size={24} className="fill-current" />
                </div>
            </header>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-1.5 relative z-10">
                <div className="bg-[#D81B60] h-full transition-all duration-300 absolute top-0 left-0" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="text-right px-4 pt-1">
                <span className="text-[#D81B60] font-bold text-xs">{currentIndex + 1}/{words.length}</span>
            </div>

            {/* Question Area */}
            <div className="flex-1 px-6 pt-8 pb-32 flex flex-col items-center">
                
                {/* White Card */}
                <div className="bg-white w-full rounded-[32px] p-6 shadow-sm relative flex flex-col items-center mb-10 transition-all z-20">
                     {/* Level Status Top Right */}
                    <div className="absolute top-4 right-4 bg-gray-50 p-2 rounded-full border border-gray-100">
                        {/* Note: currentWord comes from props which is updated by parent state, 
                            so level should reflect the demotion immediately */}
                        <LearningLevelIcon level={currentWord.level} />
                    </div>

                    {/* Speaker Icon */}
                    <button className="text-yellow-400 mb-4 hover:scale-110 transition-transform">
                        <Volume2 size={40} className="fill-current" />
                    </button>

                    {/* German Word */}
                    <h2 className="text-4xl font-black text-gray-800 text-center mb-6">{currentWord.german}</h2>

                    {/* Options */}
                    <div className="w-full space-y-3">
                        {options.map((option) => {
                            let btnStyle = "bg-white border-2 border-gray-100 text-gray-600 hover:bg-gray-50"; 
                            
                            const isWrong = wrongSelections.includes(option.id);
                            const isCorrect = option.id === currentWord.id;
                            // Show correct answer if selected correctly OR if mistakes were made (reveal answer)
                            const showAnswer = isCorrectSelected || wrongSelections.length > 0;

                            if (isCorrect && showAnswer) {
                                // Always show green for correct answer if revealed
                                btnStyle = "bg-[#4CAF50] border-[#4CAF50] text-white font-bold shadow-md transform scale-105"; 
                            } else if (isWrong) {
                                // Red for explicitly selected wrong answers
                                btnStyle = "bg-[#F44336] border-[#F44336] text-white font-bold shadow-md";
                            }

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => handleOptionSelect(option.id)}
                                    className={`w-full py-4 rounded-full text-xl font-light transition-all duration-200 shadow-sm ${btnStyle}`}
                                >
                                    {option.turkish}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Custom Footer Navigation for Wrong Answers */}
            {showNextArrow && (
                <div className="fixed bottom-8 left-4 right-4 z-50 animate-in slide-in-from-bottom fade-in duration-300">
                    <button
                        onClick={handleNextQuestion}
                        className="w-full bg-[#FDD835] rounded-full p-2 pl-6 pr-2 h-16 flex items-center justify-between shadow-xl cursor-pointer hover:bg-[#FBC02D] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Search size={22} className="text-gray-700" />
                            <span className="font-bold text-lg text-gray-800">Kelimeye gözat</span>
                        </div>
                        <div className="w-12 h-12 bg-[#E91E63] rounded-full flex items-center justify-center text-white shadow-sm">
                            <ChevronRight size={32} />
                        </div>
                    </button>
                </div>
            )}

        </div>
    );
};


// NEW: Flashcard Study View (Matching Screenshot)
const FlashcardStudyView: React.FC<{ words: UnitWord[]; onBack: () => void; onUpdateLevel: (id: string, level: 1 | 2 | 3) => void }> = ({ words, onBack, onUpdateLevel }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const currentWord = words[currentIndex];
    const progress = ((currentIndex + 1) / words.length) * 100;

    const handleRating = (level: 1 | 2 | 3) => {
        onUpdateLevel(currentWord.id, level);
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onBack();
        }
    };

    return (
        <div className="bg-white min-h-screen flex flex-col font-sans">
            {/* Progress Bar */}
            <div className="px-4 pt-4 pb-2">
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                    <span></span>
                    <span className="text-[#1e7eb6]">{currentIndex + 1}/{words.length}</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#1e7eb6] h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-6 py-4 flex flex-col overflow-y-auto pb-40">
                {/* Header: Audio + Word */}
                <div className="flex items-start gap-4 mb-2">
                    <button className="text-yellow-400 mt-1 hover:text-yellow-500 transition-colors">
                        <Volume2 size={32} className="fill-current" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 leading-tight">{currentWord.german}</h1>
                        <p className="text-xl text-gray-500 font-light mt-1">{currentWord.turkish}</p>
                    </div>
                </div>

                {/* Illustration */}
                <div className="flex justify-center my-6 relative">
                    <div className="w-48 h-48 flex items-center justify-center text-9xl">
                         {currentWord.image.startsWith('http') ? (
                             <img src={currentWord.image} alt={currentWord.german} className="w-full h-full object-contain" />
                         ) : (
                             <span className="text-[120px]">{currentWord.image}</span>
                         )}
                    </div>
                     {/* Lightning Bolt */}
                   <div className="absolute right-0 bottom-4 text-yellow-400">
                       <Zap size={28} className="fill-current" />
                   </div>
                </div>
                
                {/* Example Quote (Centered below image if exists, else generic) */}
                <div className="text-center text-xs font-bold text-gray-800 mb-6 px-4">
                     {/* Placeholder for specific illustration text if any */}
                     Learning is a journey, not a destination.
                </div>

                {/* Context Box */}
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
                    {/* Example Sentence */}
                    <div className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                         <div className="flex gap-2">
                             <span className="text-yellow-500 font-bold text-sm shrink-0 mt-0.5">Ör.</span>
                             <p className="text-gray-600 text-lg leading-snug">
                                 {currentWord.exampleSentence || "This word has no example sentence."}
                             </p>
                         </div>
                    </div>
                     {/* Translation */}
                    <div className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                         <p className="text-gray-500 text-base leading-snug pl-8">
                             {currentWord.sentenceTranslation || "Örnek cümlenin çevirisi yok."}
                         </p>
                    </div>

                    {/* Synonyms */}
                    {currentWord.synonyms && (
                        <div className="flex gap-2 pt-1">
                            <div className="flex flex-col">
                                <span className="text-yellow-500 font-bold text-sm">Eş</span>
                                <span className="text-yellow-500 font-bold text-sm">An.</span>
                            </div>
                            <p className="text-gray-500 text-base mt-1">
                                {currentWord.synonyms}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Interaction Area */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
                <h3 className="text-center text-gray-500 font-bold text-sm mb-6">Bu kelimeyi ne seviyede biliyorsun?</h3>
                <div className="flex justify-between items-center px-2 gap-2">
                    
                    {/* Level 1: Bilmiyorum (Single Leaf from Soil) */}
                    <div className="flex flex-col items-center gap-2 flex-1">
                        <button 
                            onClick={() => handleRating(1)}
                            className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center border-2 border-transparent hover:border-green-300 transition-all active:scale-95"
                        >
                            <div className="flex items-end justify-center w-8 h-8 relative">
                                <div className="absolute bottom-0 w-6 h-1 bg-[#A5D6A7] rounded-full"></div>
                                {/* <Leaf size={20} className="text-[#4CAF50] mb-0.5" /> REMOVED */}
                                <div className="mb-0.5 w-1.5 h-1.5 bg-amber-600 rounded-full"></div>
                            </div>
                        </button>
                        <span className="text-xs font-bold text-gray-400 uppercase">BİLMİYORUM</span>
                    </div>

                     {/* Level 2: Biraz (Sprout - 2/3 leaves from Soil) */}
                     <div className="flex flex-col items-center gap-2 flex-1">
                        <button 
                            onClick={() => handleRating(2)}
                            className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center border-2 border-transparent hover:border-green-300 transition-all active:scale-95"
                        >
                            <div className="flex items-end justify-center w-8 h-8 relative">
                                <div className="absolute bottom-0 w-6 h-1 bg-[#A5D6A7] rounded-full"></div>
                                <Sprout size={24} className="text-[#F9A825] mb-0.5 fill-[#FDD835]" />
                            </div>
                        </button>
                        <span className="text-xs font-bold text-gray-400 uppercase">BİRAZ</span>
                    </div>

                     {/* Level 3: Öğrendim (Just Green Tick) */}
                     <div className="flex flex-col items-center gap-2 flex-1">
                        <button 
                            onClick={() => handleRating(3)}
                            className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center border-2 border-transparent hover:border-green-300 transition-all active:scale-95"
                        >
                            <div className="flex flex-col items-center justify-center">
                                <CheckCircle2 size={32} className="text-[#4CAF50] fill-[#C8E6C9]" />
                            </div>
                        </button>
                        <span className="text-xs font-bold text-gray-400 uppercase">ÖĞRENDİM</span>
                    </div>

                </div>
            </div>
        </div>
    );
};

// 0. SIDE MENU (Drawer)
const SideMenu: React.FC<{ isOpen: boolean; onClose: () => void; onNavigate: (tab: string) => void }> = ({ isOpen, onClose, onNavigate }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex font-sans">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={onClose}></div>
            
            {/* Drawer Content */}
            <div className="relative w-[85%] max-w-[320px] bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-left duration-300">
                {/* Header Profile */}
                <div className="p-6 pb-8 border-b border-gray-100 flex items-start gap-4">
                     <div className="w-16 h-16 bg-gray-300 rounded-full flex-shrink-0 border-2 border-gray-100 overflow-hidden">
                        <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        </div>
                     </div>
                     <div className="mt-1">
                         <h2 className="text-lg font-bold text-gray-800 leading-tight">Huseyin Oztekin</h2>
                         <div className="flex items-center gap-1 mt-1">
                            <span className="text-sm font-light text-gray-500">Premium Kullanıcı</span>
                            <Crown size={14} className="text-yellow-400 fill-current" />
                         </div>
                     </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 overflow-y-auto">
                    {/* Section 1 */}
                    <div className="py-2">
                        <button onClick={() => { onNavigate('home'); onClose(); }} className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left">
                            <Home className="text-gray-800" size={24} />
                            <span className="font-bold text-gray-800">Ana Sayfa</span>
                        </button>
                        <button onClick={() => { onNavigate('search_view'); onClose(); }} className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left">
                            <Search className="text-gray-800" size={24} />
                            <span className="font-bold text-gray-800">Kelime ara...</span>
                        </button>
                        <button onClick={() => { onNavigate('package_selection'); onClose(); }} className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left">
                            <Library className="text-gray-800" size={24} />
                            <span className="font-bold text-gray-800">Kelime paketlerine gözat</span>
                        </button>
                    </div>

                    <div className="h-px bg-gray-100 mx-6 my-1"></div>

                    {/* Section 2 */}
                    <div className="py-2">
                        <button className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left">
                            <ThumbsUp className="text-[#8BC34A] fill-current" size={24} />
                            <span className="font-bold text-[#8BC34A]">Arkadaşına tavsiye et</span>
                        </button>
                    </div>

                    <div className="h-px bg-gray-100 mx-6 my-1"></div>

                    {/* Section 3 */}
                    <div className="py-2">
                        <button onClick={() => { onNavigate('help_view'); onClose(); }} className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left">
                            <HelpCircle className="text-black fill-current text-white bg-gray-800 rounded-full" size={24} />
                            <span className="font-bold text-gray-800">Yardım ve geri bildirim</span>
                        </button>
                        <button onClick={() => { onNavigate('settings_view'); onClose(); }} className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left">
                            <SettingsIcon className="text-black fill-current text-white" size={24} />
                            <span className="font-bold text-gray-800">Ayarlar</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 1. SEARCH VIEW
const SearchView: React.FC<{onBack: () => void}> = ({onBack}) => {
    return (
        <div className="bg-gray-50 min-h-screen">
             <header className="bg-[#1e7eb6] p-4 flex items-center gap-4 text-white shadow-md">
                <button onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Kelime ara</h1>
            </header>

            <div className="p-4 bg-[#1e7eb6] pb-8">
                 <div className="bg-white rounded shadow flex items-center p-3 gap-3">
                     <Search className="text-gray-400" size={20} />
                     <input 
                        type="text" 
                        placeholder="Kelimeyi yazın..." 
                        className="flex-1 outline-none text-gray-700 text-lg"
                        autoFocus
                     />
                 </div>
            </div>

            <div className="flex flex-col items-center justify-center pt-16 px-8 text-center">
                 <div className="text-gray-300 mb-4">
                     <Search size={100} className="text-gray-300" />
                 </div>
                 <p className="text-gray-400 text-lg font-light leading-relaxed">
                     Aramak istediğin kelimeyi yazmaya başla. Bulunan kelimeler burada listelenir.
                 </p>
            </div>
        </div>
    );
};

// 2. HELP VIEW
const HelpView: React.FC<{onBack: () => void}> = ({onBack}) => {
    return (
        <div className="bg-white min-h-screen">
             <header className="bg-[#1e7eb6] p-4 flex items-center gap-4 text-white shadow-md">
                <button onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Yardım ve geri bildirim</h1>
            </header>

            <div className="p-6 space-y-8">
                 <div className="flex items-center gap-6">
                     <div className="w-10 flex justify-center">
                        <HelpCircle size={32} className="text-gray-600 bg-gray-200 rounded-full p-0.5 fill-current text-white" />
                     </div>
                     <span className="text-gray-800 text-lg">Sık sorulan sorulara gözat</span>
                 </div>

                 <div className="flex items-center gap-6">
                     <div className="w-10 flex justify-center">
                        <MessageSquare size={32} className="text-gray-600" />
                     </div>
                     <span className="text-gray-800 text-lg">Geri bildirim gönder</span>
                 </div>

                 <div className="flex items-center gap-6">
                     <div className="w-10 flex justify-center">
                        <Mail size={32} className="text-gray-600" />
                     </div>
                     <span className="text-gray-800 text-lg">İletişime geç</span>
                 </div>
            </div>
        </div>
    );
};

// NEW: Unit Detail View (Updated with A1 Unit 1 Data and Interactive Icons)
const UnitDetailView: React.FC<{onBack: () => void, unitId: number, words: UnitWord[], onUpdateWordLevel: (id: string, level: 1 | 2 | 3) => void, onStartStudying: () => void, onStartMultipleChoice: () => void }> = ({onBack, unitId, words, onUpdateWordLevel, onStartStudying, onStartMultipleChoice}) => {
    const [hideLearned, setHideLearned] = useState(false);
    // State for the selected word popup
    const [selectedWord, setSelectedWord] = useState<UnitWord | null>(null);

    const toggleWordLevel = (e: React.MouseEvent, id: string, currentLevel: number) => {
        e.stopPropagation(); // Prevent opening the modal when clicking the sprout
        const nextLevel = currentLevel === 3 ? 1 : (currentLevel + 1) as 1 | 2 | 3;
        onUpdateWordLevel(id, nextLevel);
    };

    const handleWordClick = (word: UnitWord) => {
        setSelectedWord(word);
    };

    // Filter words based on "hideLearned" toggle
    const displayWords = hideLearned 
        ? words.filter(w => w.level < 3)
        : words;

    return (
        <div className="bg-white min-h-screen flex flex-col font-sans relative">
            {/* Detail Popup Modal */}
            <WordDetailModal word={selectedWord} onClose={() => setSelectedWord(null)} />

            {/* Header */}
            <header className="bg-[#1e7eb6] p-4 flex items-center gap-4 text-white shadow-md sticky top-0 z-20">
                <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Ünite {unitId}</h1>
            </header>

            {/* Info Panel */}
            <div className="bg-gray-50 border-b border-gray-200 pb-2">
                <div className="flex flex-col items-center py-6">
                    <div className="w-24 h-24 rounded-full bg-[#E91E63] flex items-center justify-center text-white text-4xl font-light shadow-md mb-4">
                        {unitId}
                    </div>
                    <p className="text-gray-700 font-medium text-lg">Bu ünitede çalışılacak {words.length} kelime var.</p>
                </div>

                {/* Filter Checkbox */}
                <div 
                    className="flex items-center justify-center bg-gray-200 py-3 gap-2 cursor-pointer"
                    onClick={() => setHideLearned(!hideLearned)}
                >
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${hideLearned ? 'bg-gray-600 border-gray-600' : 'border-gray-500 bg-white'}`}>
                        {hideLearned && <Check size={14} className="text-white" />}
                    </div>
                    <span className="text-gray-600 font-bold text-sm">Öğrenilen kelimeleri gizle</span>
                </div>
            </div>

            {/* Word List */}
            <div className="flex-1 pb-24">
                {displayWords.map((word, index) => (
                    <div 
                        key={word.id} 
                        className="flex items-center p-4 border-b border-gray-100 h-20 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleWordClick(word)}
                    >
                        {/* Col 1: Learning Level (Fidan boyu) - Interactive */}
                        <div 
                            className="w-12 flex justify-center flex-shrink-0 cursor-pointer p-2 rounded-full hover:bg-gray-100"
                            onClick={(e) => toggleWordLevel(e, word.id, word.level)}
                        >
                            <LearningLevelIcon level={word.level} />
                        </div>

                        {/* Col 2: Image/Icon */}
                        <div className="w-16 flex justify-center flex-shrink-0 mx-2">
                            <div className="w-12 h-12 bg-gray-50 rounded-full border border-gray-200 p-1 flex items-center justify-center overflow-hidden text-2xl">
                                {word.image.startsWith('http') ? (
                                    <img src={word.image} alt={word.german} className="w-full h-full object-contain" />
                                ) : (
                                    <span>{word.image}</span>
                                )}
                            </div>
                        </div>

                        {/* Col 3: Words */}
                        <div className="flex-1 flex flex-col justify-center gap-0.5">
                            <span className="text-gray-900 font-bold text-lg leading-tight">{word.german}</span>
                            <span className="text-gray-500 font-light text-sm">{word.turkish}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Action Bar (Fixed) */}
            <div className="fixed bottom-0 left-0 w-full h-20 flex text-white font-bold text-[10px] leading-tight text-center z-30 shadow-2xl">
                {/* 1. Start Studying - Blue */}
                <button 
                    onClick={onStartStudying}
                    className="flex-1 bg-[#2b7696] flex flex-col items-center justify-center gap-1 active:opacity-90 transition-colors hover:bg-[#23607a]"
                >
                    <DraftingCompass size={24} />
                    <span>START<br/>STUDYING</span>
                </button>
                {/* 2. Multiple Choice - Pink */}
                <button 
                    onClick={onStartMultipleChoice}
                    className="flex-1 bg-[#D81B60] flex flex-col items-center justify-center gap-1 active:opacity-90 transition-colors hover:bg-[#ad1457]"
                >
                    <List size={28} />
                    <span>MULTI<br/>PLE CHOICE</span>
                </button>
                {/* 3. Writing Test - Light Green */}
                <button className="flex-1 bg-[#9CCC65] flex flex-col items-center justify-center gap-1 active:opacity-90 transition-colors hover:bg-[#8bc34a]">
                    <PenLine size={24} />
                    <span>WRITING<br/>TEST</span>
                </button>
                {/* 4. Word in Sentence - Cyan */}
                <button className="flex-1 bg-[#26C6DA] flex flex-col items-center justify-center gap-1 active:opacity-90 transition-colors hover:bg-[#00bcd4]">
                    <FileCheck size={24} />
                    <span>WORD<br/>IN SENTENCE</span>
                </button>
                {/* 5. Synonym Study - Yellow */}
                <button className="flex-1 bg-[#FDD835] flex flex-col items-center justify-center gap-1 active:opacity-90 transition-colors hover:bg-[#fbc02d]">
                    <Equal size={24} />
                    <span>SYNO<br/>NYM STUDY</span>
                </button>
            </div>
        </div>
    );
};

// NEW: Units View (Matching the 20 units screenshot)
const UnitsView: React.FC<{onBack: () => void, title: string, onUnitSelect: (unit: number) => void, isHome?: boolean}> = ({onBack, title, onUnitSelect, isHome}) => {
    const units = Array.from({length: 20}, (_, i) => i + 1);
    
    // Color palette based on the screenshot
    const colors = [
        'bg-[#E91E63]', // 1: Pink
        'bg-[#03A9F4]', // 2: Light Blue
        'bg-[#009688]', // 3: Teal
        'bg-[#8BC34A]', // 4: Lime Green
        'bg-[#F44336]', // 5: Red
        'bg-[#FFC107]', // 6: Amber
        'bg-[#795548]', // 7: Brown
        'bg-[#CDDC39]', // 8: Lime
        'bg-[#3F51B5]', // 9: Indigo
        'bg-[#FF9800]', // 10: Orange
        'bg-[#9C27B0]', // 11: Purple
        'bg-[#FFEB3B]', // 12: Yellow
        'bg-[#E91E63]', // 13: Pink
        'bg-[#006064]', // 14: Dark Cyan
        'bg-[#FF5722]', // 15: Deep Orange
        'bg-[#673AB7]', // 16: Deep Purple
        'bg-[#00BCD4]', // 17: Cyan
        'bg-[#4CAF50]', // 18: Green
        'bg-[#E91E63]', // 19: Pink
        'bg-[#9E9E9E]'  // 20: Grey
    ];

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
             <header className="bg-[#1e7eb6] p-4 flex items-center gap-4 text-white shadow-md sticky top-0 z-20">
                <button onClick={onBack}>
                    {isHome ? <Menu size={24} /> : <ArrowLeft size={24} />}
                </button>
                <h1 className="text-xl font-bold">{title}</h1>
            </header>

            {/* Top Action Card */}
            <div className="px-4 py-4 z-10">
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col items-center w-1/3">
                            <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-white mb-2 shadow-sm">
                                <Pin size={24} className="fill-current" />
                            </div>
                            <span className="text-[10px] text-gray-500 text-center leading-tight">Unutulabilecek<br/>Kelimeler</span>
                        </div>
                        <div className="flex flex-col items-center w-1/3 border-l border-r border-gray-100">
                            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white mb-2 shadow-sm">
                                <XCircle size={24} className="fill-current" />
                            </div>
                            <span className="text-[10px] text-gray-500 text-center leading-tight">Yanlış<br/>Yapılanlar</span>
                        </div>
                        <div className="flex flex-col items-center w-1/3">
                            <div className="w-12 h-12 rounded-full bg-[#8BC34A] flex items-center justify-center text-white mb-2 shadow-sm">
                                <Shuffle size={24} />
                            </div>
                            <span className="text-[10px] text-gray-500 text-center leading-tight">Karışık<br/>Tekrar Çalışması</span>
                        </div>
                    </div>
                    
                    <div className="flex border-t border-gray-100 pt-3">
                        <div className="flex-1 text-center border-r border-gray-100">
                            <span className="font-bold text-gray-400 text-sm">%0</span> 
                            <span className="text-xs text-gray-400 ml-1">Doğru yanıtlar</span>
                        </div>
                        <div className="flex-1 text-center">
                            <span className="font-bold text-gray-400 text-sm">%0</span>
                            <span className="text-xs text-gray-400 ml-1">Öğrenilenler</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Units Timeline List */}
            <div className="flex-1 px-4 pb-24">
                <div className="relative pl-4">
                    {/* Dotted Line Background */}
                    <div className="absolute left-[39px] top-6 bottom-10 w-0.5 border-l-2 border-dotted border-gray-300 -z-0"></div>

                    {units.map((unit, index) => (
                        <div 
                            key={unit} 
                            onClick={() => onUnitSelect(unit)}
                            className="flex items-center mb-8 relative z-10 cursor-pointer group"
                        >
                            {/* Circle Number */}
                            <div className={`w-12 h-12 rounded-full ${colors[index % colors.length]} flex items-center justify-center text-white font-bold text-lg shadow-sm border-4 border-gray-50 group-hover:scale-110 transition-transform`}>
                                {unit}
                            </div>
                            
                            {/* Text Info */}
                            <div className="ml-6 flex-1">
                                <h3 className="font-bold text-gray-700 text-lg">Ünite {unit}</h3>
                                <p className="text-gray-400 text-sm font-light">0/20 öğrenildi</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PackageSelectionView: React.FC<{ onBack: () => void; onCreatePackage: () => void; onBrowseReadyPackages: () => void }> = ({ onBack, onCreatePackage, onBrowseReadyPackages }) => {
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <header className="bg-[#1e7eb6] p-4 flex items-center gap-4 text-white shadow-md">
                <button onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Kelime Paketleri</h1>
            </header>
            <div className="p-4 space-y-4">
                 <button onClick={onCreatePackage} className="w-full bg-white p-6 rounded-xl shadow-sm flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                        <FolderPlus size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-800 text-lg">Yeni Paket Oluştur</h3>
                        <p className="text-gray-500 text-sm">Kendi kelime listenizi oluşturun</p>
                    </div>
                 </button>

                 <button onClick={onBrowseReadyPackages} className="w-full bg-white p-6 rounded-xl shadow-sm flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                        <Package size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-gray-800 text-lg">Hazır Paketler</h3>
                        <p className="text-gray-500 text-sm">Uzmanlarca hazırlanan listeler</p>
                    </div>
                 </button>
            </div>
        </div>
    );
};

const CreatePackageView: React.FC<{ onBack: () => void; onSave: (name: string) => void }> = ({ onBack, onSave }) => {
    const [name, setName] = useState('');
    return (
        <div className="bg-white min-h-screen font-sans">
             <header className="bg-[#1e7eb6] p-4 flex items-center gap-4 text-white shadow-md">
                <button onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Yeni Paket</h1>
            </header>
            <div className="p-6">
                <label className="block text-gray-700 font-bold mb-2">Paket Adı</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-100 p-4 rounded-lg outline-none focus:ring-2 focus:ring-[#1e7eb6]"
                    placeholder="Örn: Tatil Kelimeleri"
                />
                <button 
                    onClick={() => onSave(name)}
                    disabled={!name}
                    className="w-full mt-6 bg-[#1e7eb6] text-white font-bold py-4 rounded-xl shadow-md disabled:opacity-50"
                >
                    OLUŞTUR
                </button>
            </div>
        </div>
    );
};

const ReadyPackagesView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    // Mock Data
    const packages = [
        { id: 1, name: 'En Çok Kullanılan 1000 Kelime', count: 1000 },
        { id: 2, name: 'Seyahat Kalıpları', count: 150 },
        { id: 3, name: 'İş Almancası', count: 300 },
    ];

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
             <header className="bg-[#1e7eb6] p-4 flex items-center gap-4 text-white shadow-md">
                <button onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Hazır Paketler</h1>
            </header>
            <div className="p-4 space-y-4">
                {packages.map(pkg => (
                    <div key={pkg.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-800">{pkg.name}</h3>
                            <p className="text-gray-500 text-sm">{pkg.count} kelime</p>
                        </div>
                        <button className="bg-[#1e7eb6] text-white px-4 py-2 rounded-lg text-sm font-bold">
                            Ekle
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AddWordView: React.FC<{ onBack: () => void; onSave: () => void }> = ({ onBack, onSave }) => {
    // State for inputs
    return (
        <div className="bg-white min-h-screen font-sans">
             <header className="bg-[#1e7eb6] p-4 flex items-center gap-4 text-white shadow-md">
                <button onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Kelime Ekle</h1>
            </header>
            <div className="p-6 space-y-4">
                 <input type="text" placeholder="Almanca Kelime" className="w-full bg-gray-100 p-4 rounded-lg outline-none" />
                 <input type="text" placeholder="Türkçe Karşılığı" className="w-full bg-gray-100 p-4 rounded-lg outline-none" />
                 <input type="text" placeholder="Örnek Cümle" className="w-full bg-gray-100 p-4 rounded-lg outline-none" />
                 
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-400">
                     <ImageIcon size={32} />
                     <span className="mt-2 text-sm">Görsel Seç / Yükle</span>
                 </div>

                 <button onClick={onSave} className="w-full bg-[#1e7eb6] text-white font-bold py-4 rounded-xl shadow-md mt-4">
                    KAYDET
                 </button>
            </div>
        </div>
    );
};

const ProgressView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
             <header className="bg-[#1e7eb6] p-4 flex items-center gap-4 text-white shadow-md">
                <button onClick={onBack}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">İlerleme Durumu</h1>
            </header>
            <div className="p-4 space-y-6">
                 {/* Stats Grid */}
                 <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                         <div className="text-2xl font-bold text-green-500">142</div>
                         <div className="text-gray-500 text-xs">Öğrenilen</div>
                     </div>
                     <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                         <div className="text-2xl font-bold text-blue-500">856</div>
                         <div className="text-gray-500 text-xs">Çalışılan</div>
                     </div>
                     <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                         <div className="text-2xl font-bold text-orange-500">12</div>
                         <div className="text-gray-500 text-xs">Seri Gün</div>
                     </div>
                     <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                         <div className="text-2xl font-bold text-purple-500">A1</div>
                         <div className="text-gray-500 text-xs">Seviye</div>
                     </div>
                 </div>

                 {/* Chart Placeholder */}
                 <div className="bg-white p-6 rounded-xl shadow-sm h-64 flex items-center justify-center">
                     <div className="text-gray-400 flex flex-col items-center">
                         <TrendingUp size={48} />
                         <span className="mt-2">Haftalık Aktivite Grafiği</span>
                     </div>
                 </div>
            </div>
        </div>
    );
};

// NEW: Home Selection View (The new Main Home)
const HomeSelectionView: React.FC<{
    onNavigate: (view: string) => void;
    onLevelSelect: (level: string) => void;
    user: { name: string } | null;
}> = ({ onNavigate, onLevelSelect, user }) => {

    const levels = [
        { id: 'A1', title: 'Başlangıç', desc: 'Temel kelimeler ve basit cümleler', color: 'bg-green-100 text-green-700', iconColor: 'bg-[#FFEB3B]', badge: 'A1', img: '🧱' },
        { id: 'A2', title: 'Temel', desc: 'Günlük rutin ve yaygın ifadeler', color: 'bg-blue-50 text-blue-700', iconColor: 'bg-[#00BCD4]', badge: 'A2', img: '☕' },
        { id: 'B1', title: 'Orta', desc: 'Konuşma ve seyahat', color: 'bg-orange-50 text-orange-700', iconColor: 'bg-[#FF9800]', badge: 'B1', img: '🧳' },
        { id: 'B2', title: 'İleri Orta', desc: 'Karmaşık metinler ve akıcılık', color: 'bg-purple-50 text-purple-700', iconColor: 'bg-[#9C27B0]', badge: 'B2', img: '📖' },
    ];

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-32">
            {/* Header */}
            <header className="bg-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <button onClick={() => onNavigate('menu')} className="p-2 -ml-2">
                    <Menu className="text-gray-700" size={28} />
                </button>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Almanca Öğren</h1>
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} alt="Profile" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-800 leading-none">{user?.name || 'Elif Kaya'}</span>
                        <button onClick={() => onNavigate('settings_view')} className="text-xs text-blue-500 font-medium text-left mt-0.5">Ayarlar</button>
                    </div>
                 </div>
            </header>

            {/* Hero Section */}
            <div className="w-full h-56 relative overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1513001900722-370f8de716dd?q=80&w=2070&auto=format&fit=crop" 
                    alt="German Learning" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                    <span className="bg-[#1e88e5] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        Yeni Başlayanlar İçin
                    </span>
                </div>
            </div>

            <div className="px-5 py-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Willkommen!</h2>
                    <p className="text-gray-500 text-sm px-4 leading-relaxed">
                        Hangi seviyede pratik yapmak istersin? Lütfen seviyenizi seçiniz.
                    </p>
                </div>

                {/* Progress Button */}
                <button 
                    onClick={() => onNavigate('progress')}
                    className="w-full bg-[#1976D2] hover:bg-[#1565C0] text-white p-4 rounded-xl shadow-lg shadow-blue-200 mb-8 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
                >
                    <SettingsIcon className="animate-spin-slow" size={24} />
                    <span className="font-bold text-lg">İlerleme Takibi</span>
                </button>

                {/* Level Cards */}
                <div className="space-y-4">
                    {levels.map((lvl) => (
                        <div 
                            key={lvl.id}
                            onClick={() => onLevelSelect(lvl.id)}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
                        >
                            <div className={`w-12 h-12 rounded-full ${lvl.color} bg-opacity-20 flex items-center justify-center font-bold text-lg shrink-0`}>
                                {lvl.badge}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">{lvl.title}</h3>
                                <p className="text-gray-500 text-xs font-medium">{lvl.desc}</p>
                            </div>
                            <div className="w-16 h-16 rounded-lg overflow-hidden relative">
                                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-3xl">
                                    {lvl.img}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* My List Card */}
                     <div 
                        onClick={() => onNavigate('package_selection')}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold shrink-0">
                            <PenTool size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">Benim Listem</h3>
                            <p className="text-gray-500 text-xs font-medium">Kendi kelimelerini ekle ve çalış</p>
                        </div>
                        <div className="w-16 h-16 rounded-lg bg-orange-100 flex items-center justify-center text-3xl">
                           📝
                        </div>
                    </div>
                </div>

                <button className="w-full text-center mt-6 text-[#1976D2] font-bold text-sm flex items-center justify-center gap-2 hover:underline">
                    <HelpCircle size={18} />
                    Seviyemi bilmiyorum
                </button>
            </div>

            {/* Bottom Fixed Button */}
            <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-100 z-40">
                <button 
                    onClick={() => onLevelSelect('A1')}
                    className="w-full bg-[#1976D2] hover:bg-[#1565C0] text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg"
                >
                    Giriş Yap
                </button>
            </div>
        </div>
    );
}

// MAIN DASHBOARD COMPONENT
const Dashboard: React.FC<DashboardProps> = ({ onStartLive }) => {
    const [view, setView] = useState('home');
    const [selectedUnit, setSelectedUnit] = useState<number>(1);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Lifted state to share between UnitDetailView and FlashcardStudyView
    const [unitWords, setUnitWords] = useState<UnitWord[]>(mockUnitWordsData);

    // Mock user for demo - in real app this comes from auth context
    const user = { name: "Elif Kaya" }; 

    const handleNavigate = (target: string) => {
        if (target === 'menu') {
            setIsMenuOpen(true);
        } else {
            setView(target);
        }
    };

    const handleUpdateWordLevel = (id: string, level: 1 | 2 | 3) => {
        setUnitWords(prevWords => prevWords.map(word => {
            if (word.id === id) {
                return { ...word, level };
            }
            return word;
        }));
    };

    const handleLevelSelect = (level: string) => {
        if (level === 'A2') {
            setUnitWords(mockA2Unit1Words);
        } else {
            setUnitWords(mockUnitWordsData); // Default to A1
        }
        setView('units_view');
    };

    return (
        <div className="relative w-full min-h-screen bg-gray-50">
             <SideMenu 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)} 
                onNavigate={(tab) => {
                    setIsMenuOpen(false);
                    setView(tab);
                }} 
            />
            
            {view === 'home' && (
                <HomeSelectionView 
                    onNavigate={handleNavigate}
                    onLevelSelect={handleLevelSelect}
                    user={user}
                />
            )}

            {view === 'units_view' && (
                <>
                    <UnitsView 
                        title="Üniteler"
                        onBack={() => setView('home')}
                        onUnitSelect={(id) => {
                            setSelectedUnit(id);
                            setView('unit_detail');
                        }}
                        isHome={false}
                    />
                    <div className="fixed bottom-6 right-6 z-40">
                         <button 
                            onClick={onStartLive}
                            className="w-14 h-14 bg-[#1e7eb6] rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform"
                        >
                            <MessageCircle size={28} />
                        </button>
                    </div>
                </>
            )}

            {view === 'search_view' && <SearchView onBack={() => setView('home')} />}
            
            {view === 'package_selection' && (
                <PackageSelectionView 
                    onBack={() => setView('home')} 
                    onCreatePackage={() => setView('create_package')}
                    onBrowseReadyPackages={() => setView('ready_packages')}
                />
            )}

            {view === 'create_package' && <CreatePackageView onBack={() => setView('package_selection')} onSave={(name) => { console.log(name); setView('package_selection'); }} />}
            {view === 'ready_packages' && <ReadyPackagesView onBack={() => setView('package_selection')} />}
            {view === 'help_view' && <HelpView onBack={() => setView('home')} />}
            {view === 'settings_view' && <Settings onBack={() => setView('home')} />}
            
            {view === 'unit_detail' && (
                <UnitDetailView 
                    unitId={selectedUnit} 
                    onBack={() => setView('units_view')} 
                    words={unitWords}
                    onUpdateWordLevel={handleUpdateWordLevel}
                    onStartStudying={() => setView('flashcard_study')}
                    onStartMultipleChoice={() => setView('multiple_choice')}
                />
            )}

            {view === 'flashcard_study' && (
                <FlashcardStudyView 
                    words={unitWords} 
                    onBack={() => setView('unit_detail')}
                    onUpdateLevel={handleUpdateWordLevel}
                />
            )}

            {view === 'multiple_choice' && (
                <MultipleChoiceQuizView 
                    words={unitWords} 
                    unitId={selectedUnit}
                    onBack={() => setView('unit_detail')}
                    onUpdateLevel={handleUpdateWordLevel}
                />
            )}

            {view === 'add_word' && <AddWordView onBack={() => setView('home')} onSave={() => setView('home')} />}
            {view === 'progress' && <ProgressView onBack={() => setView('home')} />}
            
        </div>
    );
};

export default Dashboard;