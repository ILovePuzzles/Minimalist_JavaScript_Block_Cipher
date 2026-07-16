 // Default library value
const defaultLibrary = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ .!\"#$%&'()*+,-/:;<=>?@[\\]^_`{|}~¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ–—‘’“”…•\n€αβγδεζηθικλμνξοπρςστυφχψωĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞ"
// Isolate important HTML elements based on their ID value
const elementLibrary = document.getElementById("library")
const elementOutput = document.getElementById("output")
const elementMode = document.getElementById("mode")
// Define a constant value for the library length
// Note: in the code that follows the library must be a power of 2, since the modulo
// has been replaced with the logical and operator. This change will not work, with
// values other than a power of 2
const validLibraryLength = 256

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
// Depending on which element is clicked, reset the input fields, show or hide the instructions,
// encode the message, decode the message, or update the text below elementMode
document.getElementById("reset").onclick = function() { reset() }
document.getElementById("instrubtn").onclick = function() { instruct() }
document.getElementById("encode").onclick = function() { convert(true) }
document.getElementById("decode").onclick = function() { convert(false) }
document.getElementById("mode").onclick = function() { updateHTML(elementMode) }
// If the element with id "colorTheme" is changed, update the CSS as follows
document.getElementById("colorTheme").onchange = function() {
    if (event.target.type === 'radio') {
        // Boolean value that represents the selected theme: dark theme -> true, light theme -> false
        let darkThemeBool = (event.target.value == "dark")
        let classToAdd = (darkThemeBool ? 'dark-theme' : 'light-theme')
        let classToRemove = (darkThemeBool ? 'light-theme' : 'dark-theme')
        let outputBgColor = (darkThemeBool ? 'black' : 'white')
        let outputTxtColor = (darkThemeBool ? 'white' : 'black')
        // Isolate the body in a variable
        let body = document.body

        body.classList.remove(classToRemove)
        body.classList.add(classToAdd)
        // For each element textarea and input
        document.querySelectorAll('textarea, input').forEach(element => {
            if (element.id != "output") {
                element.classList.remove(classToRemove)
                element.classList.add(classToAdd)
            }

            else {
                element.style.backgroundColor = outputBgColor

                // If the output element does not contain the class 'error', change the text color
                if (!element.classList.contains('error')) {
                        element.style.color = outputTxtColor
                }
            }
        })
    }
}





// Method that updates the HTML, the time parameter is optional
function updateHTML(element, time) {
    // If the element is not the encryption/decryption mode selector, update character count
    if (element.id != "mode") {
        document.querySelector(`#${element.id}P`).textContent = `Character count: ${element.value.length}`

        if (element.id == "output") {
            time != -1 ? document.querySelector(`#${element.id}P`).textContent = `The process took ${time} seconds to complete` :
                document.querySelector(`#${element.id}P`).textContent = ``
        }
    }

    // If the element to be updated is the substitution VS transposition mode selector, update the text value. Also, if mode != 0,
    // make the unused textarea element readonly
    else {
        let seedSub = document.getElementById("seedSub")
        let seedTra = document.getElementById("seedTra")
        seedSub.readOnly = false
        seedTra.readOnly = false

        let text

        // Depending on the mode selected
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
    document.querySelectorAll(".field, .otherField").forEach(element => {
        // If the id of the element is different than mode, clear the value;
        // Else set the value to 0 (encryption/decryption mode value)
        element.id != "mode" ? element.value = "" : elementMode.value = 0
        document.querySelector(`#${element.id}P`).textContent = ``
    })

    // Reload the default library
    elementLibrary.value = defaultLibrary
    // Actualize the text below elementLibrary (character count)
    updateHTML(elementLibrary)
    // Actualize the text below elementMode (actual mode description)
    updateHTML(elementMode)
    // Actualize the CSS for elementOutput
    elementOutput.classList.remove('error')
    document.body.classList.contains('light-theme') ? elementOutput.style.color = 'black' :
        elementOutput.style.color = 'white'
}

// Method that shows/hides instructions
function instruct() {
    document.getElementById("instructions").classList.toggle('hidden')
}

// Method that allows to encode or decode a message
async function convert(encode) {
    const timeStartProcess = performance.now()

    try {
        elementOutput.classList.remove('error')
        document.body.classList.contains('light-theme') ? elementOutput.style.color = 'black' :
            elementOutput.style.color = 'white'
        elementOutput.value = "Conversion in progress"

        // Isolate important HTML elements based on their ID value
        const elementMsg = document.getElementById("input")
        const elementSeedSub = document.getElementById("seedSub")
        const elementSaltSub = document.getElementById("saltSub")
        const elementSeedTra = document.getElementById("seedTra")
        const elementSaltTra = document.getElementById("saltTra")

        // Validate the library content
        const library = setLibrary(elementLibrary)
        // Here the parameter true specifies that the argument has to be validated
        const infosComplete = validateAndGenerateInput(library, elementMsg, elementSeedSub, elementSaltSub,
            elementSeedTra, elementSaltTra, encode)

        // If no error has been thrown during validation, update the HTML elements
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

        // Encrypt/decrypt the messsage using the keys
        const infosResult = await crypt(infosComplete)

        // Update "elementOutput" HTML value and CSS style
        elementOutput.value = infosResult.result.toString()
        const timeEndProcess = performance.now()
        // Compute the time elapsed in seconds since the beginning of the encryption/decryption process,
        // and round the value to 2 decimals of precision
        const elapsedSeconds = ((timeEndProcess - timeStartProcess) / 1000).toFixed(2)
        updateHTML(elementOutput, elapsedSeconds)
        elementOutput.focus()
    }

    catch (error) {
        // Update "elementOutput" HTML value and CSS style
        elementOutput.value = error
        elementOutput.classList.add('error')
        elementOutput.style.color = 'red'
        updateHTML(elementOutput, -1)
        elementOutput.focus()
    }
}

// Method that validates the library
function setLibrary(elementLibrary) {
    const libraryValue = elementLibrary.value.toString()

    // Validate that the library is not empty and that it is well formed
    if (libraryValue === "") { throw new Error("the library cannot be empty.") }
    if (!libraryValue.isWellFormed()) { throw new Error("the library is not well formed.") }

    const libraryLength = libraryValue.length
    
    // If the library length is valid, continue by validating that each character is unique
    if (libraryLength == validLibraryLength) {
        for (let i = 0; i < libraryLength - 1; i++) {
            // If the library contains the same character twice, then the library is invalid
            if (libraryValue.substring(i + 1).includes(libraryValue[i])) {
                throw new Error("the library cannot contain the same character twice.")
            }
        }
        
        // If the library contains a non UTF-16 character, then the library is invalid
        for (const char of libraryValue) {
            if (char.codePointAt(0) > 0xFFFF) {
                { throw new Error("the library must contain UTF-16 characters only.") }
            }
        }

        const library = {
            library: libraryValue,
            libraryLength: libraryLength
        }

        return library
    }

    // If the library length is invalid, throw an error message
    else { throw new Error("the library must contain 256 characters.") }
}

// Method that validates the input message, the seeds and the keys
// If a string are valid but too short, the method expands the string
function validateAndGenerateInput(library, elementMsg, elementSeedSub, elementSaltSub, elementSeedTra, elementSaltTra, encode) {
    // Validate that the message is not empty and that it is well formed
    const msgValue = elementMsg.value.toString()
    if (msgValue === "") { throw new Error("the message cannot be empty.") }
    if (!msgValue.isWellFormed()) { throw new Error("the message is not well formed.") }

    // If the values are not empty, validate that they are well formed
    const seedSubValue = elementSeedSub.value.toString()
    if (seedSubValue !== "" && !seedSubValue.isWellFormed()) { throw new Error("the substitution seed is not well formed.") }
    const saltSubValue = elementSaltSub.value.toString()
    if (saltSubValue !== "" && !saltSubValue.isWellFormed()) { throw new Error("the substitution salt is not well formed.") }
    const seedTraValue = elementSeedTra.value.toString()
    if (seedTraValue !== "" && !seedTraValue.isWellFormed()) { throw new Error("the transposition seed is not well formed.") }
    const saltTraValue = elementSaltTra.value.toString()
    if (saltTraValue !== "" && !saltTraValue.isWellFormed()) { throw new Error("the transposition salt is not well formed.") }

    // Create an object to store the values
    const infos = {
        library: library.library.toString(),
        libraryLength: library.libraryLength,
        msg: msgValue.toString(),
        msgLength: msgValue.toString().length,
        seedSub: seedSubValue.toString(),
        saltSub: saltSubValue.toString(),
        keySub: undefined,
        seedTra: seedTraValue.toString(),
        saltTra: saltTraValue.toString(),
        keyTra: undefined,
        encode: encode,
        mode: Number(elementMode.value),
        result: ""
    }

    const infosMsg = validateMsg(infos)
    const infosKeySub = validateKeyAndSalt(infosMsg, "substitution")
    const infosKeyTra = validateKeyAndSalt(infosKeySub, "transposition")

    return infosKeyTra





    // Method that validates the message value
    function validateMsg(infos) {
        let msgValue = infos.msg.toString()
        let msgLength = infos.msgLength

        // If the message is made of characters from the library
        if (validateCharacterContent(msgValue, msgLength, infos.library)) {
            // If the message length is valid
            if (msgLength > 0 && msgLength < infos.libraryLength * infos.libraryLength + 1) {
                // If the message length is not equal to the library length nor a multiple of it,
                // expand the message by adding copies of the same pseudorandom character at the end
                if (msgLength & (validLibraryLength - 1) != 0) {
                    // Generate a pseudorandom value
                    const pseudorandomCharacter = generateStringFromArray(generateSymmetricKeyOrSalt(1), infos, 1).toString()

                    // Expand the message with a padding character until the message length is valid, using the
                    // pseudorandom number as an index value for the library
                    for (let i = msgLength; i < msgLength + infos.libraryLength - (msgLength & (validLibraryLength - 1)); i++) {
                        msgValue = msgValue.concat(pseudorandomCharacter.toString())
                    }
                }

                // Update the properties of the object "infos"
                infos.msg = msgValue.toString()
                infos.msgLength = infos.msg.length

                return infos
            }

            // If the message is empty, throw an error
            else if (msgLength == 0) { throw new Error("the message cannot be empty.") }
 
            // If the message is larger than the square of the library length, throw an error
            else { throw new Error("the message cannot be more than 65536 characters long.") }
        }

        // If the message contains characters that are not in the library, throw an error
        else { throw new Error("the message must contain characters from the library only.") }
    }

    // Method that validates the key and salt value
    function validateKeyAndSalt(infos, contentID) {
        let seed
        let salt

        if (contentID == "substitution") {
            seed = infos.seedSub.toString()
            salt = infos.saltSub.toString()
        }

        else {
            seed = infos.seedTra.toString()
            salt = infos.saltTra.toString()
        }
        
        let seedLength = seed.length
        let saltLength = salt.length

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
        else if (validateCharacterContent(seed, seedLength, infos.library) &&
        validateCharacterContent(salt, saltLength, infos.library)) {
            let seedSize = 256
            let saltSize = 128

            // If the seed string is too short
            if (seedLength < seedSize) {
                seed = seed.concat(generateStringFromArray(generateSymmetricKeyOrSalt(seedSize), infos, seedSize).toString().substring(0,
                    seedSize - seedLength))
                seedLength = seed.length

                contentID == "substitution" ? infos.seedSub = seed.toString() : infos.seedTra = seed.toString()
            }

            // If the seed string is too long
            else if (seedLength > seedSize)
            {
                seed = seed.substring(0, seedSize)
                seedLength = seed.length

                contentID == "substitution" ? infos.seedSub = seed.toString() : infos.seedTra = seed.toString()
            }
            
            // If the salt string is too short
            if (saltLength < saltSize) {
                salt = salt.concat(generateStringFromArray(generateSymmetricKeyOrSalt(saltSize), infos, saltSize).toString().substring(0,
                    saltSize - saltLength))
                saltLength = salt.length

                contentID == "substitution" ? infos.saltSub = salt.toString() : infos.saltTra = salt.toString()
            }

            // If the salt string is too long
            else if (saltLength > saltSize) {
                salt = salt.substring(0, saltSize)
                saltLength = salt.length

                contentID == "substitution" ? infos.saltSub = salt.toString() : infos.saltTra = salt.toString()
            }

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
        const buffer = new Uint8Array(size);
  
        // Fills the array in-place with secure pseudorandom values
        window.crypto.getRandomValues(buffer);
  
        return buffer;
    }

    // Method that convert an array to a string
    function generateStringFromArray(array, infos, length) {
        let charString = ""

        for (let i = 0; i < length; i++) {
            const bytes = new Uint8Array([array[i]])
            const view = new DataView(bytes.buffer)

            // Read as 8-bit Little-Endian
            let index = view.getUint8(0, true)
            charString = charString.concat(infos.library[index])
        }

        return charString.toString()
    }
}

// Method that encrypts/decrypts the message using the keys
async function crypt(infos) {
    let tempValues = {
        text: "",
        library: infos.library.toString(),
        libraryLength: infos.libraryLength,
        seedSub: infos.seedSub.toString(),
        saltSub: infos.saltSub.toString(),
        keySub: "",
        seedTra: infos.seedTra.toString(),
        saltTra: infos.saltTra.toString(),
        keyTra: ""
    }
    let partialMsg = ""
    let partialCryptText = ""
    let cryptText = ""

    // Depending on the mode of encryption/decryption selected
    // Substitution only -> -1
    // Substitution and transposition -> 0
    // Transposition only -> 1
    switch (infos.mode) {
        case -1:
            // The counter counts the number of blocks that make the message, and helps to split
            // the message into smaller substrings
            for (let counter = 0; counter * infos.libraryLength < infos.msgLength; counter++) {
                if (counter != 0) {
                    tempValues.text = (infos.encode ? partialMsg.toString() : partialCryptText.toString())
                    tempValues.keySub = infos.keySub.toString()
                }

                infos.keySub = (await generateKeys(tempValues, true)).toString()

                // Split the input message into substrings of the length of the library
                partialMsg = infos.msg.toString().substring(counter * infos.libraryLength,
                        (counter + 1) * infos.libraryLength)
                partialCryptText = substitute(infos, Array.from(partialMsg), counter)
                
                cryptText = cryptText.concat(partialCryptText.toString())
            }

            infos.result = cryptText
            break

        case 0:
            if (infos.encode) {
                // The counter counts the number of blocks that make the message, and helps to split
                // the message into smaller substrings
                for (let counter = 0; counter * infos.libraryLength < infos.msgLength; counter++) {
                    if (counter != 0) {
                        tempValues.text = partialMsg.toString()
                        tempValues.keySub = infos.keySub.toString()
                        tempValues.keyTra = infos.keyTra.toString()
                    }

                    infos.keySub = (await generateKeys(tempValues, true)).toString()
                    infos.keyTra = (await generateKeys(tempValues, false)).toString()

                    // Split the input message into substrings of the length of the library
                    partialMsg =  infos.msg.toString().substring(counter * infos.libraryLength,
                        (counter + 1) * infos.libraryLength)
                    partialCryptText = substitute(infos, Array.from(partialMsg), counter)
                    partialCryptText = transpose(infos, Array.from(partialCryptText), counter)

                    cryptText = cryptText.concat(partialCryptText.toString())
                }
            }

            else {
                // The counter counts the number of blocks that make the message, and helps to split
                // the message into smaller substrings
                for (let counter = 0; counter * infos.libraryLength < infos.msgLength; counter++) {
                    if (counter != 0) {
                        tempValues.text = partialCryptText.toString()
                        tempValues.keySub = infos.keySub.toString()
                        tempValues.keyTra = infos.keyTra.toString()
                    }

                    infos.keySub = (await generateKeys(tempValues, true)).toString()
                    infos.keyTra = (await generateKeys(tempValues, false)).toString()

                    // Split the input message into substrings of the length of the library
                    partialMsg = infos.msg.toString().substring(counter * infos.libraryLength,
                        (counter + 1) * infos.libraryLength)
                    partialCryptText = transpose(infos, Array.from(partialMsg), counter)
                    partialCryptText = substitute(infos, Array.from(partialCryptText), counter)

                    cryptText = cryptText.concat(partialCryptText.toString())
                }
            }

            infos.result = cryptText

            break

        case 1:
            // The counter counts the number of blocks that make the message, and helps to split
            // the message into smaller substrings
            for (let counter = 0; counter * infos.libraryLength < infos.msgLength; counter++) {
                if (counter != 0) {
                    tempValues.text = (infos.encode ? partialMsg.toString() : partialCryptText.toString())
                    tempValues.keyTra = infos.keyTra.toString()
                }

                infos.keyTra = (await generateKeys(tempValues, false)).toString()

                // Split the input message into substrings of the length of the library
                partialMsg = infos.msg.toString().substring(counter * infos.libraryLength,
                        (counter + 1) * infos.libraryLength)
                partialCryptText = transpose(infos, Array.from(partialMsg), counter)

                cryptText = cryptText.concat(partialCryptText.toString())
            }

            infos.result = cryptText
            break
    }

    return infos





    // Method that substitutes the characters and returns a string
    function substitute(infos, partialMsg, counter) {
        // Define the sign accordingly to encoding vs decoding; substitution encoding is based on modular addition,
        // while substitution decoding is based on modular subtraction
        const sign = (infos.encode ? 1 : -1)

        let initSymb
        let substitution
        let finalSymb

        for (let i = 0; i < infos.libraryLength; i++) {
            // Find actual symbol index value
            initSymb = infos.library.indexOf(partialMsg[i].toString())
            // Find transposition displacement value using key
            substitution = infos.library.indexOf(infos.keySub[i].toString())
            // Compute (initial symbol index + displacement) mod infos.libraryLength
            finalSymb = (initSymb + sign * substitution + infos.libraryLength) & (validLibraryLength - 1)

            // Substitute the old symbol for the new one
            partialMsg[i] = infos.library[finalSymb].toString()
        }

        return partialMsg.join("")
    }

    // Method that transposes the characters and returns a string
    function transpose(infos, partialMsg, counter) {
        // Define the start, end, and step values according to encoding vs decoding; transposition encoding
        // starts from the beginning of the string up to the end, while transposition decoding starts from
        // the end of the string down to the beginning
        const start = (infos.encode ? 0 : infos.libraryLength - 1)
        const end = (infos.encode ? infos.libraryLength : -1)
        const step = (infos.encode ? 1 : -1)

        let initPos
        let transposition
        let finalPos

        for (initPos = start; initPos != end; initPos += step) {
            // Find transposition displacement value using key
            transposition = infos.library.indexOf(infos.keyTra[initPos].toString())
            // Compute (initial position index + displacement) mod infos.libraryLength
            finalPos = (initPos + transposition) & (validLibraryLength - 1); // Keep the semi-colon here to prevent bugs

            // Swap the character's positions
            [partialMsg[initPos], partialMsg[finalPos]] = [partialMsg[finalPos], partialMsg[initPos]]
        }

        return partialMsg.join("")
    }

    // Method that generates keys
    async function generateKeys(tempValues, substitutionBool) {
        let msg = tempValues.text
        let seed = ""
        let salt = ""
        let key = ""

        substitutionBool ? key = tempValues.keySub : key = tempValues.keyTra

        // If a key has already been created
        if (key !== "") {
            const halvedLibraryLength = Math.floor(tempValues.libraryLength / 2)

            // The purpose of the for loops if to mix the 4 substrings together before each autokey generation
            // The substrings are 64 characters long, so we mix one character from each substring with the other subtrings
            if (substitutionBool) {
                for (let i = 0; i < 32; i++) {
                    seed += key[i].toString() + msg[i + 64].toString() + key[i + 128].toString() + msg[i + 192].toString()
                    salt += msg[i + 32].toString() + key[i + 96].toString() + msg[i + 160].toString() + key[i + 224].toString()
                }
            }

            else {
                for (let i = 0; i < 32; i++) {
                    seed += msg[255 - i - 32].toString() + key[255 - i - 96].toString() + msg[255 - i - 160].toString() +
                        key[255 - i - 224].toString()
                    salt += key[255 - i].toString() + msg[255 - i - 64].toString() + key[255 - i - 128].toString() +
                        msg[255 - i - 192].toString()
                }
            }

            key = ""
        }

        // If no key has been created yet
        else {
            substitutionBool ? seed = tempValues.seedSub : seed = tempValues.seedTra
            substitutionBool ? salt = tempValues.saltSub : salt = tempValues.saltTra
        }

        let arrayList = await deriveSeededKey(seed, salt, tempValues)
        let array

        for (let i = 0; i < 4; i++) {
            array = arrayList[i]
            key = key.concat(generateStringFromArray(array, tempValues, tempValues.libraryLength / 4).toString())
        }

        return key.toString()
    }

    // Method that convert an array to a string
    function generateStringFromArray(array, infos, length) {
        let charString = ""

        for (let i = 0; i < length; i++) {
            const bytes = new Uint8Array([array[i]])
            const view = new DataView(bytes.buffer)

            // Read as 8-bit Little-Endian
            let index = view.getUint8(0, true)
            charString = charString.concat(infos.library[index])
        }

        return charString.toString()
    }

    // Method that generates the combined value of the key with the salt
    async function deriveSeededKey(seedString, saltString, infos) {
        let seedSubstring
        let saltSubstring
        let arrayList = []

        for (let i = 0; i < 4; i++) {
            seedSubstring = seedString.substring(i, (i + 1) * 64)
            saltSubstring = saltString.substring(i, (i + 1) * 32)
            
            // Convert the key and salt strings into bytes
            const seedBytes = stringToBytes(seedSubstring, infos)
            const saltBytes = stringToBytes(saltSubstring, infos)

            // Import the seed into the Web Crypto API as base key material
            const baseKey = await window.crypto.subtle.importKey(
                "raw", 
                seedBytes, 
                "PBKDF2", 
                false, 
                ["deriveBits"]
            )

            // Stretch the seed into exactly 4096 bits using PBKDF2
            const derivedBits = await window.crypto.subtle.deriveBits(
                {
                name: "PBKDF2",
                salt: saltBytes,
                iterations: 220000,
                hash: "SHA-512"
                },
                baseKey,
                512 // The exact bit length requirement
            )

            // Create an ArrayBuffer containing exactly 512 bits
            let array = new Uint8Array(derivedBits)
            arrayList.push(array)
        }

        return arrayList
    }

    function stringToBytes(string, infos) {
        const buffer = new ArrayBuffer(string.length)
        const view = new Uint8Array(buffer)
  
        for (let i = 0; i < string.length; i++) {
            view[i] = infos.library.indexOf(string[i].toString())
        }
  
        // Return buffer as a Uint8Array
        return new Uint8Array(buffer)
    }
}
