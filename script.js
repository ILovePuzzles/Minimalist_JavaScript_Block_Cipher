const defaultLibrary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ." // Default library value
const elementLibrary = document.getElementById("library") // HTML element with id="library"
const elementOutput = document.getElementById("output") // HTML element with id="output"

elementLibrary.value = defaultLibrary // Upon loading the page load the default library
updateCSS(elementLibrary) // Actualize the width of elementLibrary
updateHTML(elementLibrary) // Actualize the character count of elementLibrary
document.querySelectorAll(".field, #library").forEach(element => element.addEventListener("input", function () {
    updateCSS(this)
    if (element.id !== "output" && element.id != "seed") { updateHTML(this) }
})) // Upon loading the page add an event listener that track "input" events for selected HTML elements
document.querySelectorAll(".field, #library").forEach(element => element.addEventListener("focusout", function () {
    updateCSS(this)
    if (element.id !== "output" && element.id != "seed") { updateHTML(this) }
})) // Upon loading the page add an event listener that track "focusout" events for selected HTML elements

// Depending on which button is clicked, reset the input fields, show or hide instructions,
// encode the message, or decode the message
document.getElementById("reset").onclick = function() { reset() }
document.getElementById("instrubtn").onclick = function() { instruct() }
document.getElementById("encode").onclick = function() { convert(true) }
document.getElementById("decode").onclick = function() { convert(false) }





// Method that updates the element width provided as an argument, in "ch" units
function updateCSS(element) {
    if (element.id != "input" && element.id != "output") {
        if (element.value.length > 20) { element.style.width = (element.value.length + 10) + "ch" }
        else { element.style.width = 30 + "ch" }
    }

    else {
        if (element.value.length >= 60) { element.style.width = 70 + "ch"}
        else if (element.value.length > 20 && element.value.length < 60) { element.style.width = (element.value.length + 10) + "ch" }
        else { element.style.width = 30 + "ch" }
    }

}

// Method that updates the HTML
function updateHTML(element) {
    document.querySelector(`#${element.id}P`).textContent = `Character count: ${element.value.length}`
}

// Method that resets the fields
function reset() {
    document.querySelectorAll(".field").forEach(element => {
        element.value = ""
        updateCSS(element)

        let elementId = element.id

        if (elementId !== "output" && element.id != "seed") { document.querySelector(`#${elementId}P`).textContent = ``}
    }) // Reset the fields
    elementLibrary.value = defaultLibrary // Upon loading the page load the default library
    updateCSS(elementLibrary) // Actualize the width of elementLibrary
    updateHTML(elementLibrary) // Actualize the character count of elementLibrary
}

// Method that shows/hides instructions
function instruct() {
    document.getElementById("instructions").classList.toggle('hidden')
}

// Method that allows to encode or decode a message
function convert(encode) {
    try {
        // Validate then set the variables
        const library = setLibrary(elementLibrary.value).toString()
        if (library === "") { throw new Error("invalid library. The library cannot be empty and " +
            "cannot contain the same character twice.") }

        let seed = document.getElementById("seed").value

        if (seed < 0 || seed > 256) { throw new Error("invalid seed value. The seed values range from 0 to 256.") }
         // If seed is undefined, set the value to -1, in order to automatically generate a seed later
        if (seed == "") { seed = -1 }

        if (document.getElementById("input").value.length == 0) { throw new Error("invalid input message. "+
            "The input message cannot be empty.") }
        if (document.getElementById("keySub").value.length > library.length) { throw new Error("invalid substitution key. "+
            "The substitution key cannot be longer than the library.") }
        if (document.getElementById("keyTra").value.length > library.length) { throw new Error("invalid transposition key. "+
            "The transposition key cannot be longer than the library.") }

        const input = validate(document.getElementById("input"), library, true).toString()
        if (input === "") { throw new Error("invalid input message. The input message must contain characters " +
            "from the library only. Also, the input message cannot be larger than the library length squared.") }

        const keySub = validate(document.getElementById("keySub"), library, false, seed).toString()
        if (keySub === "") { throw new Error("invalid substitution key. The substitution key cannot be empty, " +
            "and cannot be longer than the library. It must contain characters from the library only.") }

        const keyTra = validate(document.getElementById("keyTra"), library, false, seed).toString()
        if (keyTra === "") { throw new Error("invalid transposition key. The transposition key cannot be empty, " +
            "and cannot be longer than the library. It must contain characters from the library only.") }

        // If no error has been thrown, encode or decode the message using the keys
        // Once the message has been converted, show the output value
        const output = crypt(encode, input, library, keySub, keyTra)

        elementOutput.value = output.toString()
        updateCSS(elementOutput)
    }

    catch (error) {
        elementOutput.value = error
        updateCSS(elementOutput)
    }
}

// Method that validates and then sets the library
function setLibrary(library) {
    const libraryLength = library.length

    if (libraryLength > 1 && libraryLength < 257) {
        let isInvalid = false

        // If the library contains the same character twice, then the library is invalid
        for (let i = 0; i < libraryLength - 1; i++) {
            isInvalid = library.substring(i + 1).includes(library[i])

            if (isInvalid) { break }
        }
        
        return (isInvalid ? "" : library)
    }

    return ""
}

// Method that validates the input and the 2 keys, and returns either a validated string or an empty string
// If the string is too short, the method expands the string
function validate(element, library, msgBool, seed) {
    value = element.value
    const valueLength = value.length
    const libraryLength = library.length

    let isValid = true

    // If the value contains a character that is not in the library, then the value is not valid
    for (let i = 0; i < valueLength; i++) {
        isValid = library.includes(value[i])

        if (!isValid) { break }
    }

    // If the element value is valid and its length is too short
    if (isValid && valueLength <= libraryLength) {
        // If the element is one of the keys
        if (!msgBool) {
            // If the element id="repeat" is checked, repeat the existing pattern
            if (!document.getElementById("pseudorandom").checked && valueLength != 0) {
                for (let i = valueLength; i < libraryLength; i++) {
                value += value[i % valueLength].toString()
                }
            }

            // If the element id="pseudorandom" is checked instead, then add pseudorandom characters to the message
            else if (document.getElementById("pseudorandom").checked) {
                const list = inversiveCongruentialGenerator(libraryLength - valueLength, libraryLength, seed);
                let count = 0;

                for (let i = valueLength; i < libraryLength; i++) {
                    value += library[list[count++]].toString()
                }
            }
        }

        // If the element is the message
        else {
            const list = inversiveCongruentialGenerator(1, libraryLength, -1);

            for (let i = valueLength; i < libraryLength; i++) {
                value += library[list[0]].toString()
            }
        }
            
        element.value = value.toString()
        updateCSS(element)
        updateHTML(element)
    }

    else if (isValid && msgBool) {
        if (valueLength > libraryLength * libraryLength) {
            isValid = false;
        }

        else if (valueLength % libraryLength != 0) {
            const list = inversiveCongruentialGenerator(1, libraryLength, -1);

            for (let i = valueLength; i < valueLength + libraryLength - valueLength % libraryLength; i++) {
                value += library[list[0]].toString()
            }

            element.value = value.toString()
            updateCSS(element)
            updateHTML(element)
        }
    }

    return (isValid ? value : "")
}

// Method that substitutes and transposes the characters and returns a string
function crypt(encode, input, library, keySub, keyTra) {
    const msgLength = input.length
    const libraryLength = library.length
    let message = ""
    // The counter servers two purposes :
    // 1. It helps to split the message into smaller substrings;
    // 2. It helps to shift the library, in order to reuse the keys differently.
    let counter = -1
    let partialMsg = ""

    const sign = (encode ? 1 : -1)
    const start = (encode ? 0 : libraryLength - 1)
    const end = (encode ? libraryLength : -1)
    const step = (encode ? 1 : -1)

    while (++counter * libraryLength < msgLength) {
        // Split the input message into substrings of the length of the library
        partialMsg = Array.from(input.toString().substring(counter * libraryLength, (counter + 1) * libraryLength))

        for (let initPos = start; initPos != end; initPos += step) {
            // Find transposition displacement value using key
            let transposition = library.indexOf(keyTra[initPos].toString())
            // Compute (initial position + displacement + counter) mod libraryLength
            let finalPos = (initPos + transposition + counter) % libraryLength;

            let initSymb1 = library.indexOf(partialMsg[initPos].toString())
            // Find substitution displacement value 1 using key
            let substitution1 = (encode ? library.indexOf(keySub[initPos].toString()) : library.indexOf(keySub[finalPos].toString()))
            // Compute (initial symbol 1 + displacement + counter) mod libraryLength
            let finalSymb1 = (initSymb1 + sign * (substitution1 + counter) + libraryLength) % libraryLength

            let initSymb2 = library.indexOf(partialMsg[finalPos].toString())
            // Find substitution displacement value 2 using key
            let substitution2 = (encode ? library.indexOf(keySub[finalPos].toString()) : library.indexOf(keySub[initPos].toString()))
            // Compute (initial symbol 2 + displacement + counter) mod libraryLength
            let finalSymb2 = (initSymb2 + sign * (substitution2 + counter) + libraryLength) % libraryLength

            // Change symbol values and swap values
            partialMsg[initPos] = library[finalSymb2].toString()
            partialMsg[finalPos] = library[finalSymb1].toString()
        }

        message += partialMsg.join("")
    }

    return message
}

// Method that generates a pseudorandom number list (PRNG)
function inversiveCongruentialGenerator(valueCount, libraryLength, seed) {
    // If the seed was undefined, generate a pseudorandom seed
    if (seed = -1) { seed = Math.floor(Math.random() * 256) + 1 }
    const valueList = []

    for (let i = 0; i < valueCount; i++) {
        // Inversive congruential generator based on the primitive polynomial (x^2 - 250x - 105) over GF[257]
        seed == 0 ? seed = 250 : seed = (105 * invertAByte(seed) + 250) % 257

        valueList.push(seed % libraryLength)
    }

    return valueList



    // Modular multiplicative inversion based on Fermat's Little theorem (branchless code)
    function invertAByte(a) {
        let b = a

        // Each cycle of the for loop is equivalent to f(a) = b * a^2 = b^3
        // f(f(a)) = b^3 * a^4 = b^7
        // If we represent the n-th cycle by a number n from 1 to 3, we can write f^n(a) = a^(2^(n + 1) - 1)
        // If n = 7, on obtient f^7(a) = a^(2^(7 + 1) - 1) = a^(256 - 1) = a^255, ce qui est le résultat attendu
        for (let i = 0; i < 7; i++) {
            a = reduce(a * a)
            a = reduce(b * a)
        }

        return a;

        function reduce(c) {
            // Fast modular reduction, with a possibility of negative values
            let r = (c & 255) - (c >> 8)

            // Value correction for negative results
            return (r + ((r >> 15) & 257))
        }
    }
}
