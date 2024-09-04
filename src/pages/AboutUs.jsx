import React from 'react';
import { motion } from 'framer-motion';

export default function AboutUs() {
    return (
        <main className="text-black bg-white dark:text-white dark:bg-black mt-24 min-h-screen">
            <div className="w-[70%] mx-auto p-8 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold mb-4">About Us</h1>
                    <p className="text-xl text-gray-700 dark:text-gray-300">
                        We are dedicated to providing the latest news and insights across various domains.
                    </p>
                </motion.div>
                
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="flex flex-col md:flex-row md:space-x-6"
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="mb-6 md:mb-0"
                    >
                        <img
                            src="/pageBackground/generalBg.jpg"
                            alt="Team"
                            className="w-full h-64 object-cover rounded-lg"
                        />
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="flex-1"
                    >
                        <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4">
                            Our mission is to provide accurate and timely news articles to keep our audience informed about the latest events and trends. We cover a wide range of topics including finance, technology, health, and more.
                        </p>
                        <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
                        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                            We envision a world where everyone has access to reliable information and can stay updated with the most recent developments. We strive to be the trusted source for news and knowledge.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </main>
    );
}