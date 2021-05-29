namespace App{
    // Validation interface
    export interface Validatable {
        value: string | number,
        required?: boolean,
        min?: number,
        max?: number,
        minLength?: number,
        maxLength ?: number
    }

    // Validation logic waala function 
    export const validate = (validatableInput: Validatable) => {
        let isValid: boolean = true;

        if (validatableInput.required) {
            isValid = isValid && validatableInput.value.toString().length !== 0;
        }
        if (
            validatableInput.minLength != null &&
            typeof validatableInput.value == 'string'
        ) {
            isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
        }
        if (
            validatableInput.maxLength != null &&
            typeof validatableInput.value == 'string'
        ) {
            isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
        }
        if (
            validatableInput.min != null &&
            typeof validatableInput.value == "number"
        ) {
            isValid = isValid && validatableInput.value >= validatableInput.min
        }
        if (
            validatableInput.max != null &&
            typeof validatableInput.value == "number"
        ) {
            isValid = isValid && validatableInput.value <= validatableInput.max
        }
        return isValid
    }
}