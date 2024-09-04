// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UserProfile {

    struct User {
        string backgroundImageLink;
        string profilePicLink;
        string about;
        uint256 moneySpent;
        uint256 moneyGained;
        uint256 totalTransactions;
        string userTag;
    }

    mapping(address => User) private users;

    function setUserProfile(
        string memory _backgroundImageLink,
        string memory _profilePicLink,
        string memory _about,
        uint256 _moneySpent,
        uint256 _moneyGained,
        uint256 _totalTransactions,
        string memory _userTag
    ) public {
        User storage user = users[msg.sender];
        user.backgroundImageLink = _backgroundImageLink;
        user.profilePicLink = _profilePicLink;
        user.about = _about;
        user.moneySpent = _moneySpent;
        user.moneyGained = _moneyGained;
        user.totalTransactions = _totalTransactions;
        user.userTag = _userTag;
    }

    function getUserProfile(address _userAddress) public view returns (
        string memory,
        string memory,
        string memory,
        uint256,
        uint256,
        uint256,
        string memory
    ) {
        User storage user = users[_userAddress];
        return (
            user.backgroundImageLink,
            user.profilePicLink,
            user.about,
            user.moneySpent,
            user.moneyGained,
            user.totalTransactions,
            user.userTag
        );
    }
}
