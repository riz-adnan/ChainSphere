import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Importing components
import DatePickerComponent from '../components/DatePickerComponent';
import LocationPicker from '../components/MapPicker';
import ModalPopup from '../components/ModalPopup';
import TermsAndConditions from '../components/TermsAndConditions';

// import { set } from 'date-fns';
import ArticleStorage from '../contracts/ArticleStorage.json'
const { ethers } = require("ethers");

const contractABI = ArticleStorage.abi;


const contractAddress = '0xc4ee449dc12ac2c9316bf52abb868f1ff80e4b28';
const RSK_TESTNET_URL = 'https://public-node.testnet.rsk.co';

async function getProvider() {
    if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        return provider;
    } else {
        const provider = new ethers.providers.JsonRpcProvider(RSK_TESTNET_URL);
        return provider;
    }
}

async function getContract() {
    const provider = await getProvider();
    if (provider) {
        const signer = provider.getSigner();
        return new ethers.Contract(contractAddress, contractABI, signer);
    } else {
        return null;
    }
}

export default function Publish() {
    const [typeOfNews, setTypeOfNews] = useState('stock');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [location, setLocation] = useState(null);
    const navigate = useNavigate();
    const [articleDetails, setArticleDetails] = useState({
        'Title': '',
        'Tags': ['Article', 'Stock'],
        'BgImg': '',
        'Article': '',
        'VisibleLimit': 20,
        'Price': 17326e9,
    });
    const [uploadedFile, setUploadedFile] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [price, setPrice] = useState(1);

    const openModal = () => {
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);
    }

    const handleTitleChange = (e) => {
        setArticleDetails(prevState => ({
            ...prevState,
            Title: e.target.value,
        }))
    }

    const handleVisibleWordChange = (e) => {
        setArticleDetails(prevState => ({
            ...prevState,
            VisibleLimit: e.target.value,
        }));
    }

    const handlePriceChange = (e) => {
        let price;
        if (e.target.value <= 5) {
            price = Math.round((e.target.value / 57716.66) * 1e18);
            setPrice(e.target.value);
        } else {
            alert('Price must be less than $5');
            setPrice(5);
            price = Math.round((5 / 57716.66) * 1e18);
        }
        console.log(price)
        setArticleDetails(prevState => ({
            ...prevState,
            Price: price
        }))
    }

    const handleTagsChange = (e) => {
        const tagsInput = e.target.value;
        const tagsArray = tagsInput.split(',').map(tag => tag.trim());

        setArticleDetails(prevState => ({
            ...prevState,
            Tags: tagsArray,
        }));
    };

    const handleBgChange = (e) => {
        setArticleDetails(prevState => ({
            ...prevState,
            BgImg: e.target.value,
        }));
    }

    const handleArticleChange = (event) => {
        const newFile = event.target.files[0];
        let validFile = null;
        if (newFile.type === 'application/pdf' || newFile.type === 'application/msword') {
            validFile = newFile;
            setUploadedFile(validFile);
        } else {
            setUploadedFile(null);
        }
    };

    const handleArticleTextChange = (e) => {
        setArticleDetails(prevState => ({
            ...prevState,
            Article: e.target.value,
        }));
    }

    const handleStockSubmit = async (e) => {
        e.preventDefault();
        if (termsAccepted === false) {
            alert('Please accept the terms and conditions to proceed!');
            return;
        }
        console.log('Printing here!')
        const contract = await getContract();
        if (contract) {
            try {
                //const price = ethers.BigNumber.from(articleDetails.Price.toString());
                const concatenatedArticle = `${articleDetails.Title}%${articleDetails.Article}`;
                const tx = await contract.storeStockArticle(
                    articleDetails.Tags,
                    articleDetails.BgImg,
                    concatenatedArticle,
                    articleDetails.VisibleLimit,
                    articleDetails.Price,
                    0, // Assuming aiRating
                    0, // Assuming userRating
                    Math.floor(startDate.getTime() / 1000),
                    Math.floor(endDate.getTime() / 1000)
                );
                await tx.wait();
                console.log('Stock article stored successfully');
                alert("Article Published Successful")
                navigate(`/newsFeed`);
            } catch (error) {
                console.error('Error storing stock article:', error);
            }
        }
    }

    const handleGeneralSubmit = async (e) => {
        e.preventDefault();
        if (termsAccepted === false) {
            alert('Please accept the terms and conditions to proceed!');
            return;
        }
        const contract = await getContract();
        if (contract) {
            try {

                const latitude = location ? Math.round(location.lat * 1e6) : 0;
                const longitude = location ? Math.round(location.lng * 1e6) : 0;
                const concatenatedArticle = `${articleDetails.Title}%${articleDetails.Article}`;
                const tx = await contract.storeGeneralArticle(
                    articleDetails.Tags,
                    articleDetails.BgImg,
                    concatenatedArticle,
                    articleDetails.VisibleLimit,
                    articleDetails.Price,
                    0, // Assuming aiRating
                    0, // Assuming userRating
                    latitude,
                    longitude
                );
                await tx.wait();
                console.log('General article stored successfully');
                alert("Article Published Successful")
                navigate(`/newsFeed`);
            } catch (error) {
                console.error('Error storing general article:', error);
            }
        }
    };

    useEffect(() => {
        const getTextFromPDF = async () => {
            try {
                const formData = new FormData();
                formData.append('file', uploadedFile);
                const response = await axios.post('/get_pdf_text', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                if (response.data) {
                    const data = await response.data.output;
                    setArticleDetails(prevState => ({
                        ...prevState,
                        Article: data,
                    }))
                }
            } catch (error) {
                console.log('Error getting text from PDF: ', error.message);
            }
        }

        getTextFromPDF();
    }, [uploadedFile])

    return (
        <main className='bg-white dark:bg-black mt-28 flex flex-col pb-12'>
            <div className="h-full w-full dark:bg-black bg-white  dark:bg-grid-white/[0.2] bg-grid-black/[0.2] relative flex items-center justify-center">
                <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:[mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

                <div className='pb-10'>
                    <div className='w-[60vw] mx-auto flex justify-around items-center'>
                        <button
                            onClick={() => setTypeOfNews('stock')}
                            className={`relative inline-flex items-center justify-center p-0.5 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-full group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white ${typeOfNews === 'stock' ? 'ring-4 outline-none ring-pink-200 dark:ring-pink-800' : ''}`}
                        >
                            <span className="w-[28em] relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-full group-hover:bg-opacity-0">
                                Stock or Crypto
                            </span>
                        </button>
                        <button
                            onClick={() => setTypeOfNews('general')}
                            className={`relative inline-flex items-center justify-center p-0.5 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-full group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white ${typeOfNews === 'general' ? 'ring-4 outline-none ring-pink-200 dark:ring-pink-800' : ''}`}
                        >
                            <span className="w-[28em] relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-full group-hover:bg-opacity-0">
                                General
                            </span>
                        </button>
                    </div>

                    {typeOfNews === 'stock' ? (
                        <form
                            onSubmit={handleStockSubmit}
                            className='w-[60vw] mx-auto mt-10 px-8'
                        >
                            <div className='text-black dark:text-white pb-4'>
                                <h2
                                    className="py-6 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-700 dark:from-red-300 via-yellow-300 to-green-700 dark:to-green-400"
                                >Enter the time frame of stock prediction</h2>
                                <div className='flex flex-row w-[50em] justify-around mx-auto'>
                                    <DatePickerComponent
                                        selectedDate={startDate}
                                        setSelectedDate={setStartDate}
                                        instruction='Start date of prediction'
                                    />

                                    <DatePickerComponent
                                        selectedDate={endDate}
                                        setSelectedDate={setEndDate}
                                        instruction='End date of prediction'
                                    />
                                </div>
                            </div>

                            <div className='my-4'>
                                <div className="mb-6">
                                    <label for="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title of the Article</label>
                                    <input
                                        type="text"
                                        value={articleDetails.Title}
                                        onChange={handleTitleChange}
                                        id="title"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Probably stock/crypto name and its prediction or related news"
                                        required
                                    />
                                </div>
                                <div className="grid gap-6 mb-6 md:grid-cols-2">
                                    <div>
                                        <label for="visible_words" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Visible words to free users</label>
                                        <input
                                            type="number"
                                            value={articleDetails.VisibleLimit}
                                            onChange={handleVisibleWordChange}
                                            id="visible_words"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="20"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label for="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Enter the price of the article in dollars ($)</label>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={handlePriceChange}
                                            id="price"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Price must be less than 1e16 wei i.e 0.01BTC"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label for="tags" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tags for news / article</label>
                                    <input
                                        type="text"
                                        value={articleDetails.Tags.join(', ')}
                                        onChange={handleTagsChange}
                                        id="tags"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Tags for the better search of the news article (enter comma seperated tags)"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label for="tags" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Background Image link</label>
                                    <input
                                        type="text"
                                        value={articleDetails.BgImg}
                                        onChange={handleBgChange}
                                        id="tags"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Enter the image link to be displayed as background image of the news article"
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-center w-full">
                                    <label for="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                            </svg>
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload the article</span> or drag and drop</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">PDF or any other format except images (MAX. 5MB)</p>
                                        </div>
                                        <input
                                            id="dropzone-file"
                                            // value={uploadedFile}
                                            onChange={handleArticleChange}
                                            type="file"
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div>
                                    <textarea
                                        name="article"
                                        id="article"
                                        className='my-6 shadow-md bg-gray-300 dark:bg-gray-600 w-full h-[20em] p-4 rounded-xl text-neutral-800 dark:text-neutral-200'
                                        value={articleDetails.Article}
                                        onChange={handleArticleTextChange}
                                    >You can write you text here</textarea>
                                </div>

                                <div className="flex items-start mb-6 mt-6">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="remember"
                                            type="checkbox"
                                            value={termsAccepted}
                                            checked={termsAccepted}
                                            onChange={() => setTermsAccepted(!termsAccepted)}
                                            className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                                            required
                                        />
                                    </div>
                                    <label for="remember" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">I agree with the <span onClick={openModal} className="text-blue-600 hover:underline dark:text-blue-500">terms and conditions</span>.</label>
                                </div>
                                <ModalPopup isOpen={isModalOpen} onRequestClose={closeModal} title="Terms And Conditions">
                                    <TermsAndConditions />
                                </ModalPopup>
                                <button type="submit" className="text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 font-medium rounded-lg text-lg px-5 py-2.5 text-center me-2 mb-2 w-36 h-12">Publish</button>
                            </div>
                        </form>
                    ) : (
                        <form
                            onSubmit={handleGeneralSubmit}
                            className='w-[60vw] mx-auto mt-10 px-8'
                        >
                            <div>
                                <h2
                                    className="py-6 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-700 dark:from-red-300 via-yellow-300 to-green-700 dark:to-green-400"
                                >Select the location from the map of the news incident</h2>
                                <LocationPicker
                                    position={location}
                                    setPosition={setLocation}
                                />
                            </div>

                            <div className='my-4'>
                                <div className="mb-6">
                                    <label for="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title of the Article</label>
                                    <input
                                        type="text"
                                        value={articleDetails.Title}
                                        onChange={handleTitleChange}
                                        id="title"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Probably the incident or location"
                                        required
                                    />
                                </div>
                                <div className="grid gap-6 mb-6 md:grid-cols-2">
                                    <div>
                                        <label for="visible_words" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Visible words to free users</label>
                                        <input
                                            type="number"
                                            value={articleDetails.VisibleLimit}
                                            onChange={handleVisibleWordChange}
                                            id="visible_words"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="20"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label for="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Enter the price of the article in dollars ($)</label>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={handlePriceChange}
                                            id="price"
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="1000000000000000000 is 1ETH"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label for="tags" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tags for news / article</label>
                                    <input
                                        type="text"
                                        value={articleDetails.Tags.join(', ')}
                                        onChange={handleTagsChange}
                                        id="tags"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Tags for the better search of the news article (enter comma seperated tags)"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <label for="tags" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Background Image link</label>
                                    <input
                                        type="text"
                                        value={articleDetails.BgImg}
                                        onChange={handleBgChange}
                                        id="tags"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Enter the image link to be displayed as background image of the news article"
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-center w-full">
                                    <label for="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                            </svg>
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload the article</span> or drag and drop</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">PDF or any other format except images (MAX. 5MB)</p>
                                        </div>
                                        <input
                                            id="dropzone-file"
                                            // value={uploadedFile}
                                            onChange={handleArticleChange}
                                            type="file"
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div>
                                    <textarea
                                        name="article"
                                        id="article"
                                        className='my-6 shadow-md bg-gray-300 dark:bg-gray-600 w-full h-[20em] p-4 rounded-xl text-neutral-800 dark:text-neutral-200'
                                        value={articleDetails.Article}
                                        onChange={handleArticleTextChange}
                                    >You can write you text here</textarea>
                                </div>

                                <div className="flex items-start mb-6 mt-6">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="remember"
                                            type="checkbox"
                                            value={termsAccepted}
                                            checked={termsAccepted}
                                            onChange={() => setTermsAccepted(!termsAccepted)}
                                            className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                                            required
                                        />
                                    </div>
                                    <label for="remember" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">I agree with the <span onClick={openModal} className="text-blue-600 hover:underline dark:text-blue-500">terms and conditions</span>.</label>
                                </div>
                                <ModalPopup isOpen={isModalOpen} onRequestClose={closeModal} title="Terms And Conditions">
                                    <TermsAndConditions />
                                </ModalPopup>
                                <button type="submit" className="text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 font-medium rounded-lg text-lg px-5 py-2.5 text-center me-2 mb-2 w-36 h-12">Publish</button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}