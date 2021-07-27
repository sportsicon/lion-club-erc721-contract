const hre = require("hardhat");

async function main() {
  const SportsIconLionClub = await hre.ethers.getContractFactory("SportsIconLionClub");
  const contract = await SportsIconLionClub.deploy();

  console.log("Contract deployed to address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
