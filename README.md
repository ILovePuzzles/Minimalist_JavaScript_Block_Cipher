# Minimalist_JavaScript_Block_Cipher
This symmetric block cipher uses symbol substitution and transposition to achieve encipherment. There is an option to encrypt or decrypt the message using both substitution and transposition, or using one or the other. The block size depends on the library length; therefore, the message must be either equal to the library length or a multiple of it.

Hence, if the message is not long enough, a padding character will be repeatedly added to the end to complete it. The substitution and transposition keys are generated automatically from user-defined seed and salt values. Finally, a default library of symbols is provided; however, the content of the library can be modified, as long as each character appears only once.
