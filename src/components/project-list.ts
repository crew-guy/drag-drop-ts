/// <reference path="base-component.ts"/>
/// <reference path="project-item.ts"/>

namespace App {
    
    export class ProjectList
        extends Component<HTMLDivElement, HTMLElement>
        implements DragTarget
    {
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
            this.element.addEventListener('dragleave', this.dragLeaveHandler)
            this.element.addEventListener('drop', this.dropHandler)
            this.element.addEventListener('dragover', this.dragOverHandler)
            projectState.addListener((projects:Project[]) => {
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
                new ProjectItem(this.element.querySelector('ul')!.id, projectItem)
            }
        }

        renderContent() {
            const listId = `${this.type}-projects-list`
            this.element.querySelector('ul')!.id = listId
            this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`
        }

        @Autobind
        dragOverHandler(event: DragEvent) {
            if (event.dataTransfer && event.dataTransfer.types[0]== "text/plain") {
                event.preventDefault()
                const listEl = this.element.querySelector('ul')!
                listEl.classList.add('droppable')
            }
        }

        @Autobind
        dropHandler(event: DragEvent) {
            const projectId = event.dataTransfer!.getData('text/plain')
            projectState.moveProject(
                projectId,
                this.type == "active"
                    ? ProjectStatus.Active
                    : ProjectStatus.Finished
            )
        }
        @Autobind
        dragLeaveHandler(_: DragEvent) {
            const listEl = this.element.querySelector('ul')!
            listEl.classList.remove('droppable')
        }
    }
}