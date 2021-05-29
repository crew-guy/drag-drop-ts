// Validation interface
interface Validatable {
    value: string | number,
    required?: boolean,
    min?: number,
    max?: number,
    minLength?: number,
    maxLength ?: number
}

// Validation logic waala function 
const validate = (validatableInput: Validatable) => {
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

class ProjectList {
    hostElement: HTMLDivElement;
    templateElement: HTMLTemplateElement;
    element: HTMLElement;

    constructor(private type : 'active' | 'finished') {
        this.hostElement = document.querySelector('#app')! as HTMLDivElement;
        this.templateElement = document.querySelector('#project-list')! as HTMLTemplateElement;
        
        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`
        this.attach()
        this.renderContent()
    }
    private renderContent() {
        const listId = `${this.type}-projects-list`
        this.hostElement.querySelector('ul')!.id = listId
        this.hostElement.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`
    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element)
    }
}


// Autobind decorator
function Autobind(
    _: any,
    _2: string,
    descriptor:PropertyDescriptor
) {
    const originalMethod = descriptor.value
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get(){
            const boundFn = originalMethod.bind(this)
            return boundFn
        }
    }
    return adjDescriptor
}

// Project input class
class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;
    
    constructor() {
        this.templateElement = document.querySelector('#project-input')! as HTMLTemplateElement; ;
        this.hostElement = document.querySelector('#app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as HTMLFormElement
        this.element.id = "user-input"
        
        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement;
        
        
        this.configure()
        this.attach()
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value
        const enteredDescription = this.descriptionInputElement.value
        const enteredPeople = this.peopleInputElement.value
     
        const titleValidate:Validatable = {
            value : enteredTitle,
            minLength: 2,
            maxLength: 16,
            required:true
        }

        const descriptionValidate:Validatable = {
            value: enteredDescription,
            minLength: 2,
            required:false
        }

        const peopleValidate:Validatable = {
            value: +enteredPeople,
            min: 1,
            max: 10,
            required:true
        }
     
        if (
            !validate(titleValidate) ||
            !validate(descriptionValidate) ||
            !validate(peopleValidate)
        ) {
            alert('Validation failed')
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople]
        }
    }

    private clearInput() {
        this.titleInputElement.value = ""
        this.descriptionInputElement.value = ""
        this.peopleInputElement.value = ""
    }

    @Autobind
    private submitHandler(e:Event) {
        e.preventDefault()
        console.log(this.titleInputElement.value)
        const userInput = this.gatherUserInput()
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput
            console.log(title, description, people)
            this.clearInput()
        }
    }

    private configure() {
        this.element.addEventListener('submit',this.submitHandler)
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}

const prjInput = new ProjectInput()
const activePrjList = new ProjectList('active')
const finishedPrjList = new ProjectList('finished')