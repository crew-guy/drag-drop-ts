/// <reference path="base-component.ts"/>

namespace App {
    // Project input class
    export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
        titleInputElement: HTMLInputElement;
        descriptionInputElement: HTMLInputElement;
        peopleInputElement: HTMLInputElement;
        
        constructor() {
            super(
                "app",
                "project-input",
                true,
                "user-input"
            )

            this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
            this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement;
            this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement; 
            
            this.configure()
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
                projectState.addProject(title, description, people)
                this.clearInput()
            }
        }

        configure() {
            this.element.addEventListener('submit',this.submitHandler)
        }

        renderContent(){}
    }
}