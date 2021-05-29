import { Project, ProjectStatus } from '../models/project.js'

// Type of listener functions
type Listener<T> = (projects:T[]) => void

class State<T> {
    protected listeners: T[]
    
    constructor() {
        this.listeners = [] 
    }

    addListener(listenerFn: T) {
        this.listeners.push(listenerFn)
    }
}

export class ProjectState extends State<Listener<Project>>{
    private projects: Project[] = []
    private static instance:ProjectState

    private constructor() {
        super()        
    }

    static getInstance() {
        if (this.instance)
            return this.instance
        this.instance = new ProjectState()
        return this.instance
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
        this.updateListeners()
    }

    moveProject(projectId: string, newStatus: ProjectStatus) {
        const project = this.projects.find((prj: Project) => prj.id == projectId)
        if (project && project.status !== newStatus ) {
            project.status = newStatus
        }
        this.updateListeners()
    }
    
    private updateListeners() {
        for (const listenerFn of this.listeners) {
            // Pass to this listener function a copy of the state that this class is managing i.e. the "projects" list
            // We call "slice" to return a copy of the array and not the original "array" to make the "projects" list to :
            // 1. make the state uneditable from the place the listener function is coming from
            // 2. ensure that if we push something to it from inside, state would change everywhere else in the app but these places would not really notice that had changed
            listenerFn(this.projects.slice())
        }
    }
}
export const projectState = ProjectState.getInstance()