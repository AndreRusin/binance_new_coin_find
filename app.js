const { Spot } = require('@binance/connector');
const TelegramBot = require('node-telegram-bot-api');
const users = require('./users.json');
const fs = require('fs');
require('dotenv').config()

let allBinanceWallets = [];

const token = process.env.TOKEN_BOT;
const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if(msg.text === '/start') {
        if(!users.find(user => user.chatId === chatId)) {
            users.push({"chatId": chatId})
            fs.writeFile('users.json',JSON.stringify(users), (err) => {
                if (err) console.log('Error save users.json file!')
            })

            bot.sendMessage(chatId, 'Welcome!');
        }
    }
});

async function checkWallet() {
    const client = new Spot(process.env.BINANCE_API_KEY, process.env.BINANCE_API_SECRET_KEY);

    let response = await client.coinInfo();
    const data = response.data;

    if (!allBinanceWallets.length) {
        allBinanceWallets = data;
    } else {
        console.log('Checking new wallets....');

        // Find new wallets
        const results = data.filter(({ coin: coin1 }) => !allBinanceWallets.some(({ coin: coin2 }) => coin2 === coin1));

        // If find new wallets
        if (results.length) {
            // Create message new wallets
            let message = "New wallet(s): \n";
            results.forEach(coin => {
                message += ` ${coin.name}: ${coin.coin} \n`
            })

            // Send message for all users
            users.forEach(user => {
                bot.sendMessage(user.chatId, message);
            })

        } else {
            console.log('No new wallets found.');
        }
    }
}

setInterval(checkWallet, 1000 * 60)