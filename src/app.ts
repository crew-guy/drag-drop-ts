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

abstract class Component<T extends HTMLElement, U extends HTMLElement>{
    hostElement: T;
    templateElement: HTMLTemplateElement;
    element: U;

    constructor(
        hostElementId: string,
        templateElementId:string,
        insertAtBeginning:boolean,
        elementId:string
    ) {
        this.hostElement = document.getElementById(hostElementId)! as T;
        this.templateElement = document.getElementById(templateElementId)! as HTMLTemplateElement;

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as U;
        this.element.id = elementId
        this.attach(insertAtBeginning)
    }

    private attach(insertAtBeginning:boolean) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element)
    }
    
    abstract configure?(): void
    abstract renderContent():void
}


class ProjectList extends Component<HTMLDivElement, HTMLElement> {
    assignedProjects : Project[]

    constructor(private type: ProjectStatus) {
        super(
            'app',
            'project-list',
            false,
            `${type}-projects`
        )
        this.assignedProjects = []
        
        // These 2 are called in this "child" aka "inheriting" class as the contents of these both rely on our inheriting class's 
        // constructor whose setup may rely on something that gets set only after the base class's constructor has finished running
        this.configure()
        this.renderContent()
    }
    configure() {
        projectState.addListeners((projects:Project[]) => {
            const relevantProjects = projects.filter((prj: Project) => {
                if (this.type == 'active') {
                    return prj.status === ProjectStatus.Active
                }
                return prj.status === ProjectStatus.Finished
            })
            this.assignedProjects = relevantProjects
            this.renderProjects()
        })

    }

    private renderProjects() {
        const listEl = document.querySelector(`#${this.type}-projects-list`)! as HTMLUListElement;
        listEl.innerHTML = ""
        for (const projectItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title
            listEl.appendChild(listItem)
        }
    }


    renderContent() {
        const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId
        this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`
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
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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

const prjInput = new ProjectInput()
const activePrjList = new ProjectList(ProjectStatus.Active)
const finishedPrjList = new ProjectList(ProjectStatus.Finished)