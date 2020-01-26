const gm = require('gm').subClass({ imageMagick: true })
const state = require('./state.js')
var videoshow = require('videoshow')

async function robot() {
    const content = state.load()

    await convertAllImages(content)
    await createAllSentenceImages(content)
    await createYouTubeThumbnail()
    await renderVideo(content)

    state.save(content)

    async function convertAllImages(content) {
        for (sentenceIndex in content.sentences) {
            await convertImage(sentenceIndex)
        }
    }

    async function convertImage(sentenceIndex) {
        return new Promise((resolve, reject) => {
            const inputFile = `./content/${sentenceIndex}-original.png[0]`
            const outputFile = `./content/${sentenceIndex}-converted.png`
            const width = 1920
            const height = 1080

            gm()
                .in(inputFile)
                .out('(')
                .out('-clone')
                .out('0')
                .out('-background', 'white')
                .out('-blur', '0x9')
                .out('-resize', `${width}x${height}^`)
                .out(')')
                .out('(')
                .out('-clone')
                .out('0')
                .out('-background', 'white')
                .out('-resize', `${width}x${height}`)
                .out(')')
                .out('-delete', '0')
                .out('-gravity', 'center')
                .out('-compose', 'over')
                .out('-composite')
                .out('-extent', `${width}x${height}`)
                .write(outputFile, (error) => {
                    if (error) {
                        return reject(error)
                    }

                    resolve()
                })
        })
    }

    async function createAllSentenceImages(content) {
        for (const sentenceIndex in content.sentences) {
            await createSentenceImage(sentenceIndex, content.sentences[sentenceIndex].text)
        }
    }

    async function createSentenceImage(sentenceIndex, sentenceText) {
        return new Promise((resolve, reject) => {
            const outputFile = `./content/${sentenceIndex}-sentence.png`

            const templateSettings = {
                0: {
                    size: '1920x400',
                    gravity: 'center'
                },
                1: {
                    size: '1920x1080',
                    gravity: 'center'
                },
                2: {
                    size: '800x1080',
                    gravity: 'west'
                },
                3: {
                    size: '1920x400',
                    gravity: 'center'
                },
                4: {
                    size: '1920x1080',
                    gravity: 'center'
                },
                5: {
                    size: '800x1080',
                    gravity: 'west'
                },
                6: {
                    size: '1920x400',
                    gravity: 'center'
                }
            }

            gm()
                .out('-size', templateSettings[sentenceIndex].size)
                .out('-gravity', templateSettings[sentenceIndex].gravity)
                .out('-background', 'transparent')
                .out('-fill', 'white')
                .out('-kerning', '-1')
                .out(`caption:${sentenceText}`)
                .write(outputFile, (error) => {
                    if (error) {
                        return reject(error)
                    }

                    resolve()
                })
        })
    }

    async function createYouTubeThumbnail() {
        return new Promise((resolve, reject) => {
            gm()
                .in('./content/0-converted.png')
                .write('./content/youtube-thumbnail.jpg', (error) => {
                    if (error) {
                        return reject(error)
                    }

                    resolve()
                })
        })
    }

    async function renderVideo(content) {
        const videoOptions = require('../templates/1/videoOptions.js')

        return new Promise((resolve, reject) => {
            let images = [];

            for (const sentenceIndex in content.sentences) {
                images.push({
                    path: `./content/${sentenceIndex}-converted.png`,
                    caption: content.sentences[sentenceIndex].text
                });
            }

            console.log(images)

            videoshow(images, videoOptions)
                .audio("./templates/1/Ketsa-The_Stork.mp3")
                .save("content/output.mp4")
                .on("start", function (command) {
                    console.log("> Processo ffmpeg iniciado:", command);
                })
                .on("error", function (err, stdout, stderr) {
                    console.error("Error:", err);
                    console.error("> ffmpeg stderr:", stderr);
                    reject(err);
                })
                .on("end", function (output) {
                    console.error("> Video criado:", output);
                    resolve();
                });
        });
    }
}

module.exports = robot