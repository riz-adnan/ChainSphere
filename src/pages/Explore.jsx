import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
} from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, FunnelIcon, MinusIcon, PlusIcon } from '@heroicons/react/20/solid';

// Importing components
import ModalPopup from '../components/ModalPopup';
import LocationPicker from '../components/LocationPicker';
import DatePickerComponent from '../components/DatePickerComponent';
import Meteors from '../components/ui/Meteors';

import ArticleStorage from '../contracts/ArticleStorage.json'
const { ethers } = require("ethers");

const contractAddress = '0xc4ee449dc12ac2c9316bf52abb868f1ff80e4b28';
//const RSK_TESTNET_URL = 'https://public-node.testnet.rsk.co';

const contractABI = ArticleStorage.abi;
// Impoting ui components



const sortOptions = [
    { name: 'Most Popular', id: 'mostPop', current: false },
    { name: 'Newest', id: 'newest', current: true },
    { name: 'Best AI Rating', id: 'aiRat', current: false },
    { name: 'Reverse', id: 'reverse', current: false },
]

const filters = [
    {
        id: 'category',
        name: 'Category',
        options: [
            { value: 'stocks', label: 'Stocks' },
            { value: 'general', label: 'General' },
        ]
    },
    {
        id: 'locRadius',
        name: 'Location Radius',
        options: [
            { value: '50', label: '50 km' },
            { value: '100', label: '100 km' },
            { value: '250', label: '250 km' },
            { value: '500', label: '500 km' },
            { value: '1000', label: '1000 km' },
            { value: '41000', label: 'More than 100 km' },
        ],
    },
    {
        id: 'wordLimit',
        name: 'Word Limit',
        options: [
            { value: '100', label: 'Less than 100 words' },
            { value: '500', label: '100 to 500 words' },
            { value: '1000', label: '500 to 1000 words' },
            { value: '2000', label: '1000 to 2000 words' },
            { value: '5000', label: '2000 to 5000 words' },
            { value: '50000', label: 'More than 5000 words' },
        ],
    },
    {
        id: 'priceRange',
        name: 'Price Range',
        options: [
            { value: '0.1', label: 'Less than 0.1 ETH' },
            { value: '0.25', label: '0.1 to 0.25 ETH' },
            { value: '0.5', label: '0.25 to 0.5 ETH' },
            { value: '0.75', label: '0.5 to 0.75 ETH' },
            { value: '1', label: '0.75 to 1 ETH' },
            { value: '10', label: 'More than 1 ETH' },
        ],
    },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Explore({ account, setAccount }) {
    const navigate = useNavigate();
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [position, setPosition] = useState(null);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [newsFeed, setNewsFeed] = useState([

    ]); // Initialize state for news feed
    const [filteredNewsFeed, setFilteredNewsFeed] = useState([]); // State for filtered news feed
    const [searchedNewsFeed, setSearchedNewsFeed] = useState([]); // State for the searched news feed
    const [selectedFilters, setSelectedFilters] = useState({
        category: ['stocks', 'general'],
        locRadius: [],
        wordLimit: [],
        priceRange: []
    });
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchQueryChange = (e) => {
        setSearchQuery(e.target.value);
        setSearchedNewsFeed(
            filteredNewsFeed.filter((item) => {
                return item.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
                    item.tags.some((tag) => tag.toLowerCase().includes(e.target.value.toLowerCase()));
            })
        );
    }

    // Implement the payment for the article here
    const handlePayForArticle = async (contentId, category) => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const articleStorage = new ethers.Contract(contractAddress, contractABI, provider);
        let result;

        if (category === "general") {
            result = await articleStorage.getGeneralOpt(account);
        } else {
            result = await articleStorage.getStockOpt(account);
        }

        const isPurchased = result.some(content => content.toNumber() === contentId);

        if (isPurchased) {
            navigate(`/newsFeed/${category}/${contentId}`);
            return;
        } else {
            // Retrieve the article details to get the price
            const articleStorage2 = new ethers.Contract(contractAddress, contractABI, signer);
            let article;
            if (category === "general") {
                article = await articleStorage.getGeneralArticle(contentId);
            } else {
                article = await articleStorage.getStockArticle(contentId);
            }
            const price = ethers.BigNumber.from(article[6]);

            // Pay for the article
            try {
                let tx;
                if (category === "general") {
                    tx = await articleStorage2.payForGeneralArticle(contentId, { value: price });
                } else {
                    tx = await articleStorage2.payForStockArticle(contentId, { value: price });
                }
                console.log('Transaction sent:', tx);
                const receipt = await tx.wait();
                console.log('Transaction mined:', receipt);
                navigate(`/newsFeed/${category}/${contentId}`);
            }
            catch (error) {
                console.error("Payment failed:", error);
                // Optionally, handle payment failure (e.g., show a notification)
            }
        }
    }

    const openModal = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const clearLocation = () => {
        setPosition(null);
    };

    const handleSortOptionChange = (sortId) => {
        let sortOption;
        sortOptions.forEach(element => {
            if (element.id === sortId) {
                sortOption = element;
                element.current = true;
            } else {
                element.current = false;
            }
        });

        setSearchedNewsFeed((prevNewsFeed) => {
            let sortedNewsFeed = [...filteredNewsFeed];
            switch (sortOption.id) {
                case 'mostPop':
                    sortedNewsFeed.sort((a, b) => b.userRating - a.userRating);
                    break;
                case 'newest':
                    sortedNewsFeed.sort((a, b) => b.publishedDate - a.publishedDate);
                    break;
                case 'aiRat':
                    sortedNewsFeed.sort((a, b) => b.aiRating - a.aiRating);
                    break;
                case 'reverse':
                    sortedNewsFeed.reverse();
                    break;
                default:
                    break;
            }
            return sortedNewsFeed
        });
    }

    useEffect(() => {
        const fetchArticles = async () => {
            // Initialize Web3
            const provider = new ethers.providers.Web3Provider(window.ethereum);

            const articleStorage = new ethers.Contract(contractAddress, contractABI, provider);
            console.log("start");
            // Fetch stock articles
            const stockArticles = await articleStorage.getAllStockArticles();
            const formattedStockArticles = stockArticles.map(article => {
                const [titled, contentd] = article.content.split('%');
                return {
                    contentId: article.index.toNumber(), // Convert BigNumber to number
                    title: titled, // Replace with actual title extraction logic
                    category: 'stocks',
                    tags: article.tags,
                    visibleWords: article.visibleWords.toNumber(), // Convert BigNumber to number
                    price: ethers.utils.formatUnits(article.price, 'wei'), // Convert BigNumber to string in ether
                    publishedDate: new Date(article.dateUploaded.toNumber() * 1000), // Convert BigNumber to number and then to Date
                    article: contentd,
                    startDate: new Date(article.startDate.toNumber() * 1000), // Convert BigNumber to number and then to Date
                    endDate: new Date(article.endDate.toNumber() * 1000), // Convert BigNumber to number and then to Date
                    userRating: ((article.userRating.toNumber()) / 100).toFixed(2), // Convert BigNumber to number
                    aiRating: article.aiRating.toNumber(), // Convert BigNumber to number
                    bgImg: article.image
                };
            });

            // Fetch general articles
            const generalArticles = await articleStorage.getAllGeneralArticles();
            const formattedGeneralArticles = await Promise.all(generalArticles.map(async (article) => {
                const [titled, contentd] = article.content.split('%');
                const location = {
                    lat: (article.latitude.toNumber() / 1e6).toFixed(6),
                    long: (article.longitude.toNumber() / 1e6).toFixed(6)
                };
                const locName = await fetch(`https://geocode.maps.co/reverse?lat=${location.lat}&lon=${location.long}&api_key=669007e2ee322970406182mjg41bae8`)
                    .then(response => response.json())
                    .then(data => `${data.address.state_district} ${data.address.state} ${data.address.country}`)
                    .catch(error => {
                        console.error('Error fetching location name:', error);
                        return 'Unknown location';
                    });
                return {
                    contentId: article.index.toNumber(),
                    title: titled, // Example title extraction
                    category: 'general',
                    tags: article.tags,
                    visibleWords: article.visibleWords.toNumber(),
                    price: ethers.utils.formatUnits(article.price, 'wei'),
                    publishedDate: new Date(article.dateUploaded.toNumber() * 1000),
                    article: contentd,
                    location: {
                        lat: (article.latitude.toNumber() / 1e6).toFixed(6),
                        long: (article.longitude.toNumber() / 1e6).toFixed(6)
                    },
                    userRating: ((article.userRating.toNumber()) / 100).toFixed(2),
                    aiRating: article.aiRating.toNumber(),
                    bgImg: article.image,
                    locName: locName
                };
            }));

            // Combine both articles
            const fetchedNewsFeed = [...formattedStockArticles, ...formattedGeneralArticles];

            console.log(fetchedNewsFeed);
            // Set articles in state
            setNewsFeed(fetchedNewsFeed);
        };

        fetchArticles();
    }, []);

    // Handle filter change
    const handleFilterChange = (filterCategory, value) => {
        setSelectedFilters((prevFilters) => {
            const updatedFilters = { ...prevFilters };
            if (updatedFilters[filterCategory].includes(value)) {
                updatedFilters[filterCategory] = updatedFilters[filterCategory].filter((item) => item !== value);
            } else {
                updatedFilters[filterCategory].push(value);
            }
            return updatedFilters;
        });
    };

    const haversineDistance = (lat1, lng1, lat2, lng2) => {
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = toRad(lat2 - lat1);
        const dLng = toRad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
    };

    // Apply filters to the news feed
    useEffect(() => {
        const applyFilters = () => {
            let filtered = newsFeed;

            // Apply category filter
            if (selectedFilters.category.length > 0) {
                filtered = filtered.filter((item) => selectedFilters.category.includes(item.category))
            } else {
                filtered = [];
            }

            // Apply position filter
            if (position && selectedFilters.locRadius.length > 0) {
                const centerLat = Number(position.lat);
                const centerLng = Number(position.lng);
                selectedFilters.locRadius.sort(function (a, b) { return (Number(a) - Number(b)); });
                let radiusSm = Number(selectedFilters.locRadius[0]);
                let radiusLg = Number(selectedFilters.locRadius[selectedFilters.locRadius.length - 1]);
                switch (radiusSm) {
                    case 50:
                        radiusSm = 0;
                        break;
                    case 100:
                        radiusSm = 50;
                        break;
                    case 250:
                        radiusSm = 100;
                        break;
                    case 500:
                        radiusSm = 250;
                        break;
                    case 1000:
                        radiusSm = 500;
                        break;
                    default:
                        radiusSm = 1000;
                        break;
                }

                filtered = filtered.filter(item => {
                    if (item.category !== 'general') return true;
                    const distance = haversineDistance(centerLat, centerLng, item.location.lat, item.location.long);
                    return (distance <= radiusLg && distance >= radiusSm);
                });
            }

            // // Apply word limit filter
            if (selectedFilters.wordLimit.length > 0) {
                // Word limit filter
                selectedFilters.wordLimit.sort(function (a, b) { return (Number(a) - Number(b)); });
                let minWords = Number(selectedFilters.wordLimit[0]);
                let maxWords = Number(selectedFilters.wordLimit[selectedFilters.wordLimit.length - 1]);
                switch (minWords) {
                    case 100:
                        minWords = 0;
                        break;
                    case 500:
                        minWords = 100;
                        break;
                    case 1000:
                        minWords = 500;
                        break;
                    case 2000:
                        minWords = 1000;
                        break;
                    case 5000:
                        minWords = 2000;
                        break;
                    default:
                        minWords = 5000;
                        break;
                }
                filtered = filtered.filter((item) => {
                    const words = item.article.split(' ');
                    return words.length >= minWords && words.length <= maxWords;
                })
            }

            // // Apply price range filter
            if (selectedFilters.priceRange.length > 0) {
                // Price range filter
                selectedFilters.priceRange.sort(function (a, b) { return (Number(a) - Number(b)); });
                let minPrice = Number(selectedFilters.priceRange[0]);
                let maxPrice = Number(selectedFilters.priceRange[selectedFilters.priceRange.length - 1]);
                switch (minPrice) {
                    case 0.1:
                        minPrice = 0;
                        break;
                    case 0.25:
                        minPrice = 0.1;
                        break;
                    case 0.5:
                        minPrice = 0.25;
                        break;
                    case 0.75:
                        minPrice = 0.5;
                        break;
                    case 1:
                        minPrice = 0.75;
                        break;
                    default:
                        minPrice = 1;
                        break;
                }
                filtered = filtered.filter((item) => (item.price / 1e18) >= minPrice && (item.price / 1e18) <= maxPrice);
            }

            // Apply date filter
            if (startDate && endDate) {
                filtered = filtered.filter((item) => {
                    return (item.category !== 'stocks') || (item.publishedDate >= startDate && item.publishedDate <= endDate);
                });
            }

            setFilteredNewsFeed(filtered);
            setSearchedNewsFeed(filtered);
        };

        applyFilters();
    }, [selectedFilters, newsFeed, position, startDate, endDate]);

    return (
        <div className="bg-white dark:bg-black">
            <div>
                {/* Mobile filter dialog */}
                <Dialog className="relative z-40 lg:hidden" open={mobileFiltersOpen} onClose={setMobileFiltersOpen}>
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
                    />

                    <div className="fixed inset-0 z-40 flex">
                        <DialogPanel
                            transition
                            className="relative ml-auto flex h-full w-full max-w-xs transform flex-col overflow-y-auto bg-white dark:bg-gray-800 py-4 pb-12 shadow-xl transition duration-300 ease-in-out data-[closed]:translate-x-full"
                        >
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Filters</h2>
                                <button
                                    type="button"
                                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white dark:bg-gray-700 p-2 text-gray-400"
                                    onClick={() => setMobileFiltersOpen(false)}
                                >
                                    <span className="sr-only">Close menu</span>
                                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>

                            {/* Filters */}
                            <form className="mt-4 border-t border-gray-200 dark:border-gray-600">
                                {selectedFilters.category.includes('general') && <>
                                    <h3 className="sr-only">Location</h3>
                                    <button
                                        className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-gradient-to-l"
                                        onClick={openModal}
                                    >
                                        Open Location Picker
                                    </button>
                                    <ModalPopup isOpen={isModalOpen} onRequestClose={closeModal} title="Select the search location">
                                        <LocationPicker position={position} setPosition={setPosition} clearLocation={clearLocation} />
                                    </ModalPopup>
                                    {position && (
                                        <div className="mt-4 p-4 bg-white dark:bg-gray-700 shadow-md rounded-md">
                                            <p className="text-lg text-gray-900 dark:text-gray-100">Selected Location:</p>
                                            <p className="text-gray-900 dark:text-gray-100">Latitude: {position.lat}</p>
                                            <p className="text-gray-900 dark:text-gray-100">Longitude: {position.lng}</p>
                                        </div>
                                    )}
                                </>}

                                {selectedFilters.category.includes('stocks') && <div className='flex flex-col w-[18em] justify-between items-center my-4 h-[18em]'>
                                    <DatePickerComponent
                                        selectedDate={startDate}
                                        setSelectedDate={setStartDate}
                                        instruction='Publication Start Date'
                                    />

                                    <DatePickerComponent
                                        selectedDate={endDate}
                                        setSelectedDate={setEndDate}
                                        instruction='Publication End Date'
                                    />
                                </div>}

                                {filters.map((section) => (
                                    <Disclosure as="div" key={section.id} className="border-t border-gray-200 dark:border-gray-600 px-4 py-6">
                                        {({ open }) => (
                                            <>
                                                <h3 className="-mx-2 -my-3 flow-root">
                                                    <DisclosureButton className="flex w-full items-center justify-between bg-grey-200 dark:bg-gray-700 px-2 py-3 text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200">
                                                        <span className="font-medium text-gray-900 dark:text-gray-100">{section.name}</span>
                                                        <span className="ml-6 flex items-center">
                                                            {open ? (
                                                                <MinusIcon className="h-5 w-5" aria-hidden="true" />
                                                            ) : (
                                                                <PlusIcon className="h-5 w-5" aria-hidden="true" />
                                                            )}
                                                        </span>
                                                    </DisclosureButton>
                                                </h3>
                                                <DisclosurePanel className="pt-6">
                                                    <div className="space-y-6">
                                                        {section.options.map((option, optionIdx) => (
                                                            <div key={option.value} className="flex items-center">
                                                                <input
                                                                    id={`filter-mobile-${section.id}-${optionIdx}`}
                                                                    name={`${section.id}[]`}
                                                                    value={option.value}
                                                                    type="checkbox"
                                                                    checked={selectedFilters[section.id].includes(option.value)}
                                                                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                                                    onChange={() => handleFilterChange(section.id, option.value)}
                                                                />
                                                                <label
                                                                    htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                                                    className="ml-3 min-w-0 flex-1 text-gray-500 dark:text-gray-300"
                                                                >
                                                                    {option.label}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </DisclosurePanel>
                                            </>
                                        )}
                                    </Disclosure>
                                ))}
                            </form>
                        </DialogPanel>
                    </div>
                </Dialog>

                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-baseline justify-between border-b border-gray-200 dark:border-gray-600 pb-6 pt-24">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">News Feeds</h1>

                        {/* Search Bar */}
                        <form className="max-w-3xl w-[35em] mx-auto">
                            <label
                                htmlFor="default-search"
                                className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                            >
                                Search
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                    <svg
                                        className="w-4 h-4 text-gray-500 dark:text-gray-400"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={handleSearchQueryChange}
                                    id="default-search"
                                    className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="Stocks, general..."
                                    required
                                />
                                <button
                                    type="submit"
                                    className="text-white absolute end-2.5 bottom-2.5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        <div className="flex items-center">
                            <Menu as="div" className="relative inline-block text-left">
                                <div>
                                    <MenuButton className="group inline-flex justify-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                                        Sort
                                        <ChevronDownIcon
                                            className="-mr-1 ml-1 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-gray-200"
                                            aria-hidden="true"
                                        />
                                    </MenuButton>
                                </div>

                                <MenuItems
                                    transition
                                    className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                                >
                                    <div className="py-1">
                                        {sortOptions.map((option) => (
                                            <MenuItem key={option.name}>
                                                {({ focus }) => (
                                                    <p
                                                        className={classNames(
                                                            option.current
                                                                ? 'font-medium text-gray-900 dark:text-gray-100'
                                                                : 'text-gray-500 dark:text-gray-300',
                                                            focus ? 'bg-gray-100 dark:bg-gray-700' : '',
                                                            'block px-4 py-2 text-sm', 'cursor-pointer'
                                                        )}
                                                        onClick={() => handleSortOptionChange(option.id)}
                                                    >
                                                        {option.name}
                                                    </p>
                                                )}
                                            </MenuItem>
                                        ))}
                                    </div>
                                </MenuItems>
                            </Menu>

                            {/* <button type="button" className="-m-2 ml-5 p-2 text-gray-400 hover:text-gray-500 sm:ml-7 dark:text-gray-300 dark:hover:text-gray-200">
                                <span className="sr-only">View grid</span>
                                <Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
                            </button> */}
                            <button
                                type="button"
                                className="-m-2 ml-4 p-2 text-gray-400 hover:text-gray-500 sm:ml-6 lg:hidden dark:text-gray-300 dark:hover:text-gray-200"
                                onClick={() => setMobileFiltersOpen(true)}
                            >
                                <span className="sr-only">Filters</span>
                                <FunnelIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    </div>

                    <section aria-labelledby="products-heading" className="pb-24 pt-6">
                        <h2 id="products-heading" className="sr-only">
                            Products
                        </h2>

                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                            {/* Filters */}
                            <form className="hidden lg:block">
                                {selectedFilters.category.includes('general') && <>
                                    <h3 className="sr-only">Location</h3>
                                    <button
                                        className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-gradient-to-l"
                                        onClick={openModal}
                                    >
                                        Open Location Picker
                                    </button>
                                    <ModalPopup isOpen={isModalOpen} onRequestClose={closeModal} title="Select the search location">
                                        <LocationPicker position={position} setPosition={setPosition} clearLocation={clearLocation} />
                                    </ModalPopup>
                                    {position && (
                                        <div className="mt-4 p-4 bg-white dark:bg-gray-700 shadow-md rounded-md">
                                            <p className="text-lg text-gray-900 dark:text-gray-100">Selected Location:</p>
                                            <p className="text-gray-900 dark:text-gray-100">Latitude: {position.lat}</p>
                                            <p className="text-gray-900 dark:text-gray-100">Longitude: {position.lng}</p>
                                        </div>
                                    )}
                                </>}

                                {selectedFilters.category.includes('stocks') && <div className='flex flex-col w-[18em] justify-between items-center my-4 h-[18em]'>
                                    <DatePickerComponent
                                        selectedDate={startDate}
                                        setSelectedDate={setStartDate}
                                        instruction='Publication Start Date'
                                    />

                                    <DatePickerComponent
                                        selectedDate={endDate}
                                        setSelectedDate={setEndDate}
                                        instruction='Publication End Date'
                                    />
                                </div>}

                                {filters.map((section) => ((selectedFilters.category.includes('general') || section.id !== 'locRadius') &&
                                    <Disclosure as="div" key={section.id} className="border-b border-gray-200 dark:border-gray-600 py-6">
                                        {({ open }) => (
                                            <>
                                                <h3 className="-my-3 flow-root">
                                                    <DisclosureButton className="px-4 flex w-full items-center justify-between bg-gray-200 dark:bg-gray-700 py-3 text-sm text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200">
                                                        <span className="font-medium text-gray-900 dark:text-gray-100">{section.name}</span>
                                                        <span className="ml-6 flex items-center">
                                                            {open ? (
                                                                <MinusIcon className="h-5 w-5" aria-hidden="true" />
                                                            ) : (
                                                                <PlusIcon className="h-5 w-5" aria-hidden="true" />
                                                            )}
                                                        </span>
                                                    </DisclosureButton>
                                                </h3>
                                                <DisclosurePanel className="pt-6">
                                                    <div className="space-y-4">
                                                        {section.options.map((option, optionIdx) => (
                                                            <div key={option.value} className="flex items-center">
                                                                <input
                                                                    id={`filter-${section.id}-${optionIdx}`}
                                                                    name={`${section.id}[]`}
                                                                    value={option.value}
                                                                    type="checkbox"
                                                                    checked={selectedFilters[section.id].includes(option.value)}
                                                                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                                                    onChange={() => handleFilterChange(section.id, option.value)}
                                                                />
                                                                <label
                                                                    htmlFor={`filter-${section.id}-${optionIdx}`}
                                                                    className="ml-3 text-sm text-gray-600 dark:text-gray-300"
                                                                >
                                                                    {option.label}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </DisclosurePanel>
                                            </>
                                        )}
                                    </Disclosure>
                                ))}
                            </form>

                            {/* Product grid */}
                            <div className="lg:col-span-3 text-black dark:text-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto h-screen p-4">
                                {searchedNewsFeed.map((item) => (
                                    <div className="w-full relative max-w-xs h-[28em]" key={item.contentId}>
                                        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-teal-500 transform scale-[0.80] bg-red-500 rounded-full blur-3xl" />
                                        <div className="relative shadow-xl bg-gray-900 border border-gray-800 px-4 py-8 h-full overflow-hidden rounded-2xl flex flex-col">
                                            <h1 className="font-bold text-xl text-white mb-4 relative">
                                                {item.title}
                                            </h1>
                                            <p className="font-normal text-base text-slate-500 mb-4 relative break-words whitespace-normal">
                                                {`${item.article.split(' ').slice(0, (item.visibleWords < 25 ? item.visibleWords : 25)).join(' ')}...`}
                                            </p>
                                            <div className="text-gray-400 mb-4">
                                                <p>User Rating: {item.userRating}</p>
                                                <p>AI Rating: {item.aiRating}</p>
                                                {item.category === 'stocks' ? (
                                                    <>
                                                        <p>Prediction Start: {item.startDate.toString().split(" ").slice(1, 4).join(" ")}</p>
                                                        <p>Prediction End: {item.endDate.toString().split(" ").slice(1, 4).join(" ")}</p>
                                                    </>
                                                ) : (
                                                    <p>Location: {item.locName}</p>
                                                )}
                                                <p>Price: $ {(item.price / 1e18)*57716.66}</p>
                                            </div>
                                            <button
                                                className="border px-4 py-1 rounded-lg border-gray-500 text-gray-300 mt-auto self-end"
                                                onClick={() => handlePayForArticle(item.contentId, item.category)}
                                            >
                                                View More
                                            </button>
                                            {/* Meteor effect */}
                                            <Meteors number={20} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}