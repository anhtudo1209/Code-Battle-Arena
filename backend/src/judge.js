import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

class CodeJudge {
  constructor() {
    this.dockerImage = 'cpp-judge';
  }

  async judgeSubmission(code, exerciseId = 'exercise1') {
    const submissionId = Date.now().toString();
    const tempDir = path.join(process.cwd(), 'temp', submissionId);

    try {
      // Create temp directory for this submission
      await fs.promises.mkdir(tempDir, { recursive: true });

      // Write code to file
      const codeFile = path.join(tempDir, 'solution.cpp');
      await fs.promises.writeFile(codeFile, code);

      // Compile the code
      const compileResult = await this.compileCode(tempDir);
      if (!compileResult.success) {
        return {
          success: false,
          compilationSuccess: false,
          compilationError: compileResult.error,
          testResults: []
        };
      }

      // Run test cases
      const testResults = await this.runTestCases(tempDir, exerciseId);

      const allPassed = testResults.every(test => test.passed);

      return {
        success: allPassed,
        compilationSuccess: true,
        testResults: testResults
      };

    } catch (error) {
      console.error('Judging error:', error);
      return {
        success: false,
        error: 'Internal judging error',
        testResults: []
      };
    } finally {
      // Clean up temp directory
      try {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
  }

  async compileCode(tempDir) {
    try {
      // Convert Windows path to Docker-compatible format (forward slashes)
      const dockerPath = tempDir.replace(/\\/g, '/');

      const compileCmd = `docker run --rm -v "${dockerPath}:/judge/temp" -w /judge/temp ${this.dockerImage} g++ -o solution solution.cpp 2>&1`;
      const { stdout, stderr } = await execAsync(compileCmd, { timeout: 30000 });

      // Compilation succeeded if the command didn't throw an error
      // stderr may contain warnings which are not errors
      return { success: true };

    } catch (error) {
      // If compilation actually failed (non-zero exit code), show the error
      const errorMessage = error.stdout || error.stderr || error.message;
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  async runTestCases(tempDir, exerciseId) {
    const exerciseDir = path.join(process.cwd(), 'backend', 'exercises', exerciseId);
    const testResults = [];

    try {
      // Load config (default to 5 seconds if not found)
      let timeLimit = 5;
      let memoryLimit = '256m';
      try {
        const configPath = path.join(exerciseDir, 'config.json');
        const configData = await fs.promises.readFile(configPath, 'utf8');
        const config = JSON.parse(configData);
        timeLimit = config.timeLimit || 5;
        memoryLimit = config.memoryLimit || '256m';
      } catch (configError) {
        // No config file, use defaults
      }

      // Find all test case files
      const files = await fs.promises.readdir(exerciseDir);
      const outputFiles = files.filter(f => f.endsWith('.output.txt')).sort();

      for (const outputFile of outputFiles) {
        const testCaseNum = outputFile.replace('.output.txt', '');
        const inputFile = `${testCaseNum}.input.txt`;

        const inputPath = path.join(exerciseDir, inputFile);
        const expectedOutputPath = path.join(exerciseDir, outputFile);

        const result = await this.runSingleTest(tempDir, inputPath, expectedOutputPath, timeLimit, memoryLimit);
        testResults.push({
          testCase: testCaseNum,
          ...result
        });

        // Stop running tests after first failure
        if (!result.passed) {
          break;
        }
      }
    } catch (error) {
      console.error('Error running test cases:', error);
    }

    return testResults;
  }

  async runSingleTest(tempDir, inputPath, expectedOutputPath, timeLimit = 5, memoryLimit = '256m') {
    try {
      // Read expected output
      const expectedOutput = await fs.promises.readFile(expectedOutputPath, 'utf8');

      // Check if input file exists and read it
      let inputContent = '';
      try {
        inputContent = await fs.promises.readFile(inputPath, 'utf8');
      } catch (inputError) {
        // Input file not found or empty, using empty input
      }

      // Write input to temp directory
      const tempInputPath = path.join(tempDir, 'input.txt');
      await fs.promises.writeFile(tempInputPath, inputContent);

      // Convert Windows path to Docker-compatible format (forward slashes)
      const dockerPath = tempDir.replace(/\\/g, '/');

      // Run the program with input using Docker
      // Use sh -c to properly handle input redirection in Docker
      const runCmd = `docker run --rm -v "${dockerPath}:/judge/temp" -w /judge/temp --memory=${memoryLimit} --cpus=0.5 --ulimit nproc=50 ${this.dockerImage} sh -c "timeout ${timeLimit}s ./solution < input.txt"`;

      // Set execAsync timeout to timeLimit + 5 seconds buffer
      const execTimeout = (timeLimit + 5) * 1000;
      const { stdout, stderr } = await execAsync(runCmd, { timeout: execTimeout });

      // Compare outputs (trim whitespace)
      const actualOutput = stdout.trim();
      const expectedTrimmed = expectedOutput.trim();

      return {
        passed: actualOutput === expectedTrimmed,
        expected: expectedTrimmed,
        actual: actualOutput
      };

    } catch (error) {
      if (error.code === 'ETIMEDOUT') {
        return {
          passed: false,
          error: 'Time limit exceeded',
          expected: '',
          actual: ''
        };
      }

      return {
        passed: false,
        error: error.stdout || error.stderr || error.message,
        expected: '',
        actual: ''
      };
    }
  }
}

export default CodeJudge;
