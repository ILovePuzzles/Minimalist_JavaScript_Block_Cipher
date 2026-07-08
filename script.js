 // Default library value
const defaultLibrary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ."
// Isolate important HTML elements based on their ID value
const elementLibrary = document.getElementById("library")
const elementOutput = document.getElementById("output")
const elementMode = document.getElementById("mode")

// Upon loading the page load the default library
elementLibrary.value = defaultLibrary
// Actualize the text below elementLibrary (character count)
updateHTML(elementLibrary)
// Actualize the text below elementMode (actual mode description)
updateHTML(elementMode)

// Upon loading the page add an event listener that tracks "input" and "focusout" events for selected HTML elements
document.querySelectorAll(".field, #library").forEach(element => element.addEventListener("input", function () {
    updateHTML(this)
}))
document.querySelectorAll(".field, #library").forEach(element => element.addEventListener("focusout", function () {
    updateHTML(this)
}))
document.getElementById("colorTheme").addEventListener('change', (event) => {
    if (event.target.type === 'radio') {
        let body = document.body

        if (event.target.value == "dark") {
            body.className = ''
            body.classList.add('dark-theme')
            document.querySelectorAll('textarea, input').forEach(element => {
                element.classList.remove('light-theme')
                element.classList.add('dark-theme')
            })
        }

        else {
            body.className = ''
            body.classList.add('light-theme')
            document.querySelectorAll('textarea, input').forEach(element => {
                element.classList.remove('dark-theme')
                element.classList.add('light-theme')
            })
        }
    }
})

// Depending on which element is clicked, reset the input fields, show or hide the instructions,
// encode the message, decode the message, or update the text below elementMode
document.getElementById("reset").onclick = function() { reset() }
document.getElementById("instrubtn").onclick = function() { instruct() }
document.getElementById("encode").onclick = function() { convert(true) }
document.getElementById("decode").onclick = function() { convert(false) }
document.getElementById("mode").onclick = function() { updateHTML(elementMode) }





// Method that updates the HTML
function updateHTML(element) {
    // If the element is not the encryption/decryption mode selector, update character count
    if (element.id != "mode") {
        document.querySelector(`#${element.id}P`).textContent = `Character count: ${element.value.length}`
    }

    // If the element is the encryption/decryption mode selector, update the text value. Also, if mode != 0,
    // make the unused textarea element readonly
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
    // For each element with the "field" class, reset the values
    document.querySelectorAll(".field", "#mode").forEach(element => {
        element.value = ""
        document.querySelector(`#${element.id}P`).textContent = ``
    })
    // For each element with the "otherField" class, reset the values
        document.querySelectorAll(".otherField").forEach(element => {
        element.value = ""
    })

    // Reload the default library
    elementLibrary.value = defaultLibrary
    // Actualize the text below elementLibrary (character count)
    updateHTML(elementLibrary)
    // Reset the default encryption/decryption mode value
    elementMode.value = 0
    // Actualize the text below elementMode (actual mode description)
    updateHTML(elementMode)
    // Actualize the CSS for elementOutput
    elementOutput.style.color = 'black'
    elementOutput.style.fontWeight = 'normal'
    elementOutput.style.borderColor = 'rgba(212, 175, 55, 1)'
}

// Method that shows/hides instructions
function instruct() {
    document.getElementById("instructions").classList.toggle('hidden')
}

// Method that allows to encode or decode a message
function convert(encode) {
    try {
        // Create an object to store the values
        // NOTE: the seed and its related values must be casted as a BigInt data type, otherwise the
        // multiplicativeInverse method will not work properly
        const infosEmpty = {
            library: "",
            libraryLength: 0,
            msg: "",
            msgLength: 0,
            prngSub: -1,
            seedSub: -1n,
            keySub: "",
            prngTra: -1,
            seedTra: -1n,
            keyTra: "",
            encode: encode,
            mode: Number(elementMode.value),
            result: ""
        }

        // Isolate important HTML elements based on their ID value
        const elementInput = document.getElementById("input")
        const elementKeySub = document.getElementById("keySub")
        const elementKeyTra = document.getElementById("keyTra")

        // Validate then set the properties for the object "infosEmpty"
        const infosLibrary = setLibrary(elementLibrary.value.toString(), infosEmpty)
        const infosMsg = validate(elementInput.value.toString(), infosLibrary, "msg")
        const infosKey1 = validate(elementKeySub.value.toString(), infosMsg, "keySub")
        const infosKey2 = validate(elementKeyTra.value.toString(), infosKey1, "keyTra")

        // If no error has been thrown, update the HTML elements, then encode or decode the message using the keys
        elementInput.value = infosKey2.msg.toString()
        updateHTML(elementInput)
        document.getElementById("prngSub").value = (infosKey2.prngSub != -1 ? infosKey2.prngSub : "")
        document.getElementById("seedSub").value = (infosKey2.seedSub != -1n ? infosKey2.seedSub : "")
        document.getElementById("prngTra").value = (infosKey2.prngTra != -1 ? infosKey2.prngTra : "")
        document.getElementById("seedTra").value = (infosKey2.seedTra != -1n ? infosKey2.seedTra : "")
        elementKeySub.value = infosKey2.keySub.toString()
        updateHTML(elementKeySub)
        elementKeyTra.value = infosKey2.keyTra.toString()
        updateHTML(elementKeyTra)

        const infosResult = crypt(infosKey2)

        // Update "elementOutput" HTML value and CSS style
        elementOutput.value = infosResult.result.toString()
        elementOutput.style.color = 'black'
        elementOutput.style.fontWeight = 'normal'
        elementOutput.style.borderColor = 'rgba(212, 175, 55, 1)'
        elementOutput.focus()
    }

    catch (error) {
        // Update "elementOutput" HTML value and CSS style
        elementOutput.value = error
        elementOutput.style.color = 'red'
        elementOutput.style.fontWeight = 'bold'
        elementOutput.style.borderColor = 'red'
        elementOutput.focus()
    }
}

// Method that validates the library
function setLibrary(library, infos) {
    infos.libraryLength = library.length

    // If the library length is of valid length, continue by validating that each character is unique
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

    // If the library length is of invalid length, throw an error message
    else { throw new Error("the library cannot be empty and cannot contain more than 256 characters.") }
}

// Method that validates the input message and the 2 keys
// If a string are valid but too short, the method expands the string
function validate(value, infos, contentID) {
    // If the element is one of the keys
    if (contentID != "msg") { return validateKey(value, value.length, infos, contentID) }

    // If the element is the message
    else { return validateMsg(value, value.length, infos) }





    // Method that validates the message value
    function validateMsg(value, valueLength, infos) {
        // If the message is made of characters from the library
        if (validateCharacterContent(value, valueLength, infos.library)) {
            // If the message length is valid
            // NOTE: the maximal length of the message has been set to 65536 since the period of the PRNG is exactly 65537,
            // the message must be a multiple of the library length and 65537 is a prime number. The closest composite
            // number below 65537 is 65536 = 2^16 = 256^2, which is equal to the maximal library length squared.
            if (valueLength > 0 && valueLength < 65537) {
                // If the message length is not equal to the library length nor a multiple of it,
                // expand the message by adding copies of the same pseudorandom character at the end
                if (valueLength % infos.libraryLength != 0) {
                    const rndPRNGValue = Math.floor(Math.random() * 4) + 1
                    const rndSeedValue = BigInt(Math.floor(Math.random() * 65537))
                    // Generate a list with one pseudorandom value
                    const numberList = inversiveCongruentialGenerator(1, infos.libraryLength, rndPRNGValue, rndSeedValue, true);

                    // Expand the message with a padding character until the message length is valid, using the
                    // pseudorandom number list as an index value for the library
                    for (let i = valueLength; i < valueLength + infos.libraryLength - valueLength % infos.libraryLength; i++) {
                        value += infos.library[numberList[0]].toString()
                    }
                }

                // Update the properties of the object "infos"
                infos.msg = value.toString()
                infos.msgLength = infos.msg.length

                return infos
            }

            // If the message is empty, throw an error
            else if (valueLength == 0) { throw new Error("the message cannot be empty.") }
 
            // If the message is larger than the square of the library length, throw an error
            else { throw new Error("the message cannot be more than 65536 characters long.") }
        }

        // If the message contains characters that are not in the library, throw an error
        else { throw new Error("the message must contain characters from the library only.") }
    }

    // Method that validates the key value
    function validateKey(value, valueLength, infos, contentID) {
        // Define a specific error message
        let errorMsg = (contentID == "keySub" ? "substitution" : "transposition")

        // If the mode of encryption/decryption is not substitution and transposition combined (mode != 0)
        // If infos.mode == -1 -> substitution only, then fill keyTra with zeros
        // If infos.mode == 1 -> transposition only, then fill keySub with zeros
        if ((infos.mode == -1 && contentID == "keyTra") || (infos.mode == 1 && contentID == "keySub")) {
            let text = ""

            // Generate a string of zeros
            for (let i = 0; i < infos.msgLength; i++) {
                text += "0".toString()
            }

            // Update the object "infos" properties depending on which key is under consideration
            infos.mode == -1 ? infos.keyTra = text.toString() : infos.keySub = text.toString()

            return infos
        }

        // If the key is made of characters from the library
        else if (validateCharacterContent(value, valueLength, infos.library)) {
            // If the key is smaller than the message
            if (valueLength < infos.msgLength) {
                let numberList

                // If we are evaluating the substitution key
                if (contentID == "keySub") {
                    infos.prngSub = validatePRNGValue(document.getElementById("prngSub"), errorMsg)
                    infos.seedSub = validateSeedValue(document.getElementById("seedSub"), errorMsg)

                    // Generate a list of pseudorandom numbers
                    numberList = inversiveCongruentialGenerator(infos.msgLength - valueLength, infos.libraryLength, infos.prngSub, infos.seedSub, false) 
                }

                // If we are evaluating the transposition key
                else {
                    infos.prngTra = validatePRNGValue(document.getElementById("prngTra"), errorMsg)
                    infos.seedTra = validateSeedValue(document.getElementById("seedTra"), errorMsg)

                    // Generate a list of pseudorandom numbers
                    numberList = inversiveCongruentialGenerator(infos.msgLength - valueLength, infos.libraryLength, infos.prngTra, infos.seedTra, false) 
                }                 

                // Expand the message with padding characters until the message length is valid, using the
                // pseudorandom number list as index values for the library
                for (let i = valueLength, count = 0; i < infos.msgLength; i++) {
                    value += infos.library[numberList[count++]].toString()
                }
            }

            // If the key is longer than the message, throw an error
            else if (valueLength > infos.msgLength) { throw new Error("the " + errorMsg + " key cannot be longer than the message.") }
            
            // Update the object infos depending on which key has been validated
            contentID == "keySub" ? infos.keySub = value.toString() : infos.keyTra = value.toString()

            return infos
        }

        // If the key contains characters that are not in the library, throw an error
        else { throw new Error("the " + errorMsg + " key must contain characters from the library only.") }
    }

    // Method that validates that the provided string value contains characters from the library only
    function validateCharacterContent(value, valueLength, library) {
        // If the value contains a character that is not in the library, then the value is not valid
        for (let i = 0; i < valueLength; i++) {
            if (!library.includes(value[i].toString())) { return false }
        }

        return true
    }

    // Method that validates the prngValue
    function validatePRNGValue(prngElement, errorMsg) {
        let prngValue = prngElement.value

        // If "prngValue" has a defined value, validate the value
        if (prngValue != "") {
            // If the prngValue is not an integer, throw an error message
            if (prngValue != Math.floor(prngValue)) { throw new Error("the " + errorMsg + " PRNG value must be an integer value.") }
                            
            // If the prngValue is an integer from 1 to 4, set the value of infos.prngSub
            else if (prngValue > 0 && prngValue < 5) { return Number(prngElement.value) }
                            
            // If the value is off-range, throw an error message
            else { throw new Error("the " + errorMsg + " PRNG values must range from 1 to 4.") }
        }

        // If "prngValue" is empty, generate a value from 1 to 4
        else { return Math.floor(Math.random() * 4) + 1 }
    }

    function validateSeedValue(seedElement, errorMsg) {
        let seedValue = seedElement.value

        // If the seed has a defined value, validate the value
        if (seedValue != "") {
            // If the seed is not an integer, throw an error message
            if (seedValue != Math.floor(seedValue)) { throw new Error("the " + errorMsg + " seed must be an integer value.") }
                                
            // If the seed is an integer from 0 to 65536, set the value of infos.seedSub
            // NOTE: the seed must be casted as a BigInt, otherwise the multiplicativeInverse method does not work properly
            else if (seedValue > -1 && seedValue < 65537) { return BigInt(seedElement.value) }
                                
            // If the value is off-range, throw an error message
            else { throw new Error("the " + errorMsg + " values must range from 0 to 65536.") }
        }

        // If "seedValue" is empty, generate a seed from 0 to 65536
        // NOTE: the seed must be casted as a BigInt, otherwise the multiplicativeInverse method does not work properly
        else { return BigInt(Math.floor(Math.random() * 65537)) }
    }
}

// Method that encrypts/decrypts the message using the keys
function crypt(infos) {
    infos.result = infos.msg.toString()

    // The counter helps to split the message into smaller substrings
    let counter = -1
    let partialMsg
    let partialKey
    let result = ""
    let initValue
    let valueShift
    let finalValue

    // Select encryption/decryption mode
    switch (infos.mode) {
        case -1:
            infos.result = substitute(infos, counter, partialMsg, partialKey, result, initValue, valueShift, finalValue).toString()
            break
        case 0:
            infos.encode ? infos.result = substitute(infos, counter, partialMsg, partialKey, result, initValue, valueShift, finalValue).toString() :
            infos.result = transpose(infos, counter, partialMsg, partialKey, result, initValue, valueShift, finalValue).toString()

            infos.encode ? infos.result = transpose(infos, counter, partialMsg, partialKey, result, initValue, valueShift, finalValue).toString() :
            infos.result = substitute(infos, counter, partialMsg, partialKey, result, initValue, valueShift, finalValue).toString()
            break
        case 1:
            infos.result = transpose(infos, counter, partialMsg, partialKey, result, initValue, valueShift, finalValue).toString()
            break
    }

    return infos





    // Method that substitutes the characters and returns a string
    function substitute(infos, counter, partialMsg, partialKey, result, initSymb, substitution, finalSymb) {
        // Define the sign accordingly to encoding vs decoding; substitution encoding is based on modular addition,
        // while substitution decoding is based on modular subtraction
        const sign = (infos.encode ? 1 : -1)

        // While the message has not been completely transformed
        while (++counter * infos.libraryLength < infos.msgLength) {
            // Split the input message and substitution key into substrings of the length of the library
            partialMsg = Array.from(infos.result.toString().substring(counter * infos.libraryLength, (counter + 1) * infos.libraryLength))
            partialKey = Array.from(infos.keySub.toString().substring(counter * infos.libraryLength, (counter + 1) * infos.libraryLength))

            for (let i = 0; i < infos.libraryLength; i++) {
                // Find actual symbol index value
                initSymb = infos.library.indexOf(partialMsg[i].toString())
                // Find transposition displacement value using key
                substitution = infos.library.indexOf(partialKey[i].toString())
                // Compute (initial symbol index + displacement) mod infos.libraryLength
                finalSymb = (initSymb + sign * substitution + infos.libraryLength) % infos.libraryLength

                // Substitute the old symbol for the new one
                partialMsg[i] = infos.library[finalSymb].toString()
            }

            // Join the characters and add the string to result
            result += partialMsg.join("")
        }

        return result
    }

    // Method that transposes the characters and returns a string
    function transpose(infos, counter, partialMsg, partialKey, result, initPos, transposition, finalPos) {
        // Define the start, end, and step values according to encoding vs decoding; transposition encoding
        // starts from the beginning of the string up to the end, while transposition decoding starts from
        // the end of the string down to the beginning
        const start = (infos.encode ? 0 : infos.libraryLength - 1)
        const end = (infos.encode ? infos.libraryLength : -1)
        const step = (infos.encode ? 1 : -1)

        // While the message has not been completely transformed
        while (++counter * infos.libraryLength < infos.msgLength) {
            // Split the input message and transposition key into substrings of the length of the library
            partialMsg = Array.from(infos.result.toString().substring(counter * infos.libraryLength, (counter + 1) * infos.libraryLength))
            partialKey = Array.from(infos.keyTra.toString().substring(counter * infos.libraryLength, (counter + 1) * infos.libraryLength))

            for (initPos = start; initPos != end; initPos += step) {
                // Find transposition displacement value using key
                transposition = infos.library.indexOf(partialKey[initPos].toString())
                // Compute (initial position index + displacement) mod infos.libraryLength
                finalPos = ((initPos + transposition) % infos.libraryLength)

                // Swap the character's positions
                [partialMsg[initPos], partialMsg[finalPos]] = [partialMsg[finalPos], partialMsg[initPos]]
            }

            // Join the characters and add the string to result
            result += partialMsg.join("")
        }

        return result
    }
}

// Method that generates a list of pseudorandom numbers using a seed (PRNG)
function inversiveCongruentialGenerator(valueCount, libraryLength, prng, seed, msgBool) {
    // Create a temp object to store the list of pseudorandom numbers. If the seed is used to
    // generate/complete the keys, store the final value of the seed in the object
    const list = []
    let a
    let c

    // Select an inversive congruential pseudorandom number generator based on a primitive polynomial such that
    // x^2 - cx - a over GF(65537)
    // NOTE: the seed and related values must be casted as BigInts. Otherwise the multiplicativeInverse method will not work properly
    switch (prng) {
        case 1:
            a = 11549n
            c = 62819n
            break
        case 2:
            a = 19267n
            c = 52783n
            break
        case 3:
            a = 26981n
            c = 42829n
            break
        case 4:
            a = 42403n
            c = 32771n
            break
    }

    for (let i = 0; i < valueCount; i++) {
        seed == 0n ? seed = c : seed = BigInt((a * multiplicativeInverse(seed) + c) % 65537n)

        // Cast the seed as a Number data type, since libraryLength is not a BigInt, but a Number data type
        list.push(Number(seed) % libraryLength)
    }

    return list



    // Modular multiplicative inversion based on Fermat's little theorem
    // The theorem states:
    // Given two positive integers a and p, where a is coprime to p, the following expression holds:
    // a^(p - 1) % p == 1
    // Since a * a^(p - 2) == a^(p - 1), the above expression implies:
    // a * a^(p - 2) % p == 1
    // Hence, a^(p - 2) is the modular multiplicative inverse of a
    function multiplicativeInverse(a) {
        // 1 and 65536 are their own multiplicative inverses
        if (a == 1n || a == 65536n) { return a }

        let b = a
        // Variable for the method reduce
        let r

        // Each cycle of the for loop is equivalent to the function: f(a) = (b * a^2) % 65537 -> b^3 % 65537
        // Then f^2(a) = f(f(a)) is equivalent to: f(f(a)) = (b^3 * a^4) % 65537 -> b^7 % 65537
        // If we represent the n-th cycle of the for loop by a number n from 1 to 15, we can write f^n(a) as:
        // f^n(a) = a^(2^n) * b^(2^n - 1) % 65537 -> b^(2^n) * b^(2^n - 1) % 65537 = b^(2^n + 2^n - 1) % 65537 =
        // b^(2 * 2^n - 1) % 65537 = b^(2^(n + 1) - 1) % 65537
        // If n = 15, we get f^15(a) -> b^(2^(15 + 1) - 1) % 65537 = b^(65536 - 1) % 65537 = b^65535 % 65537
        for (let i = 0; i < 15; i++) {
            a = reduce(a * a, r)
            a = reduce(b * a, r)
        }

        return a

        // Modular reduction
        function reduce(c, r) {
            // Fast modular reduction, with a possibility of negative values
            r = (c & 65535n) - (c >> 16n)

            // Value correction for negative results only
            if (r < 0n) { r += 65537n }

            return r
        }
    } 
}
