const defaultLibrary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ." // Default library value
const elementLibrary = document.getElementById("library") // HTML element with id="library"
const elementOutput = document.getElementById("output") // HTML element with id="output"
const elementMode = document.getElementById("mode") // HTML element with id="mode"

elementLibrary.value = defaultLibrary // Upon loading the page load the default library
updateHTML(elementLibrary) // Actualize the character count of elementLibrary
updateHTML(elementMode) // Actualize the actual mode of elementMode
document.querySelectorAll(".field, #library").forEach(element => element.addEventListener("input", function () {
    if (element.id != "output" && element.id != "seed") { updateHTML(this) }
})) // Upon loading the page add an event listener that tracks "input" events for selected HTML elements
document.querySelectorAll(".field, #library").forEach(element => element.addEventListener("focusout", function () {
    if (element.id != "output" && element.id != "seed") { updateHTML(this) }
})) // Upon loading the page add an event listener that tracks "focusout" events for selected HTML elements

// Depending on which button is clicked, reset the input fields, show or hide instructions,
// encode the message, or decode the message
document.getElementById("reset").onclick = function() { reset() }
document.getElementById("instrubtn").onclick = function() { instruct() }
document.getElementById("encode").onclick = function() { convert(true) }
document.getElementById("decode").onclick = function() { convert(false) }
document.getElementById("mode").onclick = function() { updateHTML(elementMode) }





// Method that updates the HTML
function updateHTML(element) {
    if (element.id != "mode") {
        document.querySelector(`#${element.id}P`).textContent = `Character count: ${element.value.length}`
    }

    else {
        let keySub = document.getElementById("keySub")
        let keyTra = document.getElementById("keyTra")
        keySub.readOnly = false
        keyTra.readOnly = false

        let text

        switch (Number(element.value)) {
            case -1:
                text = "Substitution only mode"
                keyTra.readOnly = true
                break
            case 0:
                text = "Transposition and substitution mode"
                break
            case 1:
                text = "Transposition only mode"
                keySub.readOnly = true
                break
        }

        document.querySelector(`#${element.id}P`).textContent = text
    }
}

// Method that resets the fields
function reset() {
    document.querySelectorAll(".field").forEach(element => {
        element.value = ""

        let elementId = element.id

        if (elementId !== "output" && element.id != "seed") { document.querySelector(`#${elementId}P`).textContent = ``}
        if (elementId == "mode") { document.querySelector(`#${element.id}P`).textContent = `` }
    }) // Reset the fields
    elementLibrary.value = defaultLibrary // Upon loading the page load the default library
    updateHTML(elementLibrary) // Actualize the character count of elementLibrary
    elementMode.value = 0
    updateHTML(elementMode)
    document.getElementById("pseudorandom").checked = true
}

// Method that shows/hides instructions
function instruct() {
    document.getElementById("instructions").classList.toggle('hidden')
}

// Method that allows to encode or decode a message
function convert(encode) {
    try {
        // Create an object to store the values
        const infosEmpty = {
            library: "",
            libraryLength: 0,
            msg: "",
            msgLength: 0,
            seed: -1n,
            keySub: "",
            keyTra: "",
            encode: encode,
            mode: Number(elementMode.value),
            result: ""
        }

        const elementInput = document.getElementById("input")
        const elementKeySub = document.getElementById("keySub")
        const elementKeyTra = document.getElementById("keyTra")

        // Validate then set the values for the object infos
        const infosLibrary = setLibrary(elementLibrary.value, infosEmpty)
        const infosMsg = validate(elementInput, infosLibrary, "msg")
        const infosKey1 = validate(elementKeySub, infosMsg, "keySub")
        const infosKey2 = validate(elementKeyTra, infosKey1, "keyTra")

        // If no error has been thrown, update HTML, then encode or decode the message using the keys
        elementInput.value = infosKey2.msg.toString()
        updateHTML(elementInput)
        elementKeySub.value = infosKey2.keySub.toString()
        updateHTML(elementKeySub)
        elementKeyTra.value = infosKey2.keyTra.toString()
        updateHTML(elementKeyTra)

        const infosResult = crypt(infosKey2)

        // Update HTML
        elementOutput.value = infosResult.result.toString()
        elementOutput.style.color = 'black'
        elementOutput.style.fontWeight = 'normal'
        elementOutput.style.borderColor = 'black'
    }

    catch (error) {
        // Update HTML
        elementOutput.value = error
        elementOutput.style.color = 'red'
        elementOutput.style.fontWeight = 'bold'
        elementOutput.style.borderColor = 'red'
    }
}

// Method that validates the library
function setLibrary(library, infos) {
    infos.libraryLength = library.length

    // If the library length is from 2 to 256 characters long, validate that each character is unique
    if (infos.libraryLength > 1 && infos.libraryLength < 257) {
        let isInvalid = false

        // If the library contains the same character twice, then the library is invalid
        for (let i = 0; i < infos.libraryLength - 1; i++) {
            isInvalid = library.substring(i + 1).includes(library[i])

            if (isInvalid) { throw new Error("the library cannot contain the same character twice.") }
        }
        
        infos.library = library.toString()

        return infos
    }

    // If the library length is invalid, throw an error message
    else
    {
        throw new Error("the library cannot be empty and cannot contain more than 256 characters.")
    }
}

// Method that validates the input and the 2 keys
// If a string are too short, the method expands the string
function validate(element, infos, contentID) {
    value = element.value
    const valueLength = value.length

    // If the element is one of the keys
    if (contentID != "msg") {
        let errorMsg = (contentID == "keySub" ? "substitution" : "transposition")

        // If the mode of encryption/decryption is not substitution and transposition combined
        // infos.mode == -1 -> substitution only, fill keyTra with zeros
        // infos.mode == 1 -> transposition only, fill keySub with zeros
        if ((infos.mode == -1 && contentID == "keyTra") || (infos.mode == 1 && contentID == "keySub")) {
            let text = ""

            for (let i = 0; i < infos.msgLength; i++) {
                text += "0".toString()
            }

            // Update the object infos depending on which key is under consideration
            infos.mode == -1 ? infos.keyTra = text.toString() : infos.keySub = text.toString()

            return infos
        }

        // If the key is made of characters from the library
        else if (validateCharactersContent(value, valueLength, infos.library)) {
            // If the key is smaller than the message
            if (valueLength < infos.msgLength) {
                // If the element id="repeat" is checked and the key is not empty, repeat the existing pattern
                if (!document.getElementById("pseudorandom").checked && valueLength != 0) {
                    for (let i = valueLength; i < infos.msgLength; i++) {
                        value += value[i % valueLength].toString()
                    }
                }

                // If the element id="pseudorandom" is checked instead, then add pseudorandom characters to the message
                else if (document.getElementById("pseudorandom").checked) {
                    // If we are validating the seed value for the first time
                    if (contentID == "keySub") {
                        let seedValue = document.getElementById("seed").value
          
                        // If the seed has a defined value, validate the value
                        if (seedValue != "") {
                            // If the seed is not an integer, throw an error message
                            if (seedValue != Math.floor(seedValue)) { throw new Error("the seed must be an integer value.") }
                          
                            // If the seed is an integer from 0 to 65536, set the value of infos.seed
                            else if (seedValue > -1 && seedValue < 65537) { infos.seed = BigInt(document.getElementById("seed").value) }
                        
                            // If the value is off range, throw an error message
                            else { throw new Error("the seed values must range from 0 to 65536.") }
                        }
                    }
        
                    // Generate an object that contains a list of pseudorandom numbers and the current seed value
                    const tempObject = inversiveCongruentialGenerator(infos.msgLength - valueLength, infos.libraryLength, infos.seed, false)
                    infos.seed = tempObject.seed
                    let count = 0

                    // Expand the string using the pseudorandom number list as index values for the library
                    for (let i = valueLength; i < infos.msgLength; i++) {
                        value += infos.library[tempObject.list[count++]].toString()
                    }
                }

                // If the element id="repeat" is checked and the key is empty, throw an error
                else {
                    throw new Error("the " + errorMsg + " key cannot be empty if mode 2 is selected.")
                }
            }

            // If the key is longer than the message, throw an error
            else if (valueLength > infos.msgLength) {
                throw new Error("the " + errorMsg + " key cannot be longer than the message.")
            }
            
            // Update the object infos depending on which key has been validated
            contentID == "keySub" ? infos.keySub = value.toString() : infos.keyTra = value.toString()

            return infos
        }

        // If the key contains characters that are not in the library, throw an error
        else { throw new Error("the " + errorMsg + " key must contain characters from the library only.") }
    }

    // If the element is the message
    else {
        // If the key is made of characters from the library
        if (validateCharactersContent(value, valueLength, infos.library)) {
            if (valueLength > 0 && valueLength < infos.libraryLength * infos.libraryLength + 1) {
                // If the message length is not equal to the library length nor a multiple of it,
                // expand the message by adding copies of the same pseudorandom character at the end
                if (valueLength % infos.libraryLength != 0) {
                    const tempObject = inversiveCongruentialGenerator(1, infos.libraryLength, -1, true);

                    for (let i = valueLength; i < valueLength + infos.libraryLength - valueLength % infos.libraryLength; i++) {
                        value += infos.library[tempObject.list[0]].toString()
                    }
                }

                // Update the object infos
                infos.msg = value.toString()
                infos.msgLength = infos.msg.length

                return infos
            }

            // If the message is empty, throw an error
            else if (valueLength == 0) { throw new Error("the message cannot be empty.") }
 
            // If the message is larger than the square of the library length, throw an error
            else { throw new Error("the message cannot be longer than the square of the library length.") }
        }

        // If the message contains characters that are not in the library, throw an error
        else { throw new Error("the message must contain characters from the library only.") }
    }



    function validateCharactersContent(value, valueLength, library) {
        // If the value contains a character that is not in the library, then the value is not valid
        for (let i = 0; i < valueLength; i++) {
            if (!library.includes(value[i].toString())) { return false }
        }

        return true
    }
}

// Method that encrypts/decrypts the message using the keys
function crypt(infos) {
    infos.result = infos.msg.toString()

    switch (infos.mode) {
        case -1:
            infos.encode ? infos.result = substitute(infos).toString() : infos.result =  substitute(infos).toString()
            break
        case 0:
            infos.encode ? infos.result = transpose(infos).toString() : infos.result = substitute(infos).toString()
            infos.encode ? infos.result = substitute(infos).toString() : infos.result = transpose(infos).toString()
            break
        case 1:
            infos.encode ? infos.result = transpose(infos).toString() : infos.result = transpose(infos).toString()
            break
    }

    return infos





    // Method that substitutes the characters and returns a string
    function substitute(infos) {
        // The counter servers two purposes :
        // 1. It helps to split the message into smaller substrings;
        // 2. It helps to shift the library, in order to reuse the keys differently.
        let counter = -1
        let partialMsg
        let partialKey
        let result = ""

        let initSymb
        let substitution
        let finalSymb
        // Define the sign accordingly to encoding vs decoding; encoding is based on modular addition,
        // while decoding is based on modular subtraction
        const sign = (infos.encode ? 1 : -1)

        // While the message has not been completely transformed
        while (++counter * infos.libraryLength < infos.msgLength) {
            // Split the input message and key into substrings of the length of the library
            partialMsg = Array.from(infos.result.toString().substring(counter * infos.libraryLength, (counter + 1) * infos.libraryLength))
            partialKey = Array.from(infos.keySub.toString().substring(counter * infos.libraryLength, (counter + 1) * infos.libraryLength))

            for (let i = 0; i < infos.libraryLength; i++) {
                // Find actual symbol index value
                initSymb = infos.library.indexOf(partialMsg[i].toString())
                // Find transposition displacement value using key
                substitution = infos.library.indexOf(partialKey[i].toString())
                // Compute (initial position + displacement + counter) mod infos.libraryLength
                finalSymb = (initSymb + sign * (substitution + counter) + 2 * infos.libraryLength) % infos.libraryLength

                // Substitute the old symbol for the new one
                partialMsg[i] = infos.library[finalSymb].toString()
            }

            // Join the characters and add the string to result
            result += partialMsg.join("")
        }

        return result
    }

    // Method that transposes the characters and returns a string
    function transpose(infos) {
        // The counter servers two purposes :
        // 1. It helps to split the message into smaller substrings;
        // 2. It helps to shift the library, in order to reuse the keys differently.
        let counter = -1
        let partialMsg
        let partialKey
        let result = ""

        let initPos
        let transposition
        let finalPos
        // Define the start, end, and step values according to encoding vs decoding; encoding starts from the beginning of
        // the string up to the end, while decoding starts from the end of the string down to the beginning
        const start = (infos.encode ? 0 : infos.libraryLength - 1)
        const end = (infos.encode ? infos.libraryLength : -1)
        const step = (infos.encode ? 1 : -1)

        // While the message has not been completely transformed
        while (++counter * infos.libraryLength < infos.msgLength) {
            // Split the input message and key into substrings of the length of the library
            partialMsg = Array.from(infos.result.toString().substring(counter * infos.libraryLength, (counter + 1) * infos.libraryLength))
            partialKey = Array.from(infos.keyTra.toString().substring(counter * infos.libraryLength, (counter + 1) * infos.libraryLength))

            for (initPos = start; initPos != end; initPos += step) {
                // Find transposition displacement value using key
                transposition = infos.library.indexOf(partialKey[initPos].toString())
                // Compute (initial position + displacement + counter) mod infos.libraryLength
                finalPos = (initPos + transposition + counter) % infos.libraryLength;

                // Swap the character's positions
                [partialMsg[initPos], partialMsg[finalPos]] = [partialMsg[finalPos], partialMsg[initPos]]
            }

            // Join the characters and add the string to result
            result += partialMsg.join("")
        }

        return result
    }
}

// Method that generates a pseudorandom number list (PRNG)
function inversiveCongruentialGenerator(valueCount, libraryLength, seed, msgBool) {
    // Create an object to store the list of pseudorandom numbers. If the seed is used to
    // generate/complete the keys, store the final value of the seed in the object
    const tempObject = {
        list: [],
        seed: msgBool ? -1n : seed
    }

    // If the seed is undefined, generate a pseudorandom seed
    if (seed == -1n) { seed = BigInt(Math.floor(Math.random() * 256) + 1) }

    for (let i = 0; i < valueCount; i++) {
        // Inversive congruential pseudorandom number generator based on the primitive polynomial (x^2 - 46585x - 42403) over GF[65537]
        // NOTE: the seed and related values must be casted as BigInts. Otherwise the multiplicativeInverse method does not work properly
        seed == 0n ? seed = 46585n : seed = BigInt((42403n * multiplicativeInverse(seed) + 46585n) % 65537n)

        // Cast the seed as a Number data type, since libraryLength is not a BigInt, but a Number data type
        tempObject.list.push(Number(seed) % libraryLength)
    }

    // If the seed has been used for generating key values, store the new seed value
    if (!msgBool) { tempObject.seed = seed }

    return tempObject



    // Modular multiplicative inversion based on Fermat's Little theorem
    function multiplicativeInverse(a) {
        // 1 and 65536 are their own multiplicative inverse
        if (a == 1n || a == 65536n) { return a }

        let b = a

        // Each cycle of the for loop is equivalent to f(a) = b * a^2 = b^3
        // f(f(a)) = b^3 * a^4 = b^7
        // If we represent the n-th cycle by a number n from 1 to 3, we can write f^n(a) = a^(2^(n + 1) - 1)
        // If n = 7, on obtient f^7(a) = a^(2^(7 + 1) - 1) = a^(256 - 1) = a^255, ce qui est le résultat attendu
        for (let i = 0; i < 15; i++) {
            a = reduce(a * a)
            a = reduce(b * a)
        }

        return a;

        // Modular reduction
        function reduce(c) {
            // Fast modular reduction, with a possibility of negative values
            let r = (c & 65535n) - (c >> 16n)

            // Value correction for negative results
            if (r < 0n) { r += 65537n }

            return r
        }
    } 
}
