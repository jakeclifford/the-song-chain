const main = async () => {
    
    const songContractFactory = await hre.ethers.getContractFactory('SongPortal');
    const songContract = await songContractFactory.deploy({
        value: hre.ethers.utils.parseEther('0.1'),
    })
    await songContract.deployed()
    console.log("Contract deployed to:", songContract.address)
    
    let contractBalance = await hre.ethers.provider.getBalance(
        songContract.address
    )
    console.log(
        'Contract balance:', 
        hre.ethers.utils.formatEther(contractBalance)
    )

    let songTxn = await songContract.addSong('Another little sing song')
    await songTxn.wait()

    songTxn = await songContract.addSong('Another little sing song number 2')
    await songTxn.wait()

    songTxn = await songContract.addSong('Another little sing song number 2')
    await songTxn.wait()

    songTxn = await songContract.addSong('Another little sing song number 2')
    await songTxn.wait()
   
    contractBalance = await hre.ethers.provider.getBalance(songContract.address)
    console.log(
        'Contract balance:',
        hre.ethers.utils.formatEther(contractBalance)
      );

    let allSongs = await songContract.getAllSongs()
    console.log(allSongs)
}



const runMain = async () => {
    try {
        await main()
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();