import React from 'react';

export default function Licensing() {
    return (
        <section className="bg-gradient-to-br from-green-100 via-yellow-100 to-orange-100 p-6 rounded-lg text-gray-800 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Licensing Information</h2>
            <p className="mb-4">
                This Licensing Information section explains the terms and conditions under which our products and services are licensed to you. Please read this information carefully.
            </p>

            <h3 className="text-xl font-semibold mt-4 text-gray-900">License Agreement</h3>
            <p className="mb-4">
                By using our products or services, you agree to be bound by the terms of our License Agreement. This Agreement governs your use of our software, applications, and any related services.
            </p>

            <h3 className="text-xl font-semibold mt-4 text-gray-900">Usage Rights</h3>
            <p className="mb-4">
                You are granted a non-exclusive, non-transferable license to use our products and services subject to the terms outlined in the License Agreement. This license permits you to use our products for personal or commercial purposes as specified.
            </p>

            <h3 className="text-xl font-semibold mt-4 text-gray-900">Restrictions</h3>
            <p className="mb-4">
                You may not modify, reproduce, distribute, or resell our products or any part thereof without explicit permission. Violation of these restrictions may result in legal action and termination of your license.
            </p>

            <h3 className="text-xl font-semibold mt-4 text-gray-900">Termination</h3>
            <p className="mb-4">
                Your license may be terminated if you fail to comply with the terms of the License Agreement. Upon termination, you must cease all use of our products and services and destroy any copies in your possession.
            </p>
        </section>
    );
}