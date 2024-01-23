const puppeteer = require('puppeteer');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

async function getImages(username, password, number){
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--disable-gpu',
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--disable-gl-drawing-for-tests'],
        timeout: 120000
        })
    const page = await browser.newPage();
    // Fazendo login
    await page.goto('https://app.botconversa.com.br');
    await page.waitForTimeout(3000);
    await page.type('.fields__input', username);
    await page.waitForTimeout(3000);
    await page.click('.sing-in__button');
    await page.waitForTimeout(3000);
    await page.type('.password-field__input', password);
    await page.waitForTimeout(3000);
    await page.click('.password__button');
    await page.waitForTimeout(3000);
    await page.click('div[data-description="Bate-papo ao vivo"]');
    await page.waitForTimeout(3000);
    await page.click('div.local-search input[placeholder="Busca"]');
    await page.type('div.local-search input[placeholder="Busca"]', number); 
    await page.waitForTimeout(3000);
    await page.click('.chat-room__content');
    await page.waitForTimeout(3000);

    const chatMessages = await page.$$('.chat-message.another');
    // let documents = [];
    let images = [];

    for (let chatMessage of chatMessages) {
        const imageMessage = await chatMessage.$('.image-message');
        // const documentMessage = await chatMessage.$('.document-message');    
        if (imageMessage) {
            const imgElement = await imageMessage.$('img'); 
            const dateImgage = await imageMessage.$('span.date')
            if (imgElement) {
                const src = await imgElement.getProperty('src');
                const srcValue = await src.jsonValue();
                images.push(srcValue);
            }
        }
    }

    await browser.close();
    return images
    
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.post('/getImage', async (req, res) => {
    console.log(req.body);
    const body = req.body
    const [user, pass, number] = [body.username, body.password, body.number]
    const srcValue = await getImages(user, pass, number)
    
    
    res.send({ "src": srcValue });
});
  
app.listen(3000, () => {
    console.log('Porta 3000');
});
