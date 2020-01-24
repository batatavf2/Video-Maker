const readline = require('readline-sync')
const robots = {
    // userInput: require('./robots/user-input.js'),
    text: require('./robots/text')
}

async function start() {
    let content = {
        maxNumberOfSentences: 7
    }

    content.searchTerm = aksAndReturnSearchTerm()
    content.prefix  = askAndReturnPrefix()
    await robots.text(content)

    function aksAndReturnSearchTerm() {
        return readline.question('Type a Wikipedia search term: ')
    }

    function askAndReturnPrefix() {
        const prefixes = [
            'Who is',
            'What is',
            'The history of'
        ]

        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
        
        return prefixes[selectedPrefixIndex]
    }

    console.log(JSON.stringify(content, null, 4))
}

start()