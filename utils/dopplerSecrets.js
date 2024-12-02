import { DopplerSDK } from require("@dopplerhq/node-sdk");

const DOPPLERSDK_ACCESS_TOKEN = process.env.DOPPLERSDK_ACCESS_TOKEN;

const sdk = new DopplerSDK({ accessToken: DOPPLERSDK_ACCESS_TOKEN });

module.exports = sdk;
    