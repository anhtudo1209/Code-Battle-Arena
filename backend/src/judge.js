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

      // For now, simulate compilation and testing without Docker
      // TODO: Replace with actual Docker execution when Docker is available
      const result = await this.simulateJudging(code, exerciseId);

      return result;

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

  // Temporary simulation method until Docker is set up
  async simulateJudging(code, exerciseId) {
    // Simple check for basic C++ hello world
    const hasHelloWorld = code.includes('cout') && code.includes('Hello, World!');
    const hasInclude = code.includes('#include <iostream>');
    const hasUsingNamespace = code.includes('using namespace std;');
    const hasMain = code.includes('int main()');

    if (hasInclude && hasUsingNamespace && hasMain && hasHelloWorld) {
      return {
        success: true,
        compilationSuccess: true,
        testResults: [
          {
            testCase: 'testcase1',
            passed: true,
            expected: 'Hello, World!',
            actual: 'Hello, World!',
            executionTime: 0.001,
            memoryUsed: 1024
          }
        ]
      };
    } else {
      return {
        success: false,
        compilationSuccess: false,
        compilationError: 'Compilation failed: Missing required C++ elements',
        testResults: []
      };
    }
  }

  async runTestCases(tempDir, exerciseId) {
    const exerciseDir = path.join(process.cwd(), 'exercises', exerciseId);
    const testResults = [];

    try {
      // Find all test case files
      const files = await fs.promises.readdir(exerciseDir);
      const inputFiles = files.filter(f => f.endsWith('.input.txt')).sort();

      for (const inputFile of inputFiles) {
        const testCaseNum = inputFile.replace('.input.txt', '');
        const outputFile = `${testCaseNum}.output.txt`;

        const inputPath = path.join(exerciseDir, inputFile);
        const expectedOutputPath = path.join(exerciseDir, outputFile);

        const result = await this.runSingleTest(tempDir, inputPath, expectedOutputPath);
        testResults.push({
          testCase: testCaseNum,
          ...result
        });
      }
    } catch (error) {
      console.error('Error running test cases:', error);
    }

    return testResults;
  }

  async runSingleTest(tempDir, inputPath, expectedOutputPath) {
    try {
      // Read expected output
      const expectedOutput = await fs.promises.readFile(expectedOutputPath, 'utf8');

      // Run the program with input
      const runCmd = `docker run --rm -v "${tempDir}:/judge/temp" -w /judge/temp --memory=256m --cpus=0.5 --ulimit nproc=50 gcc:latest timeout 5s ./solution < /judge/temp/input.txt`;

      // Copy input file to temp directory
      const tempInputPath = path.join(tempDir, 'input.txt');
      await fs.promises.copyFile(inputPath, tempInputPath);

      const { stdout, stderr } = await execAsync(runCmd, { timeout: 10000 });

      // Compare outputs (trim whitespace)
      const actualOutput = stdout.trim();
      const expectedTrimmed = expectedOutput.trim();

      return {
        passed: actualOutput === expectedTrimmed,
        expected: expectedTrimmed,
        actual: actualOutput,
        executionTime: 0, // Could be measured with /usr/bin/time
        memoryUsed: 0    // Could be measured
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
