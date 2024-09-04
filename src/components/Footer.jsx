import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Importing components
import ModalPopup from './ModalPopup';
import PrivacyPolicy from './PrivacyPolicy';
import Licensing from './Licensing';
import Contact from './Contact';

const Footer = () => {
  const [isPrivacyPolicyModalOpen, setIsPrivacyPolicyModalOpen] = useState(false);
  const [isLicensingModalOpen, setIsLicensingModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const openPrivacyPolicyModal = () => {
    setIsPrivacyPolicyModalOpen(true);
  }

  const closePrivacyPolicyModal = () => {
    setIsPrivacyPolicyModalOpen(false);
  }

  const openLicensingModal = () => {
    setIsLicensingModalOpen(true);
  }

  const closeLicensingModal = () => {
    setIsLicensingModalOpen(false);
  }

  const openContactModal = () => {
    setIsContactModalOpen(true);
  }

  const closeContactModal = () => {
    setIsContactModalOpen(false);
  }

  return (
    <footer className="bg-white rounded-lg shadow-md dark:shadow-none shadow-gray-600 m-4 dark:bg-gray-800 fixed bottom-[-0.5em] w-[97.7%]">
      <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">&copy; 2024 <a href="https://newsfeed.com/" className="hover:underline">ChainSphere</a>. All Rights Reserved.
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
          <li>
            <Link to="/aboutus" className="hover:underline me-4 md:me-6 cursor-pointer">About</Link>
          </li>
          <li>
            <span
              className="hover:underline me-4 md:me-6 cursor-pointer"
              onClick={openPrivacyPolicyModal}
            >Privacy Policy</span>
          </li>
          <li>
            <span
              className="hover:underline me-4 md:me-6 cursor-pointer"
              onClick={openLicensingModal}
            >Licensing</span>
          </li>
          <li>
            <span
              className="hover:underline cursor-pointer"
              onClick={openContactModal}
            >Contact</span>
          </li>
        </ul>
      </div>
      <ModalPopup isOpen={isPrivacyPolicyModalOpen} onRequestClose={closePrivacyPolicyModal} title="Privacy Poliy">
        <PrivacyPolicy />
      </ModalPopup>
      <ModalPopup isOpen={isLicensingModalOpen} onRequestClose={closeLicensingModal} title="Licensing">
        <Licensing />
      </ModalPopup>
      <ModalPopup isOpen={isContactModalOpen} onRequestClose={closeContactModal} title="Contact">
        <Contact />
      </ModalPopup>
    </footer>
  );
};

export default Footer;
