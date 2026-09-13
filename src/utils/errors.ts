export class TaskNotFoundError extends Error {
     constructor(id: number) {
          super(`Task with ID ${id} was not found.`);
          this.name = "TaskNotFoundError";
     }
}

export class TaskValidationError extends Error {
     constructor(message: string) {
          super(message);
          this.name = "TaskValidationError";
     }
}

export class TaskStorageError extends Error {
     constructor(message: string) {
          super(message);
          this.name = "TaskStorageError";
     }
}
