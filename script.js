 // Default library value
const defaultLibrary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ .!\"#$%&'()*+,-/:;<=>?@[\\]^_`{|}~¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ–—‘’“”…•\n€αβγδεζηθικλμνξοπρςστυφχψωĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞ"
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
                if (element.id != "output") {
                    element.classList.remove('light-theme')
                    element.classList.add('dark-theme')
                }

                else {
                    element.style.backgroundColor = 'black'

                    if (!element.classList.contains('error')) {
                        element.style.color = 'white'
                    }
                }
            })
        }

        else {
            body.className = ''
            body.classList.add('light-theme')
            document.querySelectorAll('textarea, input').forEach(element => {
                if (element.id != "output") {
                    element.classList.remove('dark-theme')
                    element.classList.add('light-theme')
                }

                else {
                    element.style.backgroundColor = 'white'

                    if (!element.classList.contains('error')) {
                        element.style.color = 'black'
                    }
                }
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
function updateHTML(element, time) {
    // If the element is not the encryption/decryption mode selector, update character count
    if (element.id != "mode") {
        document.querySelector(`#${element.id}P`).textContent = `Character count: ${element.value.length}`

        if (element.id == "output") {
            if (time != -1) {
                document.querySelector(`#${element.id}P`).textContent = `The process took ${time} seconds to complete`
            }

            else {
                document.querySelector(`#${element.id}P`).textContent = ``
            }
        }
    }

    // If the element is the encryption/decryption mode selector, update the text value. Also, if mode != 0,
    // make the unused textarea element readonly
    else {
        let seedSub = document.getElementById("seedSub")
        let seedTra = document.getElementById("seedTra")
        seedSub.readOnly = false
        seedTra.readOnly = false

        let text

        switch (Number(element.value)) {
            case -1:
                text = "Substitution only mode"
                seedTra.readOnly = true
                break
            case 0:
                text = "Transposition and substitution mode"
                break
            case 1:
                text = "Transposition only mode"
                seedSub.readOnly = true
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

        if (element.id == "output") { document.querySelector(`#${element.id}P`).textContent = `` }
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
    elementOutput.classList.remove('error')

    if (document.body.classList.contains('light-theme')) { elementOutput.style.color = 'black' }

    else { elementOutput.style.color = 'white' }
}

// Method that shows/hides instructions
function instruct() {
    document.getElementById("instructions").classList.toggle('hidden')
}

// Method that allows to encode or decode a message
async function convert(encode) {
    const start = performance.now()

    try {
        elementOutput.classList.remove('error')

        if (document.body.classList.contains('light-theme')) { elementOutput.style.color = 'black' }

        else { elementOutput.style.color = 'white' }

        elementOutput.value = "Conversion in progress"

        // Isolate important HTML elements based on their ID value
        const elementMsg = document.getElementById("input")
        const elementSeedSub = document.getElementById("seedSub")
        const elementSaltSub = document.getElementById("saltSub")
        const elementSeedTra = document.getElementById("seedTra")
        const elementSaltTra = document.getElementById("saltTra")

        // Validate that the values are not empty or not well formed
        if (elementLibrary.value.toString() === "") { throw new Error("the library cannot be empty.") }
        if (!elementLibrary.value.toString().isWellFormed()) { throw new Error("the library is not well formed.") }
        if (elementMsg.value.toString() === "") { throw new Error("the message cannot be empty.") }
        if (!elementMsg.value.toString().isWellFormed()) { throw new Error("the message is not well formed.") }
        if (elementSeedSub.value.toString() !== "" && !elementSeedSub.value.toString().isWellFormed()) {
            throw new Error("the substitution seed is not well formed.")
        }
        if (elementSaltSub.value.toString() !== "" && !elementSaltSub.value.toString().isWellFormed()) {
            throw new Error("the substitution salt is not well formed.")
        }
        if (elementSeedTra.value.toString() !== "" && !elementSeedTra.value.toString().isWellFormed()) {
            throw new Error("the transposition seed is not well formed.")
        }
        if (elementSaltTra.value.toString() !== "" && !elementSaltTra.value.toString().isWellFormed()) {
            throw new Error("the transposition salt is not well formed.")
        }

        // Create an object to store the values
        // NOTE: the seed and its related values must be casted as a BigInt data type, otherwise the
        // multiplicativeInverse method will not work properly
        const infosEmpty = {
            library: elementLibrary.value.toString(),
            libraryLength: 0,
            msg: elementMsg.value.toString(),
            msgLength: 0,
            seedSub: elementSeedSub.value.toString(),
            saltSub: elementSaltSub.value.toString(),
            keySub: undefined,
            seedTra: elementSeedTra.value.toString(),
            saltTra: elementSaltTra.value.toString(),
            keyTra: undefined,
            encode: encode,
            mode: Number(elementMode.value),
            result: ""
        }

        // Validate then set the properties for the object "infosEmpty" and "infosLibrary"
        const infosLibrary = setLibrary(infosEmpty)
        // The parameter false specifies that the argument has to be validated
        const infosComplete = await validateAndGenerate(infosLibrary, false)

        // If no error has been thrown, update the HTML elements, then encode or decode the message using the keys
        elementMsg.value = infosComplete.msg.toString()
        updateHTML(elementMsg)
        elementSeedSub.value = infosComplete.seedSub.toString()
        updateHTML(elementSeedSub)
        elementSaltSub.value = infosComplete.saltSub.toString()
        updateHTML(elementSaltSub)
        elementSeedTra.value = infosComplete.seedTra.toString()
        updateHTML(elementSeedTra)
        elementSaltTra.value = infosComplete.saltTra.toString()
        updateHTML(elementSaltTra)

        const infosResult = await crypt(infosComplete)

        // Update "elementOutput" HTML value and CSS style
        elementOutput.value = infosResult.result.toString()
        const end = performance.now()
        const elapsedSeconds = (end - start) / 1000
        updateHTML(elementOutput, elapsedSeconds.toFixed(2))
        elementOutput.focus()
    }

    catch (error) {
        // Update "elementOutput" HTML value and CSS style
        elementOutput.value = error
        elementOutput.classList.add('error')
        elementOutput.style.color = 'red'
        elementOutput.focus()
        updateHTML(elementOutput, -1)
    }
}

// Method that validates the library
function setLibrary(infos) {
    infos.libraryLength = infos.library.length

    // If the library length is of valid length, continue by validating that each character is unique
    if (infos.libraryLength > 1 && infos.libraryLength < 257) {
        let isInvalid = false

        // If the library contains the same character twice, then the library is invalid
        for (let i = 0; i < infos.libraryLength - 1; i++) {
            isInvalid = infos.library.substring(i + 1).includes(infos.library[i])

            if (isInvalid) { throw new Error("the library cannot contain the same character twice.") }
        }

        // If the library contains a non UTF-16 character, then the library is invalid
        for (const char of infos.library) {
            if (char.codePointAt(0) > 0xFFFF) {
                { throw new Error("the library must contain UTF-16 characters only.") }
            }
        }

        return infos
    }

    // If the library length is of invalid length, throw an error message
    else { throw new Error("the library must contain from 2 to 256 characters.") }
}

// Method that validates the input message, the seeds and the keys
// If a string are valid but too short, the method expands the string
async function validateAndGenerate(infos, autokeyBool, substitutionBool) {
    if (!autokeyBool) {
        const infosMsg = validateMsg(infos)
        const infosKeySub = await validateKeyAndSalt(infosMsg, "substitution")
        const infosKeyTra = await validateKeyAndSalt(infosKeySub, "transposition")

        return infosKeyTra
    }

    else {
        let msg = infos.text
        let key

        substitutionBool ? key = infos.keySub : key = infos.keyTra

        let oddVSEven = infos.libraryLength % 2
        let roundedandHalvedLibraryLength = (infos.libraryLength - oddVSEven)/2
        let valueSeed
        let valueSalt 

        if (substitutionBool) {
            valueSeed = msg.substring(0, roundedandHalvedLibraryLength).concat(key.substring(roundedandHalvedLibraryLength, infos.libraryLength))
            valueSalt = key.substring(0, roundedandHalvedLibraryLength).concat(msg.substring(roundedandHalvedLibraryLength, infos.libraryLength))
        }

        else {
            valueSeed = key.substring(0, roundedandHalvedLibraryLength).concat(msg.substring(roundedandHalvedLibraryLength, infos.libraryLength))
            valueSalt = msg.substring(0, roundedandHalvedLibraryLength).concat(key.substring(roundedandHalvedLibraryLength, infos.libraryLength))
        }

        
        let combinedValue = await deriveSeededKey(valueSeed, valueSalt)
        key = generateStringFromArray(combinedValue, infos, infos.libraryLength).toString()

        return key.toString()
    }






    // Method that validates the message value
    function validateMsg(infos) {
        value = infos.msg.toString()
        valueLength = value.length

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
                    // Generate a pseudorandom value
                    const pseudorandomValue = Math.floor(Math.random() * 65537) % infos.libraryLength

                    // Expand the message with a padding character until the message length is valid, using the
                    // pseudorandom number as an index value for the library
                    for (let i = valueLength; i < valueLength + infos.libraryLength - valueLength % infos.libraryLength; i++) {
                        value = value.concat(infos.library[pseudorandomValue].toString())
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

    // Method that validates the key and salt value
    async function validateKeyAndSalt(infos, contentID) {
        let valueSeed
        let valueSeedLength
        let valueSalt
        let valueSaltLength

        if (contentID == "substitution") {
            valueSeed = infos.seedSub.toString()
            valueSeedLength = valueSeed.length
            valueSalt = infos.saltSub.toString()
            valueSaltLength = valueSalt.length
        }

        else {
            valueSeed = infos.seedTra.toString()
            valueSeedLength = valueSeed.length
            valueSalt = infos.saltTra.toString()
            valueSaltLength = valueSalt.length
        }

        // If the mode of encryption/decryption is not substitution and transposition combined (mode != 0)
        // If infos.mode == -1 -> substitution only, then fill seedTra and saltTra with zeros
        // If infos.mode == 1 -> transposition only, then fill seedSub and saltSub with zeros
        if ((contentID == "transposition" && infos.mode == -1) || (contentID == "substitution" && infos.mode == 1)) {
            // Update the object "infos" properties depending on which properties are under consideration
            if (contentID == "transposition" && infos.mode == -1) {
                infos.seedTra = ""
                infos.saltTra = ""
            }

            else if (contentID == "substitution" && infos.mode == 1) {
                infos.seedSub = ""
                infos.saltSub = ""
            }

            return infos
        }

        // If the key and salt are made of characters from the library
        else if (validateCharacterContent(valueSeed, valueSeedLength, infos.library) &&
        validateCharacterContent(valueSalt, valueSaltLength, infos.library)) {
            // If the seed string is too short
            if (valueSeedLength < 64) {
                let seedSize = 64
                valueSeed = valueSeed.concat(generateStringFromArray(generateSymmetricKeyOrSalt(seedSize), infos, seedSize).toString().substring(0,
                    64 - valueSeedLength))
                valueSeedLength = valueSeed.length

                contentID == "substitution" ? infos.seedSub = valueSeed.toString() :
                infos.seedTra = valueSeed.toString()
            }

            // If the seed string is too long
            else if (valueSeedLength > 128)
            {
                valueSeed = valueSeed.substring(0, 128)
                valueSeedLength = valueSeed.length

                contentID == "substitution" ? infos.seedSub = valueSeed.toString() :
                infos.seedTra = valueSeed.toString()
            }
            
            // If the salt string is too short
            if (valueSaltLength < 16) {
                let saltSize = 16
                valueSalt = valueSalt.concat(generateStringFromArray(generateSymmetricKeyOrSalt(saltSize), infos, saltSize).toString().substring(0,
                    16 - valueSaltLength))
                valueSaltLength = valueSalt.length

                contentID == "substitution" ? infos.saltSub = valueSalt.toString() :
                infos.saltTra = valueSalt.toString()
            }

            // If the salt string is too long
            else if (valueSaltLength > 32) {
                valueSalt = valueSalt.substring(0, 32)
                valueSaltLength = valueSalt.length

                contentID == "substitution" ? infos.saltSub = valueSalt.toString() :
                infos.saltTra = valueSalt.toString()
            }

            let combinedValue = await deriveSeededKey(valueSeed, valueSalt)
            let key = generateStringFromArray(combinedValue, infos, infos.libraryLength).toString()

            contentID == "substitution" ? infos.keySub = key.toString() : infos.keyTra = key.toString()

            return infos
        }

        // If the key or the salt contains characters that are not in the library, throw an error
        else { throw new Error("the " + contentID + " key and salt must contain characters from the library only.") }
    }

    // Method that validates that the provided string value contains characters from the library only
    function validateCharacterContent(value, valueLength, library) {
        // If the value contains a character that is not in the library, then the value is not valid
        for (let i = 0; i < valueLength; i++) {
            if (!library.includes(value[i].toString())) { return false }
        }

        return true
    }

    // Method that generates an array of pseudorandom values
    function generateSymmetricKeyOrSalt(size) {
        const buffer = new Uint16Array(size);
  
        // Fills the array in-place with secure pseudorandom values
        window.crypto.getRandomValues(buffer);
  
        return buffer;
    }

    // Method that convert an array to a string
    function generateStringFromArray(array, infos, length) {
        let charString = ""

        for (let i = 0; i < length; i++) {
            const bytes = new Uint16Array([array[i]])
            const view = new DataView(bytes.buffer)

            // Read as 16-bit Little-Endian
            let index = view.getUint16(0, true) % infos.libraryLength
            charString = charString.concat(infos.library[index])
        }

        return charString.toString()
    }

    // Method that generates the combined value of the key with the salt
    async function deriveSeededKey(seedString, saltString) {
        // Convert the key and salt strings into shorts
        const seedShorts = utf16StringToShort(seedString)
        const saltShorts = utf16StringToShort(saltString)

        // Import the seed into the Web Crypto API as base key material
        const baseKey = await window.crypto.subtle.importKey(
            "raw", 
            seedShorts, 
            "PBKDF2", 
            false, 
            ["deriveBits"]
        )

        // Stretch the seed into exactly 4096 bits using PBKDF2
        const derivedBits = await window.crypto.subtle.deriveBits(
            {
            name: "PBKDF2",
            salt: saltShorts,
            iterations: 220000,
            hash: "SHA-512"
            },
            baseKey,
            4096 // The exact bit length requirement
        )

        // Return an ArrayBuffer containing exactly 256 deterministic shorts
        return new Uint16Array(derivedBits)
    }

    function utf16StringToShort(string) {
        // Create a buffer twice the length of the string (2 bytes per char)
        const buffer = new ArrayBuffer(string.length * 2)
        const view = new Uint16Array(buffer)
  
        for (let i = 0; i < string.length; i++) {
            view[i] = string.charCodeAt(i)
        }
  
        // Return buffer as a Uint16Array
        return new Uint16Array(buffer)
    }
}

// Method that encrypts/decrypts the message using the keys
async function crypt(infos) {
    infos.result = infos.msg.toString()

    // The counter helps to split the message into smaller substrings
    let counter = -1
    let text = ""

    switch (infos.mode) {
        case -1:
            // While the message has not been completely transformed
            while (++counter * infos.libraryLength < infos.msgLength) {
                // Split the input message into substrings of the length of the library
                const partialMsg = infos.result.toString().substring(counter * infos.libraryLength,
                        (counter + 1) * infos.libraryLength)
                const transformedText = await substitute(infos, Array.from(partialMsg), counter)
                text = text.concat(transformedText.toString())

                if ((counter + 1) * infos.libraryLength < infos.msgLength) {
                    const tempValues = {
                        text: infos.encode ? transformedText.toString() : partialMsg.toString(),
                        keySub: infos.keySub.toString(),
                        library: infos.library.toString(),
                        libraryLength: infos.libraryLength
                    }

                    infos.keySub = await validateAndGenerate(tempValues, true, true)
                }
            }

            infos.result = text
            break

        case 0:
            if (infos.encode) {
                // While the message has not been completely transformed
                while (++counter * infos.libraryLength < infos.msgLength) {
                    // Split the input message into substrings of the length of the library
                    const partialMsg = infos.result.toString().substring(counter * infos.libraryLength,
                        (counter + 1) * infos.libraryLength)
                    let transformedText = await substitute(infos, Array.from(partialMsg), counter)
                    transformedText = await transpose(infos, Array.from(transformedText), counter)

                    text = text.concat(transformedText.toString())

                    if ((counter + 1) * infos.libraryLength < infos.msgLength) {
                        const tempValues = {
                            text: infos.encode ? transformedText.toString() : partialMsg.toString(),
                            keySub: infos.keySub.toString(),
                            keyTra: infos.keyTra.toString(),
                            library: infos.library.toString(),
                            libraryLength: infos.libraryLength
                        }

                        infos.keySub = await validateAndGenerate(tempValues, true, true)
                        infos.keyTra = await validateAndGenerate(tempValues, true, false)
                    }
                }
            }

            else {
                // While the message has not been completely transformed
                while (++counter * infos.libraryLength < infos.msgLength) {
                    // Split the input message into substrings of the length of the library
                    const partialMsg = infos.result.toString().substring(counter * infos.libraryLength,
                        (counter + 1) * infos.libraryLength)
                    let transformedText = await transpose(infos, Array.from(partialMsg), counter)
                    transformedText = await substitute(infos, Array.from(transformedText), counter)

                    text = text.concat(transformedText.toString())

                    if ((counter + 1) * infos.libraryLength < infos.msgLength) {
                        const tempValues = {
                            text: infos.encode ? transformedText.toString() : partialMsg.toString(),
                            keySub: infos.keySub.toString(),
                            keyTra: infos.keyTra.toString(),
                            library: infos.library.toString(),
                            libraryLength: infos.libraryLength
                        }

                        infos.keySub = await validateAndGenerate(tempValues, true, true)
                        infos.keyTra = await validateAndGenerate(tempValues, true, false)
                    }
                }
            }

            infos.result = text

            break

        case 1:
            // While the message has not been completely transformed
            while (++counter * infos.libraryLength < infos.msgLength) {
                // Split the input message into substrings of the length of the library
                const partialMsg = infos.result.toString().substring(counter * infos.libraryLength,
                        (counter + 1) * infos.libraryLength)
                const transformedText = await transpose(infos, Array.from(partialMsg), counter)
                text = text.concat(transformedText.toString())

                if ((counter + 1) * infos.libraryLength < infos.msgLength) {
                    const tempValues = {
                        text: infos.encode ? transformedText.toString() : partialMsg.toString(),
                        keyTra: infos.keyTra.toString(),
                        library: infos.library.toString(),
                        libraryLength: infos.libraryLength
                    }

                    infos.keyTra = await validateAndGenerate(tempValues, true, false)
                }
            }

            infos.result = text
            break
    }

    return infos





    // Method that substitutes the characters and returns a string
    async function substitute(infos, partialMsg, counter) {
        // Define the sign accordingly to encoding vs decoding; substitution encoding is based on modular addition,
        // while substitution decoding is based on modular subtraction
        const sign = (infos.encode ? 1 : -1)

        let partialKey = infos.keySub.toString()
        let initSymb
        let substitution
        let finalSymb

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

        return partialMsg.join("")
    }

    // Method that transposes the characters and returns a string
    async function transpose(infos, partialMsg, counter) {
        // Define the start, end, and step values according to encoding vs decoding; transposition encoding
        // starts from the beginning of the string up to the end, while transposition decoding starts from
        // the end of the string down to the beginning
        const start = (infos.encode ? 0 : infos.libraryLength - 1)
        const end = (infos.encode ? infos.libraryLength : -1)
        const step = (infos.encode ? 1 : -1)

        let partialKey = infos.keyTra.toString()
        let transposition
        let finalPos

        for (let initPos = start; initPos != end; initPos += step) {
            // Find transposition displacement value using key
            transposition = infos.library.indexOf(partialKey[initPos].toString())
            // Compute (initial position index + displacement) mod infos.libraryLength
            finalPos = ((initPos + transposition) % infos.libraryLength); // Keep the semi-colon here to prevent bugs

            // Swap the character's positions
            [partialMsg[initPos], partialMsg[finalPos]] = [partialMsg[finalPos], partialMsg[initPos]]
        }

        return partialMsg.join("")
    }
}
