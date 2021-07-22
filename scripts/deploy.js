const hre = require("hardhat");

async function main() {
  const SportsIconLion = await hre.ethers.getContractFactory("SportsIconLion");
  const contract = await SportsIconLion.deploy();

  console.log("Contract deployed to address:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
