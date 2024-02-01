const puppeteer = require('puppeteer')
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs').promises
const path = require('path')
const app = express()
async function getDocuments(username, password, number, lastDate) {
    const browser = await puppeteer.launch({
        headless: false
    })
    const page = await browser.newPage()
    await page.goto('https://app.botconversa.com.br')
    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })
    await new Promise(resolve => setTimeout(resolve, 2000))
    await page.type('.fields__input', username)
    await new Promise(resolve => setTimeout(resolve, 2000))
    await page.click('.sing-in__button')
    await new Promise(resolve => setTimeout(resolve, 2000))
    await page.type('.password-field__input', password)
    await new Promise(resolve => setTimeout(resolve, 2000))
    await page.click('.password__button')
    await new Promise(resolve => setTimeout(resolve, 2000))
    await page.click('div[data-description="Bate-papo ao vivo"]')
    await new Promise(resolve => setTimeout(resolve, 2000))
    await page.click('div.local-search input[placeholder="Busca"]')
    await page.type('div.local-search input[placeholder="Busca"]', number)
    await new Promise(resolve => setTimeout(resolve, 2000))
    await page.click('.chat-room__content')
    await new Promise(resolve => setTimeout(resolve, 2000))
    const chatMessages = await page.$$('.chat-message.another')    
    let documents = []
    for (let chatMessage of chatMessages) {
        const documentElement = await chatMessage.$('.document-message')
        const dateElement = await chatMessage.$('span.date')
        const date = await page.evaluate((dateElement) => dateElement.innerText, dateElement)
        if (documentElement) {
            const descriptionElement = await documentElement.$('.document-message__description')
            const description = await page.evaluate(descriptionElement => descriptionElement.textContent, descriptionElement)
            const downloadElement = await documentElement.$('.document-message__loader')
            if (downloadElement) {
                const messageDate = new Date(date)
                const lastDateObj = new Date(lastDate)
                if (messageDate.getTime() > lastDateObj.getTime()) {
                    await downloadElement.click()
                    await new Promise(resolve => setTimeout(resolve, 2000))
                    documents.push({ name: description, date: date })
                }
            }
        }
    }
    await browser.close()
    console.log(documents)
    return documents
}
async function processFiles(username, password, number, lastDate) {
    const files = await getDocuments(username, password, number, lastDate)
    let documentsInBinary = []
    if (!files.length == 0) {
        for (const element of files) {
            let nome = element.name
            let arquivo = path.join(`C:/Users/Usuário/Downloads/${nome}`)
            try {
                const data = await fs.readFile(arquivo, 'utf8')
                const binaryData = Buffer.from(data).toString('binary')
                const jsonData = JSON.stringify(binaryData)
                documentsInBinary.push({ archive: jsonData, date: element.date })
                await fs.unlink(arquivo)
            } catch (err) {
                throw err
            }
        }
    }
    return documentsInBinary
}
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.post('/getDocuments', async (req, res) => {
    console.log(req.body)
    const body = req.body
    const [user, pass, number, lastDate] = [body.username, body.password, body.number, body.lastDate]
    const documents = await processFiles(user, pass, number, lastDate)
    res.send({ "document": documents })
})
app.listen(3000, () => {
    console.log('Porta 3000')
})
