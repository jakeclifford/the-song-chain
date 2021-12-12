// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract SongPortal {
    uint256 totalSongs;

    uint256 private seed;

    event NewSong (address indexed from, uint256 timestamp, string message);

    struct Song {
        address poster;
        string message;
        uint256 timestamp;
    }

    Song[] songs;

    mapping(address => uint256) public lastSongAt;

    constructor() payable {
        console.log("Welocome to the song portal, Post your song");

        seed = (block.timestamp + block.difficulty) % 100;
    }

    function addSong(string memory _message) public {

        require(
            lastSongAt[msg.sender] + 30 seconds < block.timestamp,
            "wait 30s"
        );

        lastSongAt[msg.sender] = block.timestamp;

        totalSongs += 1;
        console.log("%s has posted a song", msg.sender);

        songs.push(Song(msg.sender, _message, block.timestamp));

        seed = (block.difficulty + block.timestamp + seed) % 100;
        
        if (seed <= 10){
            console.log("%s win!", msg.sender);
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has!!"
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract");
        }
        
        emit NewSong(msg.sender, block.timestamp, _message);
    }

    function getAllSongs() public view returns (Song[] memory) {
        return songs;
    }

    function getTotalSongs() public view returns (uint256){
        console.log("We have %d total songs", totalSongs);
        return totalSongs;
    }
}

