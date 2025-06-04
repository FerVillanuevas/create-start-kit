#!/usr/bin/env node
import chalk from "chalk";
import { execSync } from "child_process";
import { Command } from "commander";
import fs from "fs-extra";
import inquirer from "inquirer";
import ora from "ora";
import path from "path";
const program = new Command();
const TEMPLATES = {
    "start-kit": {
        name: "Tanstack Start",
        repo: "https://github.com/FerVillanuevas/start-kit",
        description: "Tanstack Start, Vite, and Tailwind CSS",
    },
    "mob-kit": {
        name: "Mobile Kit",
        repo: "https://github.com/FerVillanuevas/mob-kit",
        description: "Build with love and Expo",
    },
};
async function main() {
    console.log(chalk.blue.bold("\n🚀 Welcome to Start-Kit Generator!\n"));
    program
        .name("create-start-kit")
        .description("CLI tool to create projects from start-kit templates")
        .version("1.0.0")
        .argument("[project-name]", "Name of the project")
        .option("-t, --template <template>", "Template to use")
        .option("-p, --package-manager <manager>", "Package manager to use (npm, yarn, pnpm, bun)")
        .option("--no-install", "Skip dependency installation")
        .option("--no-git", "Skip git initialization")
        .action(async (projectName, options) => {
        await createProject(projectName, options);
    });
    program.parse();
}
async function createProject(projectName, cmdOptions = {}) {
    try {
        const options = await promptForOptions(projectName, cmdOptions);
        await scaffoldProject(options);
    }
    catch (error) {
        console.error(chalk.red("Error creating project:"), error);
        process.exit(1);
    }
}
async function promptForOptions(projectName, cmdOptions = {}) {
    const answers = {};
    // Project name
    if (!projectName) {
        const projectNameAnswer = await inquirer.prompt({
            type: "input",
            name: "projectName",
            message: "What is your project name?",
            default: "my-project",
            validate: (input) => {
                if (!input.trim())
                    return "Project name is required";
                if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
                    return "Project name can only contain letters, numbers, hyphens, and underscores";
                }
                return true;
            },
        });
        answers.projectName = projectNameAnswer.projectName;
    }
    // Template selection
    if (!cmdOptions.template) {
        const templateAnswer = await inquirer.prompt({
            type: "list",
            name: "template",
            message: "Which template would you like to use?",
            choices: Object.entries(TEMPLATES).map(([key, template]) => ({
                name: `${template.name} - ${template.description}`,
                value: key,
            })),
        });
        answers.template = templateAnswer.template;
    }
    // Package manager selection
    if (!cmdOptions.packageManager) {
        const packageManagerAnswer = await inquirer.prompt({
            type: "list",
            name: "packageManager",
            message: "Which package manager would you like to use?",
            choices: [
                { name: "npm", value: "npm" },
                { name: "yarn", value: "yarn" },
                { name: "pnpm", value: "pnpm" },
                { name: "bun", value: "bun" },
            ],
            default: "npm",
        });
        answers.packageManager = packageManagerAnswer.packageManager;
    }
    else {
        answers.packageManager = cmdOptions.packageManager;
    }
    // Additional options
    const installAnswer = await inquirer.prompt({
        type: "confirm",
        name: "installDeps",
        message: "Install dependencies?",
        default: cmdOptions.install !== false,
    });
    answers.installDeps = installAnswer.installDeps;
    const gitAnswer = await inquirer.prompt({
        type: "confirm",
        name: "gitInit",
        message: "Initialize git repository?",
        default: cmdOptions.git !== false,
    });
    answers.gitInit = gitAnswer.gitInit;
    return {
        projectName: projectName || answers.projectName,
        template: cmdOptions.template || answers.template,
        packageManager: answers.packageManager,
        installDeps: answers.installDeps,
        gitInit: answers.gitInit,
    };
}
async function scaffoldProject(options) {
    const { projectName, template, installDeps, gitInit } = options;
    const templateConfig = TEMPLATES[template];
    if (!templateConfig) {
        throw new Error(`Template "${template}" not found`);
    }
    const targetDir = path.resolve(process.cwd(), projectName);
    // Check if directory already exists
    if (await fs.pathExists(targetDir)) {
        const { overwrite } = await inquirer.prompt([
            {
                type: "confirm",
                name: "overwrite",
                message: `Directory "${projectName}" already exists. Overwrite?`,
                default: false,
            },
        ]);
        if (!overwrite) {
            console.log(chalk.yellow("Operation cancelled."));
            return;
        }
        await fs.remove(targetDir);
    }
    console.log(chalk.blue(`\nCreating project "${projectName}" using ${templateConfig.name}...\n`));
    // Clone template repository
    const cloneSpinner = ora("Downloading template...").start();
    try {
        execSync(`git clone ${templateConfig.repo} "${targetDir}"`, {
            stdio: "pipe",
        });
        // Remove .git directory
        await fs.remove(path.join(targetDir, ".git"));
        cloneSpinner.succeed("Template downloaded successfully");
    }
    catch (error) {
        cloneSpinner.fail("Failed to download template");
        throw error;
    }
    // Update package.json
    const packageJsonPath = path.join(targetDir, "package.json");
    if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        packageJson.name = projectName;
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
    // Install dependencies
    if (installDeps) {
        const { packageManager } = options;
        const installSpinner = ora(`Installing dependencies with ${packageManager}...`).start();
        try {
            // Define install commands for different package managers
            const installCommands = {
                npm: "npm install",
                yarn: "yarn",
                pnpm: "pnpm install",
                bun: "bun install",
            };
            const installCmd = installCommands[packageManager] ||
                "npm install";
            execSync(installCmd, {
                cwd: targetDir,
                stdio: "pipe",
            });
            installSpinner.succeed("Dependencies installed successfully");
        }
        catch (error) {
            installSpinner.fail(`Failed to install dependencies with ${packageManager}`);
            console.log(chalk.yellow(`You can install them manually later with: ${packageManager} install`));
        }
    }
    // Initialize git repository
    if (gitInit) {
        const gitSpinner = ora("Initializing git repository...").start();
        try {
            execSync("git init", { cwd: targetDir, stdio: "pipe" });
            execSync("git add .", { cwd: targetDir, stdio: "pipe" });
            execSync('git commit -m "Initial commit"', {
                cwd: targetDir,
                stdio: "pipe",
            });
            gitSpinner.succeed("Git repository initialized");
        }
        catch (error) {
            gitSpinner.fail("Failed to initialize git repository");
            console.log(chalk.yellow("You can initialize git manually later"));
        }
    }
    // Success message
    console.log(chalk.green.bold("\n🎉 Project created successfully!\n"));
    console.log(chalk.cyan("Next steps:"));
    console.log(chalk.white(`  cd ${projectName}`));
    const { packageManager } = options;
    if (!installDeps) {
        // Show appropriate install command based on package manager
        const installCommands = {
            npm: "npm install",
            yarn: "yarn",
            pnpm: "pnpm install",
            bun: "bun install",
        };
        const installCmd = installCommands[packageManager] ||
            "npm install";
        console.log(chalk.white(`  ${installCmd}`));
    }
    // Show appropriate run command based on package manager
    const runCommands = {
        npm: "npm run dev",
        yarn: "yarn dev",
        pnpm: "pnpm dev",
        bun: "bun dev",
    };
    const runCmd = runCommands[packageManager] || "npm run dev";
    console.log(chalk.white(`  ${runCmd}\n`));
    console.log(chalk.gray("Happy coding! 🚀\n"));
}
main().catch(console.error);
