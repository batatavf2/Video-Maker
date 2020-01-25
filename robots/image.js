const imageDownloader = require('image-downloader')
const state = require('./state.js')
const google = require('googleapis').google
const googleSearchCredentials = require('../credentials/google-search.json')

async function robot() {
    const customSearch = google.customsearch('v1')
    const content = state.load()

    await fetchImagesOfAllSenteces(content)
    await downloadImages(content)
    state.save(content)

    async function fetchImagesOfAllSenteces(content) {
        for(const sentence of content.sentences) {
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fetchGoogleAndReturnImagesLinks(query)
            sentence.googleSearchQuery = query
        }
    }

    async function fetchGoogleAndReturnImagesLinks(query) {
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apikey,
            cx: googleSearchCredentials.searchEngineId,
            q: query,
            searchType: 'image',
            num: 2
        })

        const imagesUrl = response.data.items.map(item => {
            return item.link
        })

        return imagesUrl
    }

    async function downloadImages(content) {
        content.downloadedImages = []

        for(const sentenceIndex in content.sentences) {
            const images = content.sentences[sentenceIndex].images

            for(const imageUrl of images) {
                try {
                    if(content.downloadedImages.includes(imageUrl)) {
                        throw new Error('Duplicate image')
                    }

                    await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`)
                    console.log(`success: ${imageUrl}`)
                    content.downloadedImages.push(imageUrl)
                    break
                }
                catch(error) {
                    console.log(`Error(${imageUrl}: ${error}) `)
                }
            }
        }
    }

    async function downloadAndSave(url, filename) {
        return imageDownloader.image({
            url: url,
            dest: `./content/${filename}`
        })
    }
}

module.exports = robot