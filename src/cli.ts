#!/usr/bin/env node

import { TaskRepository } from "./repositories/task-repository";
import { TaskService } from "./services/task-service";
import type { TaskStatus } from "./types/task";
import {
     TaskNotFoundError,
     TaskStorageError,
     TaskValidationError,
} from "./utils/errors";

const repository = new TaskRepository();
const service = new TaskService(repository);

async function main(): Promise<void> {
     const [, , command, ...args] = process.argv;

     try {
          switch (command) {
               case "add":
                    await handleAdd(args);
                    break;

               case "update":
                    await handleUpdate(args);
                    break;

               case "delete":
                    await handleDelete(args);
                    break;

               case "mark-in-progress":
                    await handleMarkStatus(args, "in-progress");
                    break;

               case "mark-done":
                    await handleMarkStatus(args, "done");
                    break;

               case "list":
                    await handleList(args);
                    break;

               default:
                    showHelp();
          }
     } catch (error) {
          handleError(error);
          process.exitCode = 1;
     }
}

async function handleAdd(args: string[]): Promise<void> {
     const description = args[0];

     if (!description) {
          throw new TaskValidationError(
               'Usage: task-cli add "task description"',
          );
     }

     const task = await service.addTask(description);

     console.log(`Task added successfully (ID: ${task.id})`);
}

async function handleUpdate(args: string[]): Promise<void> {
     const [idArgument, description] = args;

     const id = parseTaskId(idArgument);

     if (!description) {
          throw new TaskValidationError(
               'Usage: task-cli update <id> "new description"',
          );
     }

     await service.updateTask(id, description);

     console.log(`Task ${id} updated successfully.`);
}

async function handleDelete(args: string[]): Promise<void> {
     const [idArgument] = args;

     const id = parseTaskId(idArgument);

     await service.deleteTask(id);

     console.log(`Task ${id} deleted successfully.`);
}

async function handleMarkStatus(
     args: string[],
     status: TaskStatus,
): Promise<void> {
     const [idArgument] = args;

     const id = parseTaskId(idArgument);

     await service.updateStatus(id, status);

     console.log(`Task ${id} marked as ${status}.`);
}

async function handleList(args: string[]): Promise<void> {
     const [statusArgument] = args;

     const status = parseStatus(statusArgument);

     const tasks = await service.listTasks(status);

     if (tasks.length === 0) {
          console.log("No tasks found.");
          return;
     }

     printTasks(tasks);
}

function parseTaskId(value: string | undefined): number {
     if (!value) {
          throw new TaskValidationError("Task ID is required.");
     }

     const id = Number(value);

     if (!Number.isInteger(id) || id <= 0) {
          throw new TaskValidationError("Task ID must be a positive integer.");
     }

     return id;
}

function parseStatus(value: string | undefined): TaskStatus | undefined {
     if (!value) {
          return undefined;
     }

     switch (value) {
          case "todo":
          case "not-done":
               return "todo";

          case "in-progress":
               return "in-progress";

          case "done":
               return "done";

          default:
               throw new TaskValidationError(
                    "Invalid status. Use: todo, in-progress, or done.",
               );
     }
}

function printTasks(
     tasks: Awaited<ReturnType<TaskService["listTasks"]>>,
): void {
     for (const task of tasks) {
          console.log(`[${task.id}] ${task.description} - ${task.status}`);

          console.log(`    Created: ${task.createdAt}`);

          console.log(`    Updated: ${task.updatedAt}`);

          console.log();
     }
}

function showHelp(): void {
     console.log(`
Task Tracker CLI

Usage:

  task-cli add "task description"
  task-cli update <id> "new description"
  task-cli delete <id>

  task-cli mark-in-progress <id>
  task-cli mark-done <id>

  task-cli list
  task-cli list todo
  task-cli list in-progress
  task-cli list done
`);
}

function handleError(error: unknown): void {
     if (
          error instanceof TaskValidationError ||
          error instanceof TaskNotFoundError ||
          error instanceof TaskStorageError
     ) {
          console.error(`Error: ${error.message}`);
          return;
     }

     console.error("An unexpected error occurred.");

     if (error instanceof Error) {
          console.error(error.message);
     }
}

main();
