import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import Header from '../../src/components/header/Header';
import Footer from '../../src/components/footer/Footer';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setSubmitStatus('success');
            setIsSubmitting(false);
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: ''
            });

            setTimeout(() => setSubmitStatus(null), 5000);
        }, 1500);
    };

    return (
        <div className="bg-white min-h-screen">
            <Header />

            {/* Hero Section */}
            <div className="relative w-full h-64 md:h-96 overflow-hidden">
                {/* Background Image */}
                <img
                    src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80"
                    alt="Contact Us Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/50"></div>

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center z-20 px-4">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                            Contact Us
                        </h1>
                        <p className="text-lg text-gray-300">
                            We'd love to hear from you. Get in touch with us!
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Information */}
                    <div className="lg:col-span-1 space-y-6">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                Get In Touch
                            </h2>
                            <p className="text-gray-600 mb-8">
                                Have a question or feedback? Fill out the form and we'll get back to you as soon as possible.
                            </p>
                        </div>

                        {/* Contact Details */}
                        <div className="space-y-6">
                            {/* Email */}
                            <div className="flex items-start space-x-4">
                                <div className="bg-black text-white p-3 rounded-lg">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                                    <p className="text-gray-600">support@ecommerce.com</p>
                                    <p className="text-gray-600">info@ecommerce.com</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-start space-x-4">
                                <div className="bg-black text-white p-3 rounded-lg">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                                    <p className="text-gray-600">+84 123 456 789</p>
                                    <p className="text-gray-600">+84 987 654 321</p>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="flex items-start space-x-4">
                                <div className="bg-black text-white p-3 rounded-lg">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                                    <p className="text-gray-600">
                                        Lô E2a-7, Đường D1, Đ. D1<br />
                                        Khu Công nghệ cao, Thủ Đức<br />
                                        Ho Chi Minh City, Vietnam
                                    </p>
                                </div>
                            </div>

                            {/* Working Hours */}
                            <div className="flex items-start space-x-4">
                                <div className="bg-black text-white p-3 rounded-lg">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Working Hours</h3>
                                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                                    <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                                    <p className="text-gray-600">Sunday: Closed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Send Us A Message
                            </h2>

                            {submitStatus === 'success' && (
                                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                                    Thank you! Your message has been sent successfully. We'll get back to you soon.
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Your Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Your Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Phone */}
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder="+84 123 456 789"
                                        />
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder="How can we help?"
                                        />
                                    </div>
                                </div>

                                {/* Message */}
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="6"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                                        placeholder="Tell us more about your inquiry..."
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-black text-white font-bold py-4 rounded-lg hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={20} />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                        Visit Our Store
                    </h2>
                    <div className="bg-gray-200 rounded-lg overflow-hidden shadow-lg h-96 flex items-center justify-center">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.4545361678226!2d106.7621585!3d10.8411276!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2sFPT%20University%20HCMC!5e0!3m2!1sen!2s!4v1234567890"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Store Location"
                        />
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Contact;