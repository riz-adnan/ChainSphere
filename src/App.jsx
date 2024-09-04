import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// Importing context
import { ThemeProvider } from './context/ThemeContext';

// Importing pages
import Home from './pages/Home';
import Publish from './pages/Publish'
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import NewsPage from './pages/NewsPage';
import Finance from './pages/Finance';
import AboutUs from './pages/AboutUs';

// Importing components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App() {
  const [account, setAccount] = useState('0x0');
  
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Navbar
          account={account}
          setAccount={setAccount}
        />
        <Routes>
          <Route path="/" element={<Home account={account} setAccount={setAccount} />} />
          <Route path='/newsFeed' element={<Explore account={account} setAccount={setAccount} />} />
          <Route path='/publishNew' element={<Publish />} />
          <Route path='/profile/:userAdd' element={<Profile account={account} />} />
          <Route path='/newsFeed/:category/:feedId' element={<NewsPage account={account} setAccount={account} />} />
          <Route path='/finance' element={<Finance />} />
          <Route path='/aboutus' element={<AboutUs />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </ThemeProvider>
  )
}