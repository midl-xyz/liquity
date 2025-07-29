import { ethers } from "hardhat";

async function main() {

  const troveM = await ethers.getContractAt("TroveManager", "0xb7cbeDF58c82D6EeA58286916aB3214fa7A1dD81");

  console.log(await troveM.getTroveDebt("0x122F8A4FB2761160a39a768001A7071DFF7a39f6"));
console.log("finished")

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
