namespace App {
    // Enum for the status of a project
    export enum ProjectStatus{
        Active = 'active',
        Finished = 'finished'
    }

    // Project class
    export class Project {
        constructor(
            public id: string,
            public title:string,
            public description:string,
            public people:number,
            public status:ProjectStatus,
        ) {
            
        }
    }

}