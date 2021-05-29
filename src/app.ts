// Enum for the status of a project
enum ProjectStatus{
    Active = 'active',
    Finished = 'finished'
}

// Project class
class Project {
    constructor(
        public id: string,
        public title:string,
        public description:string,
        public people:number,
        public status:ProjectStatus,
    ) {
        
    }
}

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


type Listener = (projects:Project[]) => void

class ProjectState {
    private listeners:Listener[] = []
    private projects: Project[] = []
    private static instance:ProjectState

    private constructor() {
        
    }

    static getInstance() {
        if (this.instance)
            return this.instance
        this.instance = new ProjectState()
        return this.instance
    }

    addListeners(listenerFn: Listener) {
        this.listeners.push(listenerFn)
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numOfPeople,
            ProjectStatus.Active
        )
        this.projects.push(newProject)
        for (const listenerFn of this.listeners) {
            // Pass to this listener function a copy of the state that this class is managing i.e. the "projects" list
            // We call "slice" to return a copy of the array and not the original "array" to make the "projects" list to :
            // 1. make the state uneditable from the place the listener function is coming from
            // 2. ensure that if we push something to it from inside, state would change everywhere else in the app but these places would not really notice that had changed
            listenerFn(this.projects.slice())
        }
    }

}

const projectState = ProjectState.getInstance()

class ProjectList {
    hostElement: HTMLDivElement;
    templateElement: HTMLTemplateElement;
    element: HTMLElement;
    assignedProjects : Project[]

    constructor(private type : ProjectStatus) {
        this.hostElement = document.querySelector('#app')! as HTMLDivElement;
        this.templateElement = document.querySelector('#project-list')! as HTMLTemplateElement;
        this.assignedProjects = []

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`
        
        projectState.addListeners((projects:Project[]) => {
            this.assignedProjects = projects
            this.renderProjects()
        })
        
        this.attach()
        this.renderContent()
    }
    private renderProjects() {
        const listEl = document.querySelector(`#${this.type}-projects-list`)! as HTMLUListElement;
        for (const projectItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title
            listEl.appendChild(listItem)
        }
    }


    private renderContent() {
        const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId
        this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`
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
            projectState.addProject(title, description, people)
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
const activePrjList = new ProjectList(ProjectStatus.Active)
const finishedPrjList = new ProjectList(ProjectStatus.Finished)