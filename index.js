"use strict";
const TelegramBot = require("node-telegram-bot-api");
const Request = require("request");
const TOKEN = ''; // <- TOKEN GOES HERE

const bot = new TelegramBot(TOKEN, {
    polling: true
});

bot.onText(/\/start/, (msg) => {
    const greetMessage = `Aby sprawdzić status przesyłki  — wystarczy wysłać numer. \nŻyczenia i uwagi piszcie 👉🏼 @vrusin`;
    bot.sendMessage(msg.chat.id, greetMessage);
});

bot.on("message", msg => {
    const id = msg.chat.id;
    const messageText = msg.text;
    const regex = /^\d{20}/;
    const result = regex.test(messageText);

    if (result) {
        Request(`http://mobilna.poczta-polska.pl/MobiPost/getpackage?action=getPackageData&search=${messageText}`, 
        function (error, response, body) {
            if (response.statusCode === 200) {
                const data = JSON.parse(body);
                data.forEach(key => {
                    let message =
                        `${key.numer} \n📆 Data nadania: ${key.dataNadania} \n📦 ${key.masa} kg \n🏷 Rodzaj przesyłki: ${key.rodzPrzes} \n🏤 Jedn. Przeznaczenia: ${key.jednstkaPrzeznaczenia}`;

                    key.zdarzenia.forEach(action => {
                        message += `\n📆 ${action.czasZadrzenia} → 🔘${action.nazwa}`;
                    });
                    bot.sendMessage(id, message);
                });
            } else {
                bot.sendMessage(id, error);
            }
        });
    }
    // bot.sendMessage(id, '🤔 Wydaje się że wprowadziłeś błedny numer, sprobuj ponownie.');    
});