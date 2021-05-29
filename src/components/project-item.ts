/// <reference path="base-component.ts"/>
/// <reference path="../models/drag-drop.ts" />


namespace App {
    export class ProjectItem
        extends Component<HTMLUListElement, HTMLLIElement>
        implements Draggable
    {

        get persons() {
            if (this.project.people == 1) {
                return "1 person"
            } else {
                return `${this.project.people} people`
            }
        }

        constructor(hostId:string, private project:Project) {
            super(
                hostId,
                "single-project",
                false,
                project.id
            );
            this.configure()
            this.renderContent()
        }

        configure() {
            this.element.addEventListener('dragstart', this.dragStartHandler)
            this.element.addEventListener('dragend', this.dragEndHandler)    
        }
        
        renderContent() {
            this.element.querySelector('h2')!.textContent = this.project.title
            this.element.querySelector('h3')!.textContent = this.persons +" assigned"
            this.element.querySelector('p')!.textContent = this.project.description
        }

        @Autobind
        dragStartHandler(event :DragEvent) {
            event.dataTransfer!.setData('text/plain', this.project.id)
            event.dataTransfer!.effectAllowed="move"
        }

        @Autobind
        dragEndHandler(_:DragEvent) {
            console.log('Dragend')
        }

    }
}