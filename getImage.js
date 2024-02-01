const puppeteer = require('puppeteer')
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
async function getImages(username, password, number, lastDate){
    const browser = await puppeteer.launch(
        {
            headless: true,
            args: ['--disable-gpu',
              '--disable-setuid-sandbox',
              '--no-sandbox',
              '--disable-gl-drawing-for-tests'],
            timeout: 120000
          }
    );
    const page = await browser.newPage()
    await page.goto('https://app.botconversa.com.br')
    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })
    await new Promise(resolve => setTimeout(resolve, 3000))
    await page.type('.fields__input', username)
    await new Promise(resolve => setTimeout(resolve, 3000))
    await page.click('.sing-in__button')
    await new Promise(resolve => setTimeout(resolve, 3000))
    await page.type('.password-field__input', password)
    await new Promise(resolve => setTimeout(resolve, 3000))
    await page.click('.password__button')
    await new Promise(resolve => setTimeout(resolve, 3000))
    await page.click('div[data-description="Bate-papo ao vivo"]')
    await new Promise(resolve => setTimeout(resolve, 3000))
    await page.click('div.local-search input[placeholder="Busca"]')
    await page.type('div.local-search input[placeholder="Busca"]', number)
    await new Promise(resolve => setTimeout(resolve, 3000))
    await page.click('.chat-room__content')
    await new Promise(resolve => setTimeout(resolve, 3000))
    const chatMessages = await page.$$('.chat-message.another')
    let images = []
    function base64ToBinary(base64) {
        let binary = atob(base64)
        return binary
    }
    for (let chatMessage of chatMessages) {
        const imageMessage = await chatMessage.$('.image-message')
        if (imageMessage) {
            const imgElement = await imageMessage.$('img')
            
            const dateElement = await imageMessage.$('span.date')
            if (imgElement && dateElement) {
                const src = await imgElement.getProperty('src')
                let srcValue = await src.jsonValue()
                let base64 = srcValue.split(',')
                let base64Image = base64[1].trim()
                let binaryImage = base64ToBinary(base64Image)

                const date = await page.evaluate((dateElement) => dateElement.innerText, dateElement)
                const messageDate = new Date(date)
                const lastDateObj = new Date(lastDate)

                if(messageDate.getTime() > lastDateObj.getTime()){
                    images.push({src: binaryImage, date: date})
                }
            }
        }
    
    }
    console.log(images)
    await browser.close()
    return images    
}
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.post('/getImages', async (req, res) => {
    console.log(req.body)
    const body = req.body
    const [user, pass, number, lastDate] = [body.username, body.password, body.number, body.lastDate]
    const srcValue = await getImages(user, pass, number, lastDate)
    
    
    res.send({ "src": srcValue })
})
  app.listen(3000, () => {
    console.log('Porta 3000')
})

