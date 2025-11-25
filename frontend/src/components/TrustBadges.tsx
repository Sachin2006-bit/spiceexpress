import { Shield, Award, CheckCircle2, TrendingUp } from 'lucide-react';

const TrustBadges = () => {
    return (
        <section className="py-12 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Badge 1 */}
                    <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 card-hover">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--brand-navy)' }}>
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div className="font-bold text-2xl mb-1" style={{ color: 'var(--brand-navy)' }}>ISO</div>
                        <div className="text-sm text-gray-600">Certified</div>
                    </div>

                    {/* Badge 2 */}
                    <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gradient-to-br from-red-50 to-white border border-red-100 card-hover">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--brand-red)' }}>
                            <Award className="w-8 h-8 text-white" />
                        </div>
                        <div className="font-bold text-2xl mb-1" style={{ color: 'var(--brand-red)' }}>5000+</div>
                        <div className="text-sm text-gray-600">Happy Clients</div>
                    </div>

                    {/* Badge 3 */}
                    <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-white border border-green-100 card-hover">
                        <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <div className="font-bold text-2xl text-green-600 mb-1">99.8%</div>
                        <div className="text-sm text-gray-600">On-Time Delivery</div>
                    </div>

                    {/* Badge 4 */}
                    <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 card-hover">
                        <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center mb-4">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <div className="font-bold text-2xl text-purple-600 mb-1">30%</div>
                        <div className="text-sm text-gray-600">Cost Savings</div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TrustBadges;
