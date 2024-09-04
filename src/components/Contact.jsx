import React, { useState, useRef, useEffect } from 'react';
import emailjs from 'emailjs-com';

export default function Contact() {
    const form = useRef();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleContactSubmit = (e) => {
        e.preventDefault();
        setSending(true);

        const SERVICE_ID = process.env.REACT_APP_SERVICE_ID;
        const TEMPLATE_ID = process.env.REACT_APP_TEMPLATE_ID;
        const PUBLIC_KEY = process.env.REACT_APP_PUBLIC_KEY;
        emailjs
            .sendForm(SERVICE_ID, TEMPLATE_ID, form.current, PUBLIC_KEY)
            .then(
                () => {
                    setSending(false);
                    setSent(true);
                    setName('');
                    setEmail('');
                    setMessage('')
                },
                (error) => {
                    setSending(false);
                    setSent(false);
                    console.log('Failed to send email. Error: ', error);
                },
            );
    };

    useEffect(() => {
        if (sent === true) {
            const timer = setTimeout(() => {
                setSent(false);
            }, 5000);
            return () => clearTimeout(timer);
        }

    }, [sent])

    return (
        <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6 rounded-lg text-gray-800 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Contact Us</h2>

            <form
                ref={form}
                onSubmit={handleContactSubmit}
                className="space-y-4"
            >
                <div>
                    <label htmlFor="user_name" className="block text-sm font-medium text-gray-900">
                        Name
                    </label>
                    <input
                        type="text"
                        id="user_name"
                        name="user_name"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white p-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="user_email" className="block text-sm font-medium text-gray-900">
                        Email
                    </label>
                    <input
                        type="email"
                        id="user_email"
                        name="user_email"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white p-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-900">
                        Message
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        rows="4"
                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white p-2"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    ></textarea>
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${sending ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        disabled={sending}
                    >
                        {sending ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
                {sent && (
                    <div className="text-green-600 mt-2">
                        Email sent successfully! We will get back to you soon.
                    </div>
                )}
            </form>

            <div className="mt-8">
                <p className="text-gray-900">
                    For any inquiries or questions, please reach out to us using the form above. We typically respond within 1-2 business days.
                </p>
                <p className="text-gray-900 mt-2">
                    You can also contact us directly at:
                </p>
                <p className="text-gray-900 mt-1">
                    Company Name <br />
                    Address <br />
                    City, State, Zip Code <br />
                    Email: <a href="mailto:info@company.com" className="text-blue-500">info@company.com</a> <br />
                    Phone: <span className="text-blue-500">+1234567890</span>
                </p>
            </div>
        </div>
    );
}