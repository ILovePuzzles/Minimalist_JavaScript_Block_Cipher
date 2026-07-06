# Minimalist_JavaScript_Block_Cipher
This symmetric block cipher uses symbol substitution and transposition to achieve encipherment. There is an option to encrypt or decrypt the message using both substitution and transposition, or using one or the other. The block size depends on the library length; therefore, the message and key lengths must be either equal to the library length or a multiple of it.

Hence, if the message is not long enough, a pseudorandom padding character will be repeatedly added to the end to complete it. If a key provided by the user is not long enough, either the existing pattern of the key will be repeated, or pseudorandom padding characters will be added to complete the key. Note that the key values can be user-defined or generated automatically.

The pseudorandom number generator (PRNG) used for key generation utilizes an inversive congruential generator based on the primitive polynomial x^2 - 46585x - 42403 over GF[65537], making its output highly nonlinear. The seed used in the PRNG can be manually specified or generated automatically; the seed values range from 0 to 65536.

Finally, a default library of symbols is provided; however, the content of the library can be modified, as long as each character appears only once.
