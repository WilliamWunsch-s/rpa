const puppeteer = require('puppeteer');
// const express = require('express');
// const bodyParser = require('body-parser');
const fs = require('fs').promises;

// const app = express();

async function getDocuments(username, password, number) {
    const browser = await puppeteer.launch({
        headless: false,
        userDataDir: './user_data',
        defaultViewport: null,
        args: [
            `--download.default_directory=${process.cwd()}/C:/Users/Usuário/Downloads`
        ]
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
            const downloadElement = await documentElement.$('.document-message__loader');
            if (downloadElement) {
                const descriptionElement = await documentElement.$('.document-message__description');
                const fileName = await page.evaluate(element => element.textContent, descriptionElement);
                await downloadElement.click();
                await page.waitForNavigation({ waitUntil: 'networkidle0' });

                const filePath = path.join('C:/Users/Usuário/Downloads', fileName);
                try {
                    const fileData = await fs.readFile(filePath);
                    const binaryData = Buffer.from(fileData).toString('binary');

                    documents.push(binaryData);

                    await fs.unlink(filePath);
                } catch (error) {
                    console.error(`Error reading or converting file: ${error}`);
                }
            }
        }
    }
    await browser.close();
    console.log(documents);
    return documents;

}
getDocuments("lucas@fique.online", "jrwL9Za2b*T_vt@", "11992960111")
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
