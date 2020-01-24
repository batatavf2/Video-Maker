const algorithmia = require('algorithmia')
const algorithmiaAPIKEY =require('../credentials/algorithmia.json').apiKey
const sentenceBoundaryDetection = require('sbd')


async function robot(content) {
    await fetchContentFromWikipedia(content)
    sanitizeContent(content)
    breakContentIntoSentences(content)


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
        content.senteces = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach(sentence => {
            content.senteces.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }
}

module.exports = robot