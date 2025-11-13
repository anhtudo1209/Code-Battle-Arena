import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CodeJudge {
  constructor() {
    this.dockerImage = 'cpp-judge';
    // backend root directory
    this.backendRoot = path.join(__dirname, '..'); // D:/project/Code-Battle-Arena/backend
  }

  async judgeSubmission(code, exerciseId = 'exercise1') {
    const submissionId = Date.now().toString();
    const tempDir = path.join(this.backendRoot, 'temp', submissionId);

    try {
      await fs.promises.mkdir(tempDir, { recursive: true });
      const codeFile = path.join(tempDir, 'solution.cpp');
      await fs.promises.writeFile(codeFile, code);

      const compileResult = await this.compileCode(tempDir);
      if (!compileResult.success) {
        return {
          success: false,
          compilationSuccess: false,
          compilationError: compileResult.error,
          testResults: [],
        };
      }

      const testResults = await this.runTestCases(tempDir, exerciseId);
      const allPassed = testResults.every((t) => t.passed);

      return {
        success: allPassed,
        compilationSuccess: true,
        testResults,
      };
    } catch (error) {
      console.error('Judging error:', error);
      return {
        success: false,
        error: 'Internal judging error',
        testResults: [],
      };
    } finally {
      // cleanup
      try {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
  }

  async compileCode(tempDir) {
    try {
      const dockerPath = tempDir.replace(/\\/g, '/');
      const compileCmd = `docker run --rm -v "${dockerPath}:/judge/temp" -w /judge/temp ${this.dockerImage} g++ -o solution solution.cpp 2>&1`;
      await execAsync(compileCmd, { timeout: 30000 });
      return { success: true };
    } catch (error) {
      const errorMessage = error.stdout || error.stderr || error.message;
      return { success: false, error: errorMessage };
    }
  }

  async runTestCases(tempDir, exerciseId) {
    const exerciseDir = path.join(this.backendRoot, 'exercises', exerciseId);
    const testResults = [];

    try {
      let timeLimit = 5;
      let memoryLimit = '256m';

      try {
        const configPath = path.join(exerciseDir, 'config.json');
        const configData = await fs.promises.readFile(configPath, 'utf8');
        const config = JSON.parse(configData);
        timeLimit = config.timeLimit || timeLimit;
        memoryLimit = config.memoryLimit || memoryLimit;
      } catch {}

      const files = await fs.promises.readdir(exerciseDir);
      const outputFiles = files.filter((f) => f.endsWith('.output.txt')).sort();

      for (const outputFile of outputFiles) {
        const testCaseNum = outputFile.replace('.output.txt', '');
        const inputPath = path.join(exerciseDir, `${testCaseNum}.input.txt`);
        const expectedOutputPath = path.join(exerciseDir, outputFile);

        const result = await this.runSingleTest(tempDir, inputPath, expectedOutputPath, timeLimit, memoryLimit);
        testResults.push({ testCase: testCaseNum, ...result });

        if (!result.passed) break;
      }
    } catch (error) {
      console.error('Error running test cases:', error);
    }

    return testResults;
  }

  async runSingleTest(tempDir, inputPath, expectedOutputPath, timeLimit = 5, memoryLimit = '256m') {
    try {
      let inputContent = '';
      try {
        inputContent = await fs.promises.readFile(inputPath, 'utf8');
      } catch {}

      const expectedOutput = await fs.promises.readFile(expectedOutputPath, 'utf8');
      const tempInputPath = path.join(tempDir, 'input.txt');
      await fs.promises.writeFile(tempInputPath, inputContent);

      const dockerPath = tempDir.replace(/\\/g, '/');
      const runCmd = `docker run --rm -v "${dockerPath}:/judge/temp" -w /judge/temp --memory=${memoryLimit} --cpus=0.5 --ulimit nproc=50 ${this.dockerImage} sh -c "timeout ${timeLimit}s ./solution < input.txt"`;
      const { stdout } = await execAsync(runCmd, { timeout: (timeLimit + 5) * 1000 });

      const normalize = (s) => s.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split(/\s+/).join(' ');

      return {
        passed: normalize(stdout) === normalize(expectedOutput),
        expected: normalize(expectedOutput),
        actual: normalize(stdout),
      };
    } catch (error) {
      if (error.code === 'ETIMEDOUT') {
        return { passed: false, error: 'Time limit exceeded', expected: '', actual: '' };
      }
      return { passed: false, error: error.stdout || error.stderr || error.message, expected: '', actual: '' };
    }
  }
}

export default CodeJudge;
