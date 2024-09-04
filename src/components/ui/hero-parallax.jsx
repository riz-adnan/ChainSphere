import React, { useRef } from "react";
import { useNavigate } from 'react-router-dom';
import ArticleStorage from '../../contracts/ArticleStorage.json'
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
const { ethers } = require("ethers");
const contractAddress = '0xc4ee449dc12ac2c9316bf52abb868f1ff80e4b28';
const contractABI = ArticleStorage.abi;
//import { Link } from "react-router-dom";

export const HeroParallax = ({ account, products, headingTitle1, headingTitle2, headingPara, headingHighlight }) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [15, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.2, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [20, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 500]),
    springConfig
  );

  return (
    <div
      ref={ref}
      className="h-[300vh] py-40 overflow-hidden antialiased relative flex flex-col self-auto [perspective:1000px] [transform-style:preserve-3d]"
    >
      <Header
        headingTitle1={headingTitle1}
        headingTitle2={headingTitle2}
        headingPara={headingPara}
        headingHighlight={headingHighlight}
      />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className=""
      >
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 mb-20">
          {firstRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
              account={account}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row mb-20 space-x-20">
          {secondRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={product.title}
              account={account}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-reverse space-x-20">
          {thirdRow.map((product) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={product.title}
              account={account}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Header = ({ headingTitle1, headingTitle2, headingPara, headingHighlight }) => {
  return (
    <div className="max-w-7xl relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0">
      <h1 className="text-2xl md:text-7xl font-bold dark:text-white">
        {headingTitle1} <br /> {headingTitle2}
      </h1>
      <p className="max-w-2xl text-base md:text-xl mt-8 dark:text-neutral-200">
        {headingPara} <span className="bg-green-400 dark:bg-gray-700 font-extrabold p-[0.3rem] rounded-xl">&nbsp;{headingHighlight}&nbsp;</span>
      </p>
    </div>
  );
};

export const ProductCard = ({ product, translate, account }) => {
  const navigate = useNavigate();

  const handleArticleClicked = async (contentId, category) => {
    console.log("clickededede");
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

  return (
    <motion.div
      style={{
        x: translate,
      }}
      whileHover={{
        y: -20,
      }}
      key={product.title}
      className="group/product h-96 w-[30rem] relative flex-shrink-0"
    >
      <div onClick={() => handleArticleClicked(product.index, product.category)} className="block group-hover/product:shadow-2xl">
        <img
          src={product.thumbnail}
          height="600"
          width="600"
          className="object-cover object-left-top absolute h-full w-full inset-0"
          alt={product.title}
        />
      </div>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none"></div>
      <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white">
        {product.title}
      </h2>
    </motion.div>
  );
};