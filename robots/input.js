const readline = require('readline-sync')
const state = require('./state.js')

function robot() {
    let content = {
        maxNumberOfSentences: 7
    }

    content.searchTerm = aksAndReturnSearchTerm()
    content.prefix  = askAndReturnPrefix()
    state.save(content)

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
}

module.exports = robot