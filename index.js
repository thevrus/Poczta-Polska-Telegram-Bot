"use strict";
const TelegramBOT = require("node-telegram-bot-api");
const Request = require("request");
require("dotenv").config();

const TOKEN = process.env.TOKEN;
const BOT = new TelegramBOT(TOKEN, {
  polling: true
});

BOT.onText(/\/start/, msg => {
  const greetMessage = `Aby sprawdzić status przesyłki — wystarczy wysłać numer. \n
  Życzenia i uwagi piszcie 👉🏼 @vrusin`;
  BOT.sendMessage(msg.chat.id, greetMessage);
});

BOT.on("message", msg => {
  const id = msg.chat.id;
  const messageText = msg.text;
  const regex = /^\d{20}/;
  const result = regex.test(messageText);
  const request = `http://mobilna.poczta-polska.pl/MobiPost/getpackage?action=getPackageData&search=${messageText}`;

  function failureMessage() {
    BOT.sendMessage(id, "Coś poszło nie tak 🤔\nSprobuj ponownie!");
  }

  if (result) {
    Request(request, function(error, response, body) {
      if (response.statusCode === 200) {
        const data = JSON.parse(body);

        if (data.zdarzenia) {
          data.forEach(item => {
            let message = `
            ${item.numer} \n
            📆 Data nadania: ${item.dataNadania} \n
            📦 ${item.masa} kg \n
            🏷 Rodzaj przesyłki: ${item.rodzPrzes} \n
            🏤 Jedn. Przeznaczenia: ${item.jednstkaPrzeznaczenia}`;

            item.zdarzenia.forEach(action => {
              message += `\n📆 ${action.czasZadrzenia} → 🔘${action.nazwa}`;
            });

            BOT.sendMessage(id, message);
          });
        } else {
          failureMessage();
        }
      } else {
        failureMessage();
      }
    });
  }
});
