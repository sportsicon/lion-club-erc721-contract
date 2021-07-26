const { expect } = require("chai");

describe("SportsIconLion", function () {
  let SportsIconLion;
  let token;
  let owner;
  let addr1;
  let addrs;

  beforeEach(async function () {
    SportsIconLion = await ethers.getContractFactory("SportsIconLion");
    [owner, addr1, ...addrs] = await ethers.getSigners();

    token = await SportsIconLion.deploy();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {

    it("Should fail if sale is not active", async function () {
      await expect(token.mintLion(1)).to.be.revertedWith("Sale must be active to mint Lion");
    });

    it("Should fail if trying to mint more than max amount", async function () {
      await token.flipSaleState();
      await expect(token.mintLion(10)).to.be.revertedWith("Can only mint 5 Lions at a time");
    });

    it("Should fail if trying to mint with less Ether than required", async function () {
      await token.flipSaleState();
      await expect(
        token.connect(addr1).mintLion(2, { value: ethers.utils.parseEther("0.049") })
      ).to.be.revertedWith("Ether value sent is not correct");
    });

    it("Should update total supply", async function () {
      await token.flipSaleState();
      await token.connect(addr1).mintLion(2, { value: ethers.utils.parseEther("0.05") });

      expect(await token.totalSupply()).to.equal(2);
    });

    it("Should set correct token owner", async function () {
      await token.flipSaleState();
      await token.connect(addr1).mintLion(1, { value: ethers.utils.parseEther("0.025") });

      expect(await token.tokenOfOwnerByIndex(addr1.address, 0)).to.equal(0);
    });

    it("Should have correct token URI", async function () {
      const baseURI = "https://gateway.pinata.cloud/ipfs/1234567890/";
      await token.flipSaleState();
      await token.setBaseURI(baseURI);
      await token.connect(addr1).mintLion(2, { value: ethers.utils.parseEther("0.05") });

      expect(await token.tokenURI(1)).to.be.eq(`${baseURI}1`)
    });

  });

    describe("Reserve", function () {

        it("Should fail if trying to reserve too many tokens", async function () {
            await expect(
                token.reserveLions(addr1.address, 21)
            ).to.be.revertedWith("Not enough reserve left for team");
        });

        it("Should reserve correct amount", async function () {
            await token.reserveLions(addr1.address, 5);

            expect(await token.reserve()).to.equal(15);
            expect(await token.totalSupply()).to.equal(5);
        });

    });
});
