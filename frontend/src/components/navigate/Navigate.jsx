import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navigate = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      id: 1,
      leftTitle: 'NEW COLLECTION',
      leftSubtitle: 'SHOP NOW',
      rightTitle: 'FPT®',
      rightSubtitle: 'THE ROLLING STONES',
      leftImage: 'https://i.pinimg.com/736x/bf/31/8c/bf318c439bd433880bf729504c8fc1e3.jpg',
      rightImage: 'https://i.pinimg.com/736x/ae/e2/1f/aee21fbe2ef1b99629a753ead2067fa2.jpg',
      leftBg: 'bg-gradient-to-b from-red-700 to-amber-900',
      rightBg: 'bg-amber-900'
    },
    {
      id: 2,
      leftTitle: 'SUMMER 2024',
      leftSubtitle: 'SHOP NOW',
      rightTitle: 'EXCLUSIVE',
      rightSubtitle: 'COLLECTION',
      leftImage: 'https://i.pinimg.com/736x/49/a2/16/49a21650f366b7892a4aeaee996b9d88.jpg',
      rightImage: 'https://i.pinimg.com/736x/8f/bd/74/8fbd7481a68b226f42f8ee6217cdee0a.jpg',
      leftBg: 'bg-gradient-to-b from-blue-700 to-blue-900',
      rightBg: 'bg-blue-900'
    },
    {
      id: 3,
      leftTitle: 'SPECIAL OFFER',
      leftSubtitle: 'SHOP NOW',
      rightTitle: 'LIMITED',
      rightSubtitle: 'EDITION',
      leftImage: 'https://i.pinimg.com/736x/51/b5/5f/51b55f823cb8d028d2c220a40f5e55ea.jpg',
      rightImage: 'https://i.pinimg.com/736x/c0/a6/3d/c0a63d21cc8defc9205be2b07f2a50f2.jpg',
      leftBg: 'bg-gradient-to-b from-purple-700 to-purple-900',
      rightBg: 'bg-purple-900'
    }
  ];

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 2000); // Chuyển slide mỗi 2 giây

      return () => clearInterval(interval);
    }
  }, [isPaused, slides.length]);

  const slide = slides[currentSlide];

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Banner Container */}
      <div className="relative flex h-screen md:h-96 lg:h-screen">

        {/* Left Section - NEW COLLECTION */}
        <div className={`w-full md:w-1/2 ${slide.leftBg} relative flex items-center justify-center overflow-hidden group`}>
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={slide.leftImage}
              alt={slide.leftTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 px-8 text-white text-center md:text-left">
            <h1 className="text-4xl md:text-3xl lg:text-5xl font-bold mb-4 tracking-wider">
              {slide.leftTitle}
            </h1>
            <button
              onClick={() => navigate('/shop')}
              className="bg-white text-black font-bold px-6 py-3 text-lg hover:bg-gray-200 transition-colors duration-300 hover:scale-105 transform">
              {slide.leftSubtitle}
            </button>
          </div>

          {/* Decorative Pattern */}
          <div className="absolute bottom-0 right-0 opacity-10 text-white">
            <div className="text-9xl font-bold">★</div>
          </div>
        </div>

        {/* Right Section - DIRTYCOINS & THE ROLLING STONES */}
        <div className={`hidden md:flex w-1/2 ${slide.rightBg} relative items-center justify-center overflow-hidden`}>
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={slide.rightImage}
              alt={slide.rightTitle}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-black/60 to-black/30"></div>
          </div>

          <div className="relative z-10 text-center px-8">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-wider">
              {slide.rightTitle}
            </h2>
            <p className="text-2xl lg:text-4xl font-bold text-white mb-12">
              {slide.rightSubtitle}
            </p>

            {/* Logo Placeholders */}
            <div className="flex gap-8 justify-center items-center mb-12">
              {/* Dirty Coins Logo */}
              <div className="border-2 border-red-500 p-4 rounded-lg">
                <div className="text-white font-bold text-2xl">DC</div>
              </div>
              {/* Rolling Stones Logo */}
              <div className="border-2 border-white p-4 rounded-lg">
                <div className="text-white font-bold text-2xl">RS</div>
              </div>
            </div>

            {/* COLLABORATION Text */}
            <div className="text-white text-lg font-light tracking-widest">
              COLLABORATION
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 ${index === currentSlide
              ? 'w-8 h-2 bg-white'
              : 'w-2 h-2 bg-gray-400 hover:bg-gray-300'
              } rounded-full`}
          />
        ))}
      </div>

      {/* Previous Button */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all duration-300"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Next Button */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all duration-300"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default Navigate;