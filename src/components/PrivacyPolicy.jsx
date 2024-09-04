import React from 'react';

export default function PrivacyPolicy() {
    return (
        <section className="bg-gradient-to-br from-yellow-100 via-red-100 to-pink-100 p-6 rounded-lg text-gray-800 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Privacy Policy</h2>
            <p className="mb-4">
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully.
            </p>

            <h3 className="text-xl font-semibold mt-4 text-gray-900">Information Collection</h3>
            <p className="mb-2">
                We may collect information about you in a variety of ways. The information we may collect on the Site includes:
            </p>
            <ul className="list-disc list-inside ml-4 mb-4">
                <li className="mb-2">Personal Data</li>
                <li className="mb-2">Derivative Data</li>
                <li className="mb-2">Financial Data</li>
                <li className="mb-2">Data from Social Networks</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 text-gray-900">Use of Your Information</h3>
            <p className="mb-4">
                Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
            </p>
            <ul className="list-disc list-inside ml-4 mb-4">
                <li className="mb-2">Create and manage your account.</li>
                <li className="mb-2">Email you regarding your account or order.</li>
                <li className="mb-2">Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 text-gray-900">Disclosure of Your Information</h3>
            <p className="mb-4">
                We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
            </p>
            <ul className="list-disc list-inside ml-4 mb-4">
                <li className="mb-2">By Law or to Protect Rights</li>
                <li className="mb-2">Third-Party Service Providers</li>
                <li className="mb-2">Business Transfers</li>
                <li className="mb-2">Affiliates</li>
            </ul>

            <h3 className="text-xl font-semibold mt-4 text-gray-900">Security of Your Information</h3>
            <p className="mb-4">
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>

            <h3 className="text-xl font-semibold mt-4 text-gray-900">Policy for Children</h3>
            <p className="mb-4">
                We do not knowingly solicit information from or market to children under the age of 13. If we learn that we have collected information from a child under age 13 without verification of parental consent, we will delete that information as quickly as possible.
            </p>

            <h3 className="text-xl font-semibold mt-4 text-gray-900">Contact Us</h3>
            <p className="mb-4">
                If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <p className="mb-4">
                Company Name <br />
                Address <br />
                City, State, Zip Code <br />
                Email: <a href="mailto:info@company.com" className="text-blue-500">info@company.com</a>
            </p>
        </section>
    );
}