"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var App;
(function (App) {
    let ProjectStatus;
    (function (ProjectStatus) {
        ProjectStatus["Active"] = "active";
        ProjectStatus["Finished"] = "finished";
    })(ProjectStatus = App.ProjectStatus || (App.ProjectStatus = {}));
    class Project {
        constructor(id, title, description, people, status) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.people = people;
            this.status = status;
        }
    }
    App.Project = Project;
})(App || (App = {}));
var App;
(function (App) {
    class Component {
        constructor(hostElementId, templateElementId, insertAtBeginning, elementId) {
            this.hostElement = document.getElementById(hostElementId);
            this.templateElement = document.getElementById(templateElementId);
            const importedNode = document.importNode(this.templateElement.content, true);
            this.element = importedNode.firstElementChild;
            this.element.id = elementId;
            this.attach(insertAtBeginning);
        }
        attach(insertAtBeginning) {
            this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
        }
    }
    App.Component = Component;
})(App || (App = {}));
var App;
(function (App) {
    App.validate = (validatableInput) => {
        let isValid = true;
        if (validatableInput.required) {
            isValid = isValid && validatableInput.value.toString().length !== 0;
        }
        if (validatableInput.minLength != null &&
            typeof validatableInput.value == 'string') {
            isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
        }
        if (validatableInput.maxLength != null &&
            typeof validatableInput.value == 'string') {
            isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
        }
        if (validatableInput.min != null &&
            typeof validatableInput.value == "number") {
            isValid = isValid && validatableInput.value >= validatableInput.min;
        }
        if (validatableInput.max != null &&
            typeof validatableInput.value == "number") {
            isValid = isValid && validatableInput.value <= validatableInput.max;
        }
        return isValid;
    };
})(App || (App = {}));
var App;
(function (App) {
    class State {
        constructor() {
            this.listeners = [];
        }
        addListener(listenerFn) {
            this.listeners.push(listenerFn);
        }
    }
    class ProjectState extends State {
        constructor() {
            super();
            this.projects = [];
        }
        static getInstance() {
            if (this.instance)
                return this.instance;
            this.instance = new ProjectState();
            return this.instance;
        }
        addProject(title, description, numOfPeople) {
            const newProject = new App.Project(Math.random().toString(), title, description, numOfPeople, App.ProjectStatus.Active);
            this.projects.push(newProject);
            this.updateListeners();
        }
        moveProject(projectId, newStatus) {
            const project = this.projects.find((prj) => prj.id == projectId);
            if (project && project.status !== newStatus) {
                project.status = newStatus;
            }
            this.updateListeners();
        }
        updateListeners() {
            for (const listenerFn of this.listeners) {
                listenerFn(this.projects.slice());
            }
        }
    }
    App.ProjectState = ProjectState;
    App.projectState = ProjectState.getInstance();
})(App || (App = {}));
var App;
(function (App) {
    function Autobind(_, _2, descriptor) {
        const originalMethod = descriptor.value;
        const adjDescriptor = {
            configurable: true,
            get() {
                const boundFn = originalMethod.bind(this);
                return boundFn;
            }
        };
        return adjDescriptor;
    }
    App.Autobind = Autobind;
})(App || (App = {}));
var App;
(function (App) {
    class ProjectInput extends App.Component {
        constructor() {
            super("app", "project-input", true, "user-input");
            this.titleInputElement = this.element.querySelector('#title');
            this.descriptionInputElement = this.element.querySelector('#description');
            this.peopleInputElement = this.element.querySelector('#people');
            this.configure();
        }
        gatherUserInput() {
            const enteredTitle = this.titleInputElement.value;
            const enteredDescription = this.descriptionInputElement.value;
            const enteredPeople = this.peopleInputElement.value;
            const titleValidate = {
                value: enteredTitle,
                minLength: 2,
                maxLength: 16,
                required: true
            };
            const descriptionValidate = {
                value: enteredDescription,
                minLength: 2,
                required: false
            };
            const peopleValidate = {
                value: +enteredPeople,
                min: 1,
                max: 10,
                required: true
            };
            if (!App.validate(titleValidate) ||
                !App.validate(descriptionValidate) ||
                !App.validate(peopleValidate)) {
                alert('Validation failed');
            }
            else {
                return [enteredTitle, enteredDescription, +enteredPeople];
            }
        }
        clearInput() {
            this.titleInputElement.value = "";
            this.descriptionInputElement.value = "";
            this.peopleInputElement.value = "";
        }
        submitHandler(e) {
            e.preventDefault();
            const userInput = this.gatherUserInput();
            if (Array.isArray(userInput)) {
                const [title, description, people] = userInput;
                App.projectState.addProject(title, description, people);
                this.clearInput();
            }
        }
        configure() {
            this.element.addEventListener('submit', this.submitHandler);
        }
        renderContent() { }
    }
    __decorate([
        App.Autobind
    ], ProjectInput.prototype, "submitHandler", null);
    App.ProjectInput = ProjectInput;
})(App || (App = {}));
var App;
(function (App) {
    class ProjectItem extends App.Component {
        constructor(hostId, project) {
            super(hostId, "single-project", false, project.id);
            this.project = project;
            this.configure();
            this.renderContent();
        }
        get persons() {
            if (this.project.people == 1) {
                return "1 person";
            }
            else {
                return `${this.project.people} people`;
            }
        }
        configure() {
            this.element.addEventListener('dragstart', this.dragStartHandler);
            this.element.addEventListener('dragend', this.dragEndHandler);
        }
        renderContent() {
            this.element.querySelector('h2').textContent = this.project.title;
            this.element.querySelector('h3').textContent = this.persons + " assigned";
            this.element.querySelector('p').textContent = this.project.description;
        }
        dragStartHandler(event) {
            event.dataTransfer.setData('text/plain', this.project.id);
            event.dataTransfer.effectAllowed = "move";
        }
        dragEndHandler(_) {
            console.log('Dragend');
        }
    }
    __decorate([
        App.Autobind
    ], ProjectItem.prototype, "dragStartHandler", null);
    __decorate([
        App.Autobind
    ], ProjectItem.prototype, "dragEndHandler", null);
    App.ProjectItem = ProjectItem;
})(App || (App = {}));
var App;
(function (App) {
    class ProjectList extends App.Component {
        constructor(type) {
            super('app', 'project-list', false, `${type}-projects`);
            this.type = type;
            this.assignedProjects = [];
            this.configure();
            this.renderContent();
        }
        configure() {
            this.element.addEventListener('dragleave', this.dragLeaveHandler);
            this.element.addEventListener('drop', this.dropHandler);
            this.element.addEventListener('dragover', this.dragOverHandler);
            App.projectState.addListener((projects) => {
                const relevantProjects = projects.filter((prj) => {
                    if (this.type == 'active') {
                        return prj.status === App.ProjectStatus.Active;
                    }
                    return prj.status === App.ProjectStatus.Finished;
                });
                this.assignedProjects = relevantProjects;
                this.renderProjects();
            });
        }
        renderProjects() {
            const listEl = document.querySelector(`#${this.type}-projects-list`);
            listEl.innerHTML = "";
            for (const projectItem of this.assignedProjects) {
                new App.ProjectItem(this.element.querySelector('ul').id, projectItem);
            }
        }
        renderContent() {
            const listId = `${this.type}-projects-list`;
            this.element.querySelector('ul').id = listId;
            this.element.querySelector('h2').textContent = `${this.type.toUpperCase()} PROJECTS`;
        }
        dragOverHandler(event) {
            if (event.dataTransfer && event.dataTransfer.types[0] == "text/plain") {
                event.preventDefault();
                const listEl = this.element.querySelector('ul');
                listEl.classList.add('droppable');
            }
        }
        dropHandler(event) {
            const projectId = event.dataTransfer.getData('text/plain');
            App.projectState.moveProject(projectId, this.type == "active"
                ? App.ProjectStatus.Active
                : App.ProjectStatus.Finished);
        }
        dragLeaveHandler(_) {
            const listEl = this.element.querySelector('ul');
            listEl.classList.remove('droppable');
        }
    }
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dragOverHandler", null);
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dropHandler", null);
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dragLeaveHandler", null);
    App.ProjectList = ProjectList;
})(App || (App = {}));
var App;
(function (App) {
    new App.ProjectInput();
    new App.ProjectList(App.ProjectStatus.Active);
    new App.ProjectList(App.ProjectStatus.Finished);
})(App || (App = {}));
//# sourceMappingURL=bundle.js.map