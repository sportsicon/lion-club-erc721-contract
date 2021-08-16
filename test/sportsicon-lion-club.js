const { expect } = require("chai");
const { waffle } = require("hardhat");
const { provider } = waffle;
const { parseEther } = ethers.utils;

describe("SportsIcon Lion Club", function () {
  let SportsIconLionClub;
  let token;
  let owner;
  let addr1;
  let addrs;

  beforeEach(async function () {
    SportsIconLionClub = await ethers.getContractFactory("SportsIconLionClub");
    [owner, addr1, ...addrs] = await ethers.getSigners();

    token = await SportsIconLionClub.deploy();
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
      await expect(token.mintLion(11)).to.be.revertedWith("Can only mint 10 Lions at a time");
    });

    it("Should fail if trying to mint with less Ether than required", async function () {
      await token.flipSaleState();
      await expect(
        token.connect(addr1).mintLion(2, { value: parseEther("0.07") })
      ).to.be.revertedWith("Ether value sent is not correct");
    });

    it("Should update total supply", async function () {
      await token.flipSaleState();
      await token.connect(addr1).mintLion(2, { value: parseEther("0.08") });

      expect(await token.totalSupply()).to.equal(2);
    });

    it("Should set correct token owner", async function () {
      await token.flipSaleState();
      await token.connect(addr1).mintLion(1, { value: parseEther("0.04") });

      expect(await token.tokenOfOwnerByIndex(addr1.address, 0)).to.equal(0);
    });

    it("Should have correct token URI", async function () {
      const baseURI = "https://gateway.pinata.cloud/ipfs/1234567890/";
      await token.flipSaleState();
      await token.setBaseURI(baseURI);
      await token.connect(addr1).mintLion(2, { value: parseEther("0.08") });

      expect(await token.tokenURI(1)).to.be.eq(`${baseURI}1`)
    });

    it("Should increase contract balance", async function () {
      await token.flipSaleState();
      await token.connect(addr1).mintLion(1, { value: parseEther("0.04") });

      expect(await provider.getBalance(token.address)).to.equal(parseEther("0.04"));
    });

  });

  describe("Reserve", function () {

    it("Should fail if trying to reserve too many tokens", async function () {
        await expect(
            token.reserveLions(addr1.address, 851)
        ).to.be.revertedWith("Not enough reserve left");
    });

    it("Should reserve correct amount", async function () {
        await token.reserveLions(addr1.address, 5);

        expect(await token.reserve()).to.equal(845);
        expect(await token.totalSupply()).to.equal(5);
    });

  });

  describe("Withdraw", function () {
    it("Should withdraw contract balance", async function () {
      const oldOwnerBalance = await provider.getBalance(owner.address);

      await token.flipSaleState();
      await token.connect(addr1).mintLion(1, { value: parseEther("0.04") });
      await token.withdraw();

      const newOwnerBalance = await provider.getBalance(owner.address);

      expect(await provider.getBalance(token.address)).to.equal(0);
      expect(newOwnerBalance.gt(oldOwnerBalance)).to.equal(true);
    });
  });

  describe("Provenance", function () {
    it("Should update provenance hash", async function () {
      const hash = "0dd395f7b65cb35643b442e7318f1ae8ff63c72f194956e9655f40e27f1c89f4";

      await token.setProvenanceHash(hash);

      expect(await token.provenanceHash()).to.equal(hash);
    });
  });

  describe("Helpers", function () {
    it("Should return tokens of given owner", async function () {
      await token.flipSaleState();
      await token.connect(addr1).mintLion(2, { value: parseEther("0.08") });

      const addr1tokens = await token.tokensOfOwner(addr1.address);

      expect(addr1tokens.length).to.equal(2);
      expect(addr1tokens[0]).to.equal(0);
      expect(addr1tokens[1]).to.equal(1);
    });
  });
});
