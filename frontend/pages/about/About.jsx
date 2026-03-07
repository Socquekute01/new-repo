import React from 'react';
import { ShoppingBag, Users, Award, TrendingUp, Heart, Shield } from 'lucide-react';
import Header from '../../src/components/header/Header';
import Footer from '../../src/components/footer/Footer';

const About = () => {
    const stats = [
        { label: 'Products', value: '1000+', icon: ShoppingBag },
        { label: 'Happy Customers', value: '50K+', icon: Users },
        { label: 'Awards Won', value: '15+', icon: Award },
        { label: 'Years Experience', value: '10+', icon: TrendingUp }
    ];

    const values = [
        {
            icon: Heart,
            title: 'Customer First',
            description: 'We prioritize our customers satisfaction above everything else. Your happiness is our success.'
        },
        {
            icon: Shield,
            title: 'Quality Guaranteed',
            description: 'All our products are carefully selected and verified to ensure the highest quality standards.'
        },
        {
            icon: Award,
            title: 'Excellence',
            description: 'We strive for excellence in every aspect of our business, from products to customer service.'
        },
        {
            icon: Users,
            title: 'Community',
            description: 'Building a strong community of fashion enthusiasts who share our passion for style and quality.'
        }
    ];

    const team = [
        {
            name: 'John Smith',
            position: 'Founder & CEO',
            image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop'
        },
        {
            name: 'Sarah Johnson',
            position: 'Creative Director',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop'
        },
        {
            name: 'Michael Chen',
            position: 'Head of Operations',
            image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop'
        },
        {
            name: 'Emily Davis',
            position: 'Marketing Manager',
            image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop'
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            <Header />

            {/* Hero Section */}
            <div className="relative w-full h-96 md:h-[500px] bg-gray-900 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80"
                        alt="About Us"
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center z-20 px-4 max-w-4xl">
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                            About Us
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200">
                            Redefining fashion with passion, quality, and innovation since 2014
                        </p>
                    </div>
                </div>
            </div>

            {/* Our Story Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Our Story
                        </h2>
                        <div className="space-y-4 text-gray-600 text-lg">
                            <p>
                                Founded in 2014, our journey began with a simple mission: to bring high-quality,
                                stylish products to fashion enthusiasts worldwide. What started as a small boutique
                                has grown into a thriving e-commerce platform serving thousands of customers globally.
                            </p>
                            <p>
                                We believe that fashion is more than just clothing—it's a form of self-expression.
                                That's why we carefully curate every product in our collection, ensuring it meets
                                our high standards for quality, style, and sustainability.
                            </p>
                            <p>
                                Today, we're proud to be a leading destination for fashion-forward individuals who
                                refuse to compromise on quality or style. Our commitment to excellence has earned
                                us the trust and loyalty of over 50,000 customers worldwide.
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80"
                            alt="Our Store"
                            className="rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gray-900 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
                                        <Icon size={32} className="text-white" />
                                    </div>
                                    <div className="text-4xl font-bold mb-2">{stat.value}</div>
                                    <div className="text-gray-300 text-lg">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Our Values Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Our Values
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        The principles that guide everything we do
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {values.map((value, index) => {
                        const Icon = value.icon;
                        return (
                            <div key={index} className="text-center p-6 hover:shadow-xl transition-shadow duration-300 rounded-lg">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-black text-white rounded-full mb-6">
                                    <Icon size={36} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {value.title}
                                </h3>
                                <p className="text-gray-600">
                                    {value.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Team Section */}
            <div className="bg-gray-50 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Meet Our Team
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            The passionate people behind our success
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {team.map((member, index) => (
                            <div key={index} className="group">
                                <div className="relative overflow-hidden rounded-lg mb-4 aspect-square">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {member.name}
                                    </h3>
                                    <p className="text-gray-600">{member.position}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="bg-gradient-to-r from-gray-900 to-black text-white rounded-2xl p-12 md:p-16 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Our Mission
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                        To empower individuals to express themselves through fashion by providing
                        exceptional products, outstanding service, and an inspiring shopping experience
                        that celebrates diversity, creativity, and personal style.
                    </p>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gray-50 py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Join Our Journey
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Be part of our growing community and discover your perfect style
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/shop"
                            className="bg-black text-white font-bold px-8 py-4 rounded-lg hover:bg-gray-800 transition-colors duration-300 text-lg"
                        >
                            Shop Now
                        </a>
                        <a
                            href="/contact"
                            className="bg-white text-black font-bold px-8 py-4 rounded-lg border-2 border-black hover:bg-gray-100 transition-colors duration-300 text-lg"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default About;