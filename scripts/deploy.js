async function main() {
    // This is just a convenience check
    if (network.name === "hardhat") {
      console.warn(
        "You are trying to deploy a contract to the Hardhat Network, which" +
          "gets automatically created and destroyed every time. Use the Hardhat" +
          " option '--network localhost'"
      );
    }

    // const _stakedToken = '0x756cF9d726ddB5cAA8A9ad0Ba1154C38249c1ce2'
    // const _rewardToken  = '0x756cF9d726ddB5cAA8A9ad0Ba1154C38249c1ce2'
    // const _rewardPerBlock   = "9259000000000000"
    // const _startBlock    = 36332309
    // const _bonusEndBlock     = 56332309
    // const _poolLimitPerUser     = 0
    // const _numberBlocksForUserLimit      = 0
    // const _admin       = '0xefD9B6698d977D6f3599911Afd00dFD4B1135766'
  
    // ethers is avaialble in the global scope
    const [deployer] = await ethers.getSigners();
    console.log(
      "Deploying the contracts with the account:",
      await deployer.getAddress()
    );
  
    console.log("Account balance:", (await deployer.getBalance()).toString());
    const _SmartChef = await ethers.getContractFactory("SmartChefInitializable");
    const SmartChef= await _SmartChef.deploy();
    await SmartChef.deployed();
    const SmartChefAddress = SmartChef.address
    console.log("Pool address:", SmartChef.address);
    // const SmartChefAddress = '0x0612d25a6f26B559E09A7021AF63b556a4db2784'  

    // const contract = await ethers.getContractAt("SmartChefInitializable", SmartChefAddress);
    // const initialize = await contract.initialize(_stakedToken,_rewardToken,_rewardPerBlock,_startBlock,_bonusEndBlock,_poolLimitPerUser,_numberBlocksForUserLimit,_admin,
    //   {
    //     gasPrice: ethers.utils.parseUnits('50', 'gwei'),
    //   })
    // await waitForTx(initialize.hash)
    // console.log(`Initializing contract with hash ${initialize.hash}`);  

  }

  const waitForTx = async (hash) => {
    const provider = ethers.provider
    console.log(`Waiting for tx: ${hash}...`)
    while (!await provider.getTransactionReceipt(hash)) {
        sleep(5000)
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  