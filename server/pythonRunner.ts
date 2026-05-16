import { spawn } from "child_process";
import { join } from "path";
import { platform } from "os";
import { existsSync } from "fs";

/**
 * Options for running a Python script
 */
export interface PythonRunnerOptions {
  /** Script name (e.g., "main.py") */
  script: string;
  /** Environment variables to pass to Python */
  env?: Record<string, string>;
  /** Callback for each log line */
  onLog?: (message: string) => void;
  /** Working directory (default: python_pipeline) */
  cwd?: string;
  /** Timeout in milliseconds (default: 5 minutes) */
  timeout?: number;
}

/**
 * Detects the Python executable path based on the operating system
 * Tries venv first, then falls back to system python3
 * Throws an error if neither is available
 */
function getPythonExecutable(cwd: string): string {
  const isWindows = platform() === "win32";
  
  // Try virtual environment first
  const venvPath = isWindows
    ? join(cwd, ".venv", "Scripts", "python.exe")
    : join(cwd, ".venv", "bin", "python");

  if (existsSync(venvPath)) {
    return venvPath;
  }

  // Fallback to system python3
  const systemPython = isWindows ? "python" : "python3";
  
  // Log the fallback
  console.log(
    `[pythonRunner] Virtual environment not found at ${venvPath}. ` +
    `Falling back to system ${systemPython}.`
  );

  return systemPython;
}

/**
 * Validates that Python is available (either venv or system)
 * Throws an error with setup instructions if not available
 */
function validatePythonAvailable(cwd: string): string {
  const isWindows = platform() === "win32";
  const venvPath = isWindows
    ? join(cwd, ".venv", "Scripts", "python.exe")
    : join(cwd, ".venv", "bin", "python");

  // If venv exists, we're good
  if (existsSync(venvPath)) {
    return venvPath;
  }

  // Check if system python3 is available
  try {
    // This will throw if python3 is not in PATH
    const result = require("child_process").spawnSync(
      isWindows ? "python" : "python3",
      ["--version"],
      { stdio: "pipe", timeout: 5000 }
    );
    
    if (result.status === 0) {
      return isWindows ? "python" : "python3";
    }
  } catch (e) {
    // Python not available
  }

  // Neither venv nor system python available
  const setupCommand = isWindows
    ? "cd python_pipeline && python -m venv .venv && .venv\\Scripts\\python -m pip install -r requirements.txt"
    : "cd python_pipeline && python3 -m venv .venv && .venv/bin/python -m pip install -r requirements.txt";

  throw new Error(
    `Python is not available on this system.\n\n` +
    `To set up the Python environment, run:\n\n  ${setupCommand}\n\n` +
    `Or ensure Python 3 is installed and available in your PATH.\n\n` +
    `Checked locations:\n` +
    (isWindows
      ? `  - python_pipeline\\.venv\\Scripts\\python.exe\n  - python (system)`
      : `  - python_pipeline/.venv/bin/python\n  - python3 (system)`)
  );
}

/**
 * Runs a Python script with the given options
 * Returns a promise that resolves when the script completes successfully
 * or rejects if the script fails or times out
 */
export async function runPythonScript(options: PythonRunnerOptions): Promise<void> {
  const {
    script,
    env = {},
    onLog,
    cwd = join(process.cwd(), "python_pipeline"),
    timeout = 5 * 60 * 1000, // 5 minutes default
  } = options;

  return new Promise((resolve, reject) => {
    let pythonExe: string;
    try {
      pythonExe = validatePythonAvailable(cwd);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      onLog?.(`[pythonRunner] ERROR: ${msg}`);
      reject(error);
      return;
    }

    const scriptPath = join(cwd, script);

    // Log the start
    onLog?.(`[pythonRunner] Starting ${script} with Python: ${pythonExe}`);
    onLog?.(`[pythonRunner] Working directory: ${cwd}`);

    // Merge with process.env but don't expose sensitive keys in logs
    const processEnv = {
      ...process.env,
      ...env,
    };

    // Spawn the Python process
    const child = spawn(pythonExe, [scriptPath], {
      cwd,
      env: processEnv,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    // Set timeout
    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      onLog?.(`[pythonRunner] Timeout after ${timeout}ms, killing process`);
      child.kill("SIGTERM");
    }, timeout);

    // Helper to redact sensitive values from logs
    const redactSensitive = (text: string): string => {
      // Redact API keys and tokens
      const sensitivePatterns = [
        /GOOGLE_PLACES_API_KEY[=:][^\s]*/gi,
        /PAGESPEED_API_KEY[=:][^\s]*/gi,
        /HUNTER_API_KEY[=:][^\s]*/gi,
        /api[_-]?key[=:][^\s]*/gi,
        /token[=:][^\s]*/gi,
        /bearer\s+[^\s]*/gi,
        /AIza[A-Za-z0-9_-]{35}/g, // Google API keys
      ];

      let redacted = text;
      for (const pattern of sensitivePatterns) {
        redacted = redacted.replace(pattern, (match) => {
          const prefix = match.split(/[=:]/)[0];
          return `${prefix}=****`;
        });
      }
      return redacted;
    };

    // Handle stdout
    child.stdout?.on("data", (data) => {
      const message = data.toString().trim();
      if (message) {
        stdout += message + "\n";
        onLog?.(redactSensitive(message));
      }
    });

    // Handle stderr
    child.stderr?.on("data", (data) => {
      const message = data.toString().trim();
      if (message) {
        stderr += message + "\n";
        onLog?.(`[stderr] ${redactSensitive(message)}`);
      }
    });

    // Handle process exit
    child.on("close", (code) => {
      clearTimeout(timeoutHandle);

      if (timedOut) {
        reject(new Error(`Python script ${script} timed out after ${timeout}ms`));
        return;
      }

      if (code === 0) {
        onLog?.(`[pythonRunner] ${script} completed successfully`);
        resolve();
      } else {
        const errorMsg = `Python script ${script} exited with code ${code}`;
        onLog?.(`[pythonRunner] ${errorMsg}`);
        reject(new Error(errorMsg));
      }
    });

    // Handle process error
    child.on("error", (err: any) => {
      clearTimeout(timeoutHandle);
      
      // Provide helpful error message for common issues
      if (err.code === "ENOENT") {
        const isWindows = platform() === "win32";
        const setupCommand = isWindows
          ? "cd python_pipeline && python -m venv .venv && .venv\\Scripts\\python -m pip install -r requirements.txt"
          : "cd python_pipeline && python3 -m venv .venv && .venv/bin/python -m pip install -r requirements.txt";
        
        const helpMessage = 
          `Python executable not found (ENOENT).\n\n` +
          `To set up the Python environment, run:\n\n  ${setupCommand}\n\n` +
          `Then ensure these files exist:\n` +
          (isWindows
            ? "  - python_pipeline\\.venv\\Scripts\\python.exe\n  - python_pipeline\\requirements.txt"
            : "  - python_pipeline/.venv/bin/python\n  - python_pipeline/requirements.txt");
        
        onLog?.(`[pythonRunner] ERROR: ${helpMessage}`);
        reject(new Error(helpMessage));
      } else {
        onLog?.(`[pythonRunner] Error spawning process: ${err.message}`);
        reject(err);
      }
    });
  });
}

/**
 * Runs a sequence of Python scripts in order
 * Stops and rejects if any script fails
 */
export async function runPythonPipeline(
  scripts: string[],
  options: Omit<PythonRunnerOptions, "script">
): Promise<void> {
  for (const script of scripts) {
    await runPythonScript({ ...options, script });
  }
}
