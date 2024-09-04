import React, { useState, useEffect } from 'react';
import ArticleStorage from '../contracts/ArticleStorage.json'
import { HeroParallax } from '../components/ui/hero-parallax';
const { ethers } = require("ethers");

const contractAddress = '0xc4ee449dc12ac2c9316bf52abb868f1ff80e4b28';
const contractABI = ArticleStorage.abi;
// Importing components


export default function Home({ account, setAccount }) {
    const [newsFeed, setNewsFeed] = useState([
        // {
        //     index: 1,
        //     category: "general",
        //     title: "Moonbeam",
        //     thumbnail:
        //         "./HomeImage/gomoonbeam.png",
        // }
    ]);

    // To fetch the top fifteen news feeds only
    useEffect(() => {
        const fetchNewsFeed = async () => {
            try {
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
                        userRating: article.userRating.toNumber(), // Convert BigNumber to number
                        aiRating: article.aiRating.toNumber(), // Convert BigNumber to number
                        bgImg: article.image
                    };
                });

                // Fetch general articles
                const generalArticles = await articleStorage.getAllGeneralArticles();
                const formattedGeneralArticles = generalArticles.map((article) => {
                    const [titled, contentd] = article.content.split('%');
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
                            lat: article.latitude.div(1e6).toNumber(),
                            long: article.longitude.div(1e6).toNumber()
                        },
                        userRating: article.userRating.toNumber(),
                        aiRating: article.aiRating.toNumber(),
                        bgImg: article.image
                    };
                });

                // Sort by userRating and take top 6 from each category
                const topStockArticles = formattedStockArticles
                    .sort((a, b) => b.userRating - a.userRating)
                    .slice(0, 6);

                const topGeneralArticles = formattedGeneralArticles
                    .sort((a, b) => b.userRating - a.userRating)
                    .slice(0, 6);

                // Combine and format for newsFeed state
                const combinedFeed = [
                    ...topStockArticles.map(article => ({
                        index: article.contentId,
                        category: article.category,
                        title: article.title,
                        thumbnail: article.bgImg,
                    })),
                    ...topGeneralArticles.map(article => ({
                        index: article.contentId,
                        category: article.category,
                        title: article.title,
                        thumbnail: article.bgImg,
                    }))
                ];

                setNewsFeed(combinedFeed);
            }
            catch (error) {
                console.error("Failed to fetch news feed:", error);
            }
        }

        fetchNewsFeed();
    }, [])

    return (
        <main className='text-black bg-white dark:text-white dark:bg-black mt-2'>
            <HeroParallax
            account={account}
                products={newsFeed}
                headingPara='A decentralized news feed platform to keep you updated with the latest news and trends
                            of general world as well as finance. Here you can find the latest general and country
                            news at the first with a very low cost. You can also get the stock predictions and related
                            news, not only in articles but also in videos.'
                headingTitle1='Welcome to the'
                headingTitle2='World of ChainSphere'
                headingHighlight="Navigate to 'Feed' to get started."
            />
        </main>
    );
}