import React, { useState } from 'react';
import { ViewState } from '../types';
import { ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    bg: 'bg-[#00BCD4]', // Cyan
    title: 'Kelime öğrenmenin en etkili yolu',
    desc: 'İhtiyacınız olan kelimeleri görseller yardımıyla kolayca öğrenin.',
    imageIcon: '🤔', 
    imageTitle: 'confuse',
    imageSub: 'kafa karıştırmak'
  },
  {
    bg: 'bg-[#8BC34A]', // Green
    title: 'Öğrendiklerinizi test edin',
    desc: 'Quiz ve testlerle kendinizi değerlendirip öğrendiklerinizi pekiştirin.',
    imageIcon: '🔊',
    imageTitle: 'abuse',
    imageSub: 'kötüye kullanmak'
  },
  {
    bg: 'bg-[#E91E63]', // Pink
    title: 'Yanlışlarınızı hemen görün',
    desc: 'Yanlış cevapladığınız kelimelere anında göz atın, isterseniz zor kelimelere odaklanın.',
    imageIcon: '🏃',
    imageTitle: 'overcome',
    imageSub: 'yenmek, üstesinden gelmek'
  },
  {
    bg: 'bg-[#FF9800]', // Orange
    title: 'Zor kelimeleri daha kolay öğrenin',
    desc: 'Zorlandığınız kelimeleri zamanlanmış bildirimlerle daha kolay öğrenin.',
    imageIcon: '🍎',
    imageTitle: 'decompose',
    imageSub: 'çürümek, ayrışmak'
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className={`flex flex-col h-screen w-full transition-colors duration-500 ease-in-out ${currentSlide.bg} text-white`}>
      {/* Visual Area (Circle/Mockup) */}
      <div className="flex-1 flex items-center justify-center relative p-6">
        <div className="bg-white rounded-full w-64 h-64 md:w-80 md:h-80 flex flex-col items-center justify-center text-gray-800 shadow-2xl relative overflow-hidden">
             {/* Mock Content inside circle based on slide */}
             <div className="text-center p-4">
                <h3 className="text-2xl font-bold mb-1">{currentSlide.imageTitle}</h3>
                <p className="text-sm text-gray-500 mb-4">{currentSlide.imageSub}</p>
                <div className="text-6xl animate-bounce">{currentSlide.imageIcon}</div>
             </div>
             {/* Decorative UI elements for specific slides */}
             {currentIndex === 1 && (
                 <div className="absolute bottom-4 w-3/4 space-y-1">
                     <div className="h-2 bg-green-500 rounded-full w-full"></div>
                     <div className="h-2 bg-red-400 rounded-full w-2/3"></div>
                 </div>
             )}
        </div>
      </div>

      {/* Text Content */}
      <div className="flex-1 flex flex-col items-center text-center px-8 pt-8 pb-12">
        <h2 className="text-3xl font-bold mb-6">{currentSlide.title}</h2>
        <p className="text-lg opacity-90 leading-relaxed max-w-md">
          {currentSlide.desc}
        </p>
      </div>

      {/* Footer Controls */}
      <div className="h-20 w-full flex items-center justify-between px-6 pb-6">
        <button 
            onClick={handleSkip} 
            className="font-bold text-lg tracking-wide hover:opacity-80"
        >
          ATLA
        </button>

        <div className="flex space-x-2">
            {slides.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                />
            ))}
        </div>

        <button 
            onClick={handleNext}
            className="flex items-center font-bold text-lg tracking-wide hover:opacity-80"
        >
            {currentIndex === slides.length - 1 ? 'BAŞLA' : <ChevronRight size={32} />}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
