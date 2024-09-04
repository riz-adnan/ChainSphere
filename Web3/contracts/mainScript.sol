// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ArticleStorage {
    struct StockArticle {
        uint index;
        address owner;
        string[] tags;
        string image;
        string content;
        uint256 visibleWords;
        uint256 price;
        uint256 dateUploaded;
        uint256 aiRating;
        uint256 userRating;
        uint256 startDate;
        uint256 endDate;
        uint256 noOfUserRate;
    }

    struct GeneralArticle {
        uint index;
        address owner;
        string[] tags;
        string image;
        string content;
        uint256 visibleWords;
        uint256 price;
        uint256 dateUploaded;
        uint256 aiRating;
        uint256 userRating;
        int256 latitude;
        int256 longitude;
        uint256 noOfUserRate;
    }

    StockArticle[] public stocks;
    GeneralArticle[] public general;

    mapping (address => int[]) public stockopt;
    mapping (address => int[]) public Generalopt;

    function setStockUserRating(uint index, uint256 rating) public {
        require(index < stocks.length, "StockArticle index out of range");
        stocks[index].userRating = (stocks[index].userRating* stocks[index].noOfUserRate + rating ) / (stocks[index].noOfUserRate+1);
        stocks[index].noOfUserRate += 1; 
    }

    // Function to set userRating for GeneralArticle by index
    function setGeneralUserRating(uint index, uint256 rating) public {
        require(index < general.length, "GeneralArticle index out of range");
        general[index].userRating = (general[index].userRating* general[index].noOfUserRate + rating ) / (general[index].noOfUserRate+1) ;
        general[index].noOfUserRate += 1; 
    }

    function storeStockArticle(
        string[] memory _tags, 
        string memory _image ,
        string memory _content, 
        uint256 _visibleWords, 
        uint256 _price, 
        uint256 _aiRating, 
        uint256 _userRating, 
        uint256 _startDate,
        uint256 _endDate
    ) public {

        StockArticle memory newStockArticle = StockArticle({
            index: stocks.length,
            owner: msg.sender,
            tags: _tags,
            image: _image,
            content: _content,
            visibleWords: _visibleWords,
            price: _price,
            dateUploaded: block.timestamp,
            aiRating: _aiRating,
            userRating: _userRating,
            startDate: _startDate,
            endDate: _endDate,
            noOfUserRate: 0
        });

        stocks.push(newStockArticle);
        stockopt[msg.sender].push(int(newStockArticle.index));
    }

    function storeGeneralArticle(
        string[] memory _tags,
        string memory _image, 
        string memory _content, 
        uint256 _visibleWords, 
        uint256 _price, 
        uint256 _aiRating, 
        uint256 _userRating, 
        int256 _latitude,
        int256 _longitude
    ) public {
        GeneralArticle memory newGeneralArticle = GeneralArticle({
            index: general.length,
            owner: msg.sender,
            tags: _tags,
            image: _image,
            content: _content,
            visibleWords: _visibleWords,
            price: _price,
            dateUploaded: block.timestamp,
            aiRating: _aiRating,
            userRating: _userRating,
            latitude: _latitude,
            longitude: _longitude,
            noOfUserRate: 0
        });
        
        general.push(newGeneralArticle);
        Generalopt[msg.sender].push(int(newGeneralArticle.index));
    }

    function getStockArticle(uint256 index) public view returns (
        uint,
        address, 
        string[] memory, 
        string memory,
        string memory, 
        uint256, 
        uint256, 
        uint256, 
        uint256, 
        uint256, 
        uint256,
        uint256
    ) {
        require(index < stocks.length, "Index out of bounds for stocks");
        StockArticle memory article = stocks[index];
        return (
            article.index,
            article.owner, 
            article.tags, 
            article.image,
            article.content, 
            article.visibleWords, 
            article.price, 
            article.dateUploaded, 
            article.aiRating, 
            article.userRating,
            article.startDate,
            article.endDate
        );
    }

    function getGeneralArticle(uint256 index) public view returns (
        uint,
        address, 
        string[] memory, 
        string memory,
        string memory, 
        uint256, 
        uint256, 
        uint256, 
        uint256, 
        uint256,
        int256,
        int256
    ) {
        require(index < general.length, "Index out of bounds for general");
        GeneralArticle memory article = general[index];
        return (
            article.index,
            article.owner, 
            article.tags, 
            article.image,
            article.content, 
            article.visibleWords, 
            article.price, 
            article.dateUploaded, 
            article.aiRating, 
            article.userRating,
            article.latitude,
            article.longitude
        );
    }

    function payForStockArticle(uint256 index) public payable {
        require(index < stocks.length, "Index out of bounds for stocks");
        StockArticle storage article = stocks[index];

        require(msg.value >= article.price, "Insufficient payment");

        address payable owner = payable(article.owner);
        owner.transfer(article.price);

        stockopt[msg.sender].push(int(index));
    }


    function payForGeneralArticle(uint256 index) public payable {
        require(index < general.length, "Index out of bounds for general");
        GeneralArticle storage article = general[index];

        require(msg.value >= article.price, "Insufficient payment");

        address payable owner = payable(article.owner);
        owner.transfer(article.price);

        Generalopt[msg.sender].push(int(index));
    }

    function getStockOpt(address user) public view returns (int[] memory) {
        return stockopt[user];
    }

    function getGeneralOpt(address user) public view returns (int[] memory) {
        return Generalopt[user];
    }

    function getAllStockArticles() public view returns (StockArticle[] memory) {
        return stocks;
    }

    function getAllGeneralArticles() public view returns (GeneralArticle[] memory) {
        return general;
    }
}
