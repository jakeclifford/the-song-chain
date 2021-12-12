import React, { useEffect } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/songPortal.json"

export default function App() {
  const [currentAccount, setCurrentAccount] = React.useState("")

  const [allSongs, setAllSongs] = React.useState([])
  const [mining, setMining] = React.useState(false)

  const contractAddress = "0xf3021962D22bd075129C31120FDff91dc640E1bc"
  const contractABI = abi.abi

  const getAllSongs = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const songPortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        
        const songs = await songPortalContract.getAllSongs()

        let songsCleaned = [];
        songs.forEach(song => {
          songsCleaned.push({
          address: song.poster,
          timestamp: new Date(song.timestamp * 1000),
          message: song.message
          })
        })

        setAllSongs(songsCleaned)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch(error){
      console.log(error)
    }
  }

  useEffect(() => {
    let songPortalContract;

    const onNewSong = (from, timestamp, message) => {
      console.log('NewSong', from, timestamp, message);
      setAllSongs(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        }
      ])
    }
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    songPortalContract = new ethers.Contract(contractAddress, contractABI, signer)
    songPortalContract.on('NewSong', onNewSong)
  }

  return () => {
    if (songPortalContract) {
      songPortalContract.off('NewSong', onNewSong)
    }
  }
  }, [])


  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        consle.log("Make sure you have a metamask");
        return;
      } else {
        console.log("We have the ethereum object", ethereum)
      }

      const accounts = await ethereum.request({method: 'eth_accounts'})

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("found an authorized account", account)
        setCurrentAccount(account)
        getAllSongs()
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error)
    }
  } 

  const connectWallet = async () => {
    try{
      const { ethereum } = window;

      if(!ethereum) {
        alert("Get Metamask!")
        return
      }

      const accounts = await ethereum.request({method: "eth_requestAccounts"})

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0])
    } catch (error){
      console.log(error)
    }
  }

  const song = async () => {
    try {
      const {ethereum} = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const songPortalContract = new ethers.Contract(contractAddress, contractABI, signer)

        const songTxn = await songPortalContract.addSong(document.getElementById('songURL').value, { gasLimit: 300000 })
        document.getElementById('songURL').value = ''
        console.log("Mining:", songTxn.hash)
        setMining(true)

        await songTxn.wait()
        console.log("Mined", songTxn.hash)
        setMining(false)

        let count = await songPortalContract.getTotalSongs()
        console.log('Retrieved total song count', count.toNumber())
      } else {
        console.log("ethereum does not exist")
      }
    }catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  
  
  return (
    <div className="mainContainer">
      
      <div className="dataContainer">
        <div className="header">
        The Song Chain
        </div>
        <div className='buttons'>
            <div className="bio">
            Add your favourite songs to the song portal,and store this information forever on the Blockchain !!
            </div>

            
            <textarea id="songURL" name="songURL" placeholder='Type a Youtube URl, Song Name, lyrics,  notes etc. Whatever you want!!!'/>
            <button className="songButton" onClick={song}>
              Add Song
            </button>
            {mining && <div><h3 className='wait'>Please Wait: Song is Recording.....</h3>
            <svg viewBox="0 0 400 400" >
            <g id="record">
            <circle r="200" cx="200" cy="200" />
            <circle class="line" r="180" cx="200" cy="200" />
            <circle class="line" r="160" cx="200" cy="200" />
            <circle class="line" r="140" cx="200" cy="200" />
            <circle id="label" cx="200" cy="200" r="65" />
            <text y="180" x="147">TheSongChain</text>  
            <text y="230" x="165">RECORDS</text>   
            <circle id="dot" cx="200" cy="200" r="6" />
            </g></svg></div>}

            {!currentAccount && (
              <button className="songButton" onClick={connectWallet}>Connect Wallet</button>
            )}

            {allSongs.map((song, index) => {
              return (
                <div className='song' key={index}>
                    <div className='message'>{song.message}</div>
                    <div className='smaller'>{song.address}</div>
                    <div className='smaller'>{song.timestamp.toString()}</div>
                    
                </div>

              )
            })}
          </div>
      </div>
    </div>
  );
}
