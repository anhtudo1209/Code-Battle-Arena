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
      const compileCmd = `docker run --rm -v "${tempDir}:/judge/temp" -w /judge/temp ${this.dockerImage} g++ -o solution solution.cpp`;

      const { stdout, stderr } = await execAsync(compileCmd, { timeout: 30000 });

      if (stderr && stderr.trim()) {
        return {
          success: false,
          error: stderr.trim()
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.stderr || error.stdout || error.message
      };
    }
  }

  async runTestCases(tempDir, exerciseId) {
    const exerciseDir = path.join(process.cwd(), 'exercises', exerciseId);
    const testResults = [];

    try {
      // Find all test case files
      const files = await fs.promises.readdir(exerciseDir);
      const outputFiles = files.filter(f => f.endsWith('.output.txt')).sort();

      for (const outputFile of outputFiles) {
        const testCaseNum = outputFile.replace('.output.txt', '');
        const inputFile = `${testCaseNum}.input.txt`;

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

      // Copy input file to temp directory
      const tempInputPath = path.join(tempDir, 'input.txt');
      await fs.promises.copyFile(inputPath, tempInputPath);

      // Run the program with input using Docker
      const runCmd = `docker run --rm -v "${tempDir}:/judge/temp" -w /judge/temp --memory=256m --cpus=0.5 --ulimit nproc=50 ${this.dockerImage} timeout 5s ./solution < input.txt`;

      const { stdout, stderr } = await execAsync(runCmd, { timeout: 10000 });

      // Compare outputs (trim whitespace)
      const actualOutput = stdout.trim();
      const expectedTrimmed = expectedOutput.trim();

      return {
        passed: actualOutput === expectedTrimmed,
        expected: expectedTrimmed,
        actual: actualOutput,
        executionTime: 0.001, // Placeholder
        memoryUsed: 1024     // Placeholder
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
