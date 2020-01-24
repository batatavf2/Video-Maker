const readline = require('readline-sync')

function start() {
    let content = {}

    content.searchTerm = aksAndReturnSearchTerm()
    content.prefix  = askAndReturnPrefix()

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

    console.log(content)
}

start()