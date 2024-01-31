const puppeteer = require('puppeteer');
// const express = require('express');
// const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const pdf2pic = require("pdf2pic");

// const app = express();

async function getDocuments(username, password, number) {
    const browser = await puppeteer.launch({
        headless: false
    });
    const page = await browser.newPage();
    await page.goto('https://app.botconversa.com.br');
    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.type('.fields__input', username);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.click('.sing-in__button');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.type('.password-field__input', password);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.click('.password__button');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.click('div[data-description="Bate-papo ao vivo"]');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.click('div.local-search input[placeholder="Busca"]');
    await page.type('div.local-search input[placeholder="Busca"]', number);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.click('.chat-room__content');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const chatMessages = await page.$$('.chat-message.another');
    let documents = [];

    for (let chatMessage of chatMessages) {
        const documentElement = await chatMessage.$('.document-message');
        if (documentElement) {
            const descriptionElement = await documentElement.$('.document-message__description');
            const description = await page.evaluate(descriptionElement => descriptionElement.textContent, descriptionElement);
            const downloadElement = await documentElement.$('.document-message__loader');
            const dateElement = await documentElement.$('span.date');
            if (downloadElement) {
                await downloadElement.click();
                await new Promise(resolve => setTimeout(resolve, 2000));
                const date = await page.evaluate((dateElement) => dateElement.innerText, dateElement);
                documents.push({name:description, date: date})
            }
        }
    }
    await browser.close();
    console.log(documents);
    return documents;
}

async function processFiles() {
    const files = await getDocuments("lucas@fique.online", "jrwL9Za2b*T_vt@", "11992960111");

    let documentsInBinary = [];
    files.forEach(element => {
        let nome = element.name;
        let arquivo = path.join('C:', 'Users', 'Usuário', 'Downloads', `${nome}`);
        fs.readFile(arquivo , 'utf8')
        .then(data => {
            const binaryData = Buffer.from(data).toString('binary');
            const jsonData = JSON.stringify(binaryData);
            documentsInBinary.push({archive: jsonData, date: element.date});
        })
        .catch(err => {
            throw err;
        });   
    });

    console.log(documentsInBinary);
}

processFiles();
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.post('/getDocuments', async (req, res) => {
//     console.log(req.body);
//     const body = req.body
//     const [user, pass, number] = [body.username, body.password, body.number]
//     const documents = await getDocuments(user, pass, number)


//     res.send({ "document": documents });
// });

// app.listen(3000, () => {
//     console.log('Porta 3000');
// });
