export abstract class Component<T extends HTMLElement, U extends HTMLElement>{
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