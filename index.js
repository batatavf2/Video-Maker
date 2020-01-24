const robots = {
    input: require('./robots/input.js'),
    text: require('./robots/text')
}

async function start() {
    robots.input()
    await robots.text()


    const content = robots.state.load()
    console.log(JSON.stringify(content, null, 4))
}

start()