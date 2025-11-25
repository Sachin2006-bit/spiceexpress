import { useRef } from 'react';

const ClientLogos = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Client logos - replace with actual client logos
    const clients = [
        { name: 'Global Auto', logo: '🚗' },
        { name: 'Tata Hitachi', logo: '🏗️' },
        { name: 'Mindray', logo: '🏥' },
        { name: 'ZIM Logistics', logo: '🚢' },
        { name: 'Mahindra', logo: '🚜' },
        { name: 'Asian Paints', logo: '🎨' },
        { name: 'Godrej', logo: '🏢' },
        { name: 'Reliance', logo: '⚡' },
    ];

    return (
        <section className="py-16 px-6 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
                    Trusted by India's Leading Companies
                </h3>
                <div className="relative overflow-hidden">
                    {/* Gradient overlays */}
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10" />
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10" />

                    {/* Scrolling container */}
                    <div className="flex gap-12 animate-scroll" ref={scrollRef}>
                        {/* First set */}
                        {clients.map((client, index) => (
                            <div
                                key={`first-${index}`}
                                className="flex-shrink-0 w-40 h-24 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center gap-2 hover-scale transition-smooth border border-gray-200"
                            >
                                <span className="text-4xl">{client.logo}</span>
                                <span className="text-sm font-medium text-gray-700">{client.name}</span>
                            </div>
                        ))}
                        {/* Duplicate set for seamless loop */}
                        {clients.map((client, index) => (
                            <div
                                key={`second-${index}`}
                                className="flex-shrink-0 w-40 h-24 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center gap-2 hover-scale transition-smooth border border-gray-200"
                            >
                                <span className="text-4xl">{client.logo}</span>
                                <span className="text-sm font-medium text-gray-700">{client.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
        </section>
    );
};

export default ClientLogos;
