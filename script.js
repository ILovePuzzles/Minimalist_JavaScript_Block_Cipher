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
function updateHTML(element) {
    // If the element is not the encryption/decryption mode selector, update character count
    if (element.id != "mode") {
        document.querySelector(`#${element.id}P`).textContent = `Character count: ${element.value.length}`
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

        // Validate then set the properties for the object "infosEmpty"
        const infosLibrary = setLibrary(infosEmpty)
        const infosComplete = await validate(infosLibrary)

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

        const infosResult = crypt(infosComplete)

        // Update "elementOutput" HTML value and CSS style
        elementOutput.value = infosResult.result.toString()
        elementOutput.focus()
    }

    catch (error) {
        // Update "elementOutput" HTML value and CSS style
        elementOutput.value = error
        elementOutput.classList.add('error')
        elementOutput.style.color = 'red'
        elementOutput.focus()
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

        return infos
    }

    // If the library length is of invalid length, throw an error message
    else { throw new Error("the library cannot be empty and cannot contain more than 256 characters.") }
}

// Method that validates the input message, the seeds and the keys
// If a string are valid but too short, the method expands the string
async function validate(infos) {
    const infosMsg = validateMsg(infos)
    const infosSeedSub = await validateKeyAndSalt(infos, "substitution")
    const infosSeedTra = await validateKeyAndSalt(infos, "transposition")

    return infosSeedTra





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
                        value += infos.library[pseudorandomValue].toString()
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
            if (valueSeedLength == 0) {
                valueSeed = generateStringfromArray(generateSymmetricKey(), infos).toString()
                valueSeedLength = valueSeed.length

                contentID == "substitution" ? infos.seedSub = valueSeed :
                infos.seedTra = valueSeed
            }
                
            if (valueSaltLength == 0) {
                valueSalt = generateStringfromArray(generateSymmetricKey(), infos).toString()
                valueSaltLength = valueSalt.length

                contentID == "substitution" ? infos.saltSub = valueSalt :
                infos.saltTra = valueSalt
            }

            let combinedValue
            let key = ""

            for (let i = 0; key.length < infos.msgLength; i++) {
                // If combinedValue is undefined, generate a value
                if (i == 0) { combinedValue = await deriveSeededKey(valueSeed, valueSalt) }

                // Get a value from the array combinedValue using the value i as an index, modulo the library length
                let startValue = combinedValue[i] % infos.libraryLength
                // Add the library content under a circular rotation as a string to valueSeed
                valueSeed += infos.library.substring(startValue, infos.libraryLength).toString() +
                    infos.library.substring(0, startValue).toString()
                // Get a value from the array combinedValue using the value i + 256, modulo the library
                // length. The index value has a potential maximum of 255, since this is the maximum valid range
                // for the last index of the library. Since the array combinedValue has 512 elements in total, by
                // adding 256 to the value of i we are making sure that our selection has a different index than
                // the above selection
                startValue = combinedValue[i + 256] % infos.libraryLength
                // Generate a string from the library content under a circular rotation
                let tempString = infos.library.substring(startValue, infos.libraryLength).toString() +
                    infos.library.substring(0, startValue).toString()
                // Reverse the order of the string's characters, then add the resulting string to valueSalt
                valueSalt += tempString.split('').reverse().join('')

                combinedValue = await deriveSeededKey(valueSeed, valueSalt)
                key += generateStringfromArray(combinedValue, infos).toString()
            }

            contentID == "substitution" ? infos.keySub = key : infos.keyTra = key

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

    // Method that generates
    function generateSymmetricKey() {
        // 4096 bits / 8 = 512 bytes
        const keyBuffer = new Uint8Array(512);
  
        // Fills the array in-place with secure pseudorandom values
        window.crypto.getRandomValues(keyBuffer);
  
        return keyBuffer;
    }

    // Method that generates the combined value of the key with the salt
    async function deriveSeededKey(keyString, saltString) {
        // Convert the key and salt strings into bytes
        const seedBytes = utf16StringToBytes(keyString)
        const saltBytes = utf16StringToBytes(saltString)

        // Import the seed into the Web Crypto API as base key material
        const baseKey = await window.crypto.subtle.importKey(
            "raw", 
            seedBytes, 
            "PBKDF2", 
            false, 
            ["deriveBits"]
        )

        // Stretch the seed into exactly 4096 bits (512 bytes) using PBKDF2
        const derivedBits = await window.crypto.subtle.deriveBits(
            {
            name: "PBKDF2",
            salt: saltBytes,
            iterations: 100000,
            hash: "SHA-256"
            },
            baseKey,
            4096 // The exact bit length requirement
        )

        // Return an ArrayBuffer containing exactly 512 deterministic bytes
        return new Uint8Array(derivedBits)
    }

    function utf16StringToBytes(s) {
        // Create a buffer twice the length of the string (2 bytes per char)
        const buffer = new ArrayBuffer(s.length * 2)
        const view = new Uint16Array(buffer)
  
        for (let i = 0; i < s.length; i++) {
            view[i] = s.charCodeAt(i)
        }
  
        // Return buffer as a Uint8Array
        return new Uint8Array(buffer)
    }

    function generateStringfromArray(combinedValue, infos) {
        let charString = ""

        for (let i = 0; i < 2 * infos.libraryLength; i += 2) {
            const bytes = new Uint8Array([combinedValue[i], combinedValue[i + 1]])
            const view = new DataView(bytes.buffer)

            // Read as 16-bit Little-Endian
            let index = view.getUint16(0, true) % infos.libraryLength
            charString += infos.library[index]
        }

        return charString
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
                finalPos = ((initPos + transposition) % infos.libraryLength); // Keep the semi-colon here to prevent bugs

                // Swap the character's positions
                [partialMsg[initPos], partialMsg[finalPos]] = [partialMsg[finalPos], partialMsg[initPos]]
            }

            // Join the characters and add the string to result
            result += partialMsg.join("")
        }

        return result
    }
}
