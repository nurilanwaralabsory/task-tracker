import { promises as fs } from "node:fs";
import path from "path";

import type { Task } from "../types/task";
import { TaskStorageError } from "../utils/errors";

export class TaskRepository {
     private readonly filePath: string;

     constructor(filePath = path.join(process.cwd(), "tasks.json")) {
          this.filePath = filePath;
     }

     async findAll(): Promise<Task[]> {
          await this.ensureFileExists();

          try {
               const content = await fs.readFile(this.filePath, "utf-8");

               if (!content.trim()) {
                    return [];
               }

               const tasks: unknown = JSON.parse(content);

               if (!Array.isArray(tasks)) {
                    throw new Error("Task data must be an array");
               }

               return tasks;
          } catch (error) {
               if (error instanceof SyntaxError) {
                    throw new TaskStorageError(
                         "tasks.json contains invalid JSON.",
                    );
               }

               if (error instanceof TaskStorageError) {
                    throw error;
               }

               throw new TaskStorageError("Failded to read tasks from storage");
          }
     }

     async saveAll(tasks: Task[]): Promise<void> {
          try {
               const content = JSON.stringify(tasks, null, 2);

               await fs.writeFile(this.filePath, content, "utf-8");
          } catch {
               throw new TaskStorageError("Failed to save tasks to storage");
          }
     }

     private async ensureFileExists(): Promise<void> {
          try {
               await fs.access(this.filePath);
          } catch {
               try {
                    await fs.writeFile(this.filePath, "[]", "utf-8");
               } catch {
                    throw new TaskStorageError("Failed to create tasks.json.");
               }
          }
     }
}
