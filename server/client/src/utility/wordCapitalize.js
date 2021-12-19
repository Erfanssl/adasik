function wordCapitalize(word) {
    return word.toString().toLowerCase().replace(/^./, w => w.toUpperCase());
}

export default wordCapitalize;
