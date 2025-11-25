import { useCountUp } from '../lib/animations';

const AboutStats = () => {
  const stats = [
    { end: 250, suffix: '+', label: 'Dedicated Professionals' },
    { end: 24, suffix: '/7', label: 'Operations' },
    { end: 6, suffix: ' Years', label: 'Industry Experience' },
    { end: 1000, suffix: '+', label: 'Happy Clients' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
      {stats.map((stat, index) => {
        const { count, elementRef } = useCountUp(stat.end, 2000);
        return (
          <div
            key={index}
            ref={elementRef}
            className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover-lift transition-all duration-300"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            <div
              className="text-4xl md:text-2xl font-extrabold mb-2"
              style={{ color: 'var(--brand-red)' }}
            >
              {count}
              {stat.suffix}
            </div>
            <div className="text-sm md:text-base text-gray-700 font-medium text-center">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AboutStats;
