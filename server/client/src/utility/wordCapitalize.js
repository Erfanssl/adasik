function wordCapitalize(word) {
    return word.replace(/^./, w => w.toUpperCase());
}

export default wordCapitalize;