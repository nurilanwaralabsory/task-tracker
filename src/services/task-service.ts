import type { Task, TaskStatus } from "../types/task";
import { TaskNotFoundError, TaskValidationError } from "../utils/errors";
import { getCurrentTimeStamp } from "../utils/date";
import { TaskRepository } from "../repositories/task-repository";

export class TaskService {
     constructor(private readonly repository: TaskRepository) {}

     async addTask(description: string): Promise<Task> {
          this.validateDescription(description);

          const tasks = await this.repository.findAll();

          const nextId = this.generateNextId(tasks);
          const timestamp = getCurrentTimeStamp();

          const task: Task = {
               id: nextId,
               description: description.trim(),
               status: "todo",
               createdAt: timestamp,
               updatedAt: timestamp,
          };

          tasks.push(task);

          await this.repository.saveAll(tasks);

          return task;
     }

     async updateTask(id: number, description: string): Promise<Task> {
          this.validateId(id);
          this.validateDescription(description);

          const tasks = await this.repository.findAll();

          const task = this.findTaskById(tasks, id);

          task.description = description.trim();
          task.updatedAt = getCurrentTimeStamp();

          await this.repository.saveAll(tasks);

          return task;
     }

     async deleteTask(id: number): Promise<void> {
          this.validateId(id);

          const tasks = await this.repository.findAll();

          const taskIndex = tasks.findIndex((task) => task.id === id);

          if (taskIndex === -1) {
               throw new TaskNotFoundError(id);
          }

          tasks.splice(taskIndex, 1);

          await this.repository.saveAll(tasks);
     }

     async updateStatus(id: number, status: TaskStatus): Promise<Task> {
          this.validateId(id);

          const tasks = await this.repository.findAll();

          const task = this.findTaskById(tasks, id);

          task.status = status;
          task.updatedAt = getCurrentTimeStamp();

          await this.repository.saveAll(tasks);

          return task;
     }

     async listTasks(status?: TaskStatus): Promise<Task[]> {
          const tasks = await this.repository.findAll();

          if (!status) {
               return tasks;
          }

          return tasks.filter((task) => task.status === status);
     }

     private findTaskById(tasks: Task[], id: number): Task {
          const task = tasks.find((task) => task.id === id);

          if (!task) {
               throw new TaskNotFoundError(id);
          }

          return task;
     }

     private generateNextId(tasks: Task[]): number {
          if (tasks.length === 0) {
               return 1;
          }

          return Math.max(...tasks.map((task) => task.id)) + 1;
     }

     private validateDescription(description: string): void {
          if (!description || !description.trim()) {
               throw new TaskValidationError(
                    "Task description cannot be empty.",
               );
          }
     }

     private validateId(id: number): void {
          if (!Number.isInteger(id) || id <= 0) {
               throw new TaskValidationError(
                    "Task ID must be a positive integer.",
               );
          }
     }
}
