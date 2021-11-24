require("@nomiclabs/hardhat-waffle");

const fs = require("fs")
const privateKey = fs.readFileSync(".secret").toString()
const projectId = "kWKuqtu7xR7WGFJRr7VmR753oxLC4ktObMBNqe73"

module.exports = {
    networks: {
        hardhat: {
            chainId: 1337
        },
        mumbai: {
            url: `https://jiy0rlcgkmtm.usemoralis.com:2053/server/${projectId}`,
            accounts: [privateKey]
        }
    },
    solidity: "0.8.4",
};
