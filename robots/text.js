const algorithmia = require('algorithmia')
const algorithmiaAPIKEY =require('../credentials/algorithmia.json').apikey
const sentenceBoundaryDetection = require('sbd')
const watsonApiKey = require('../credentials/watson-nlu.json').apikey
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
const state = require('./state.js')

const nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey,
    version: '2018-04-05',
    url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
})

async function robot() {
    const content = state.load()

    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitNumberOfSentences(content)
    await fetchKeywordsOfAllSentences(content)

    state.save(content)

    async function fetchContentFromWikipedia(content) {
        const algorithmiaAuthenticated = algorithmia(algorithmiaAPIKEY)
        const algorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2')
        const response = await algorithm.pipe(content.searchTerm)
        const wikipediaContent = response.get()

        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(content) {
        const noBlankLinesAndMarkDown = removeBlankLinesAndMarkDown(content.sourceContentOriginal)
        const noDatesInParentheses = removeDatesInParentheses(noBlankLinesAndMarkDown)

        content.sourceContentSanitized = noDatesInParentheses

        function removeBlankLinesAndMarkDown(text) {
            const allLines = text.split('\n')

            const cleanText = allLines.filter(line => {
                if(line.trim().length === 0 || line.trim().startsWith('=')) {
                    return false
                }
                return true
            })

            return cleanText.join(' ')
        }

        function removeDatesInParentheses(text) {
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
          }
    }

    function breakContentIntoSentences(content) {
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach(sentence => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }

    function limitNumberOfSentences(content) {
        content.sentences = content.sentences.slice(0, content.maxNumberOfSentences)
 
    }

    async function fetchKeywordsOfAllSentences(content) {
        for(const sentence of content.sentences) {
            sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text)
        }
    }

    async function fetchWatsonAndReturnKeywords(sentence) {
        return new Promise((resolve, reject) => {
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }
            }, (error, response) => {
                if(error) {
                    throw error
                }
                const keywords = response.keywords.map(keyword => {
                    return keyword.text
                })
                resolve(keywords)
            })
        })
    }
}

module.exports = robot