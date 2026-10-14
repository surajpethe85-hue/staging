import fs from "fs";
import path from "path";
import { createLogger, format, transports, addColors } from "winston";
import env from "../config/env.config.js";

const { combine, timestamp, printf, colorize, errors } = format;

const LEVELS = {
  error: 0,
  fail: 1,
  warn: 2,
  pass: 3,
  info: 4,
  debug: 5,
};

const COLORS = {
  error: "bold red",
  fail: "bold white redBG",
  warn: "bold yellow",
  pass: "bold black greenBG",
  info: "cyan",
  debug: "gray",
};

const SYMBOLS = {
  error: "✖",
  fail: "✗",
  warn: "⚠",
  pass: "✓",
  info: "ℹ",
  debug: "🐛",
};

class Logger {
  constructor({ level = "info", logDir = "logs" } = {}) {
    this.logDir = path.resolve(logDir);
    this._ensureLogDir();

    addColors(COLORS);

    this._logger = createLogger({
      levels: LEVELS,
      level,
      transports: [
        new transports.Console({ format: this._format(true) }),
        new transports.File({
          filename: path.join(this.logDir, "test-execution.log"),
          format: this._format(false),
        }),
        new transports.File({
          filename: path.join(this.logDir, "error.log"),
          level: "fail",
          format: this._format(false),
        }),
      ],
    });
  }

  _ensureLogDir() {
    fs.mkdirSync(this.logDir, { recursive: true });
  }

  _lineFormat() {
    return printf(({ level, message, timestamp: ts, stack }) => {
      const symbol = SYMBOLS[level] || "•";
      const text = stack || message;
      return `${ts} ${symbol} [${level.toUpperCase()}] ${text}`;
    });
  }

  _format(withColor) {
    return combine(
      errors({ stack: true }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      this._lineFormat(),
      ...(withColor ? [colorize({ all: true })] : []),
    );
  }

  error(message) {
    this._logger.error(message);
    return this;
  }

  fail(message) {
    this._logger.fail(message);
    return this;
  }

  warn(message) {
    this._logger.warn(message);
    return this;
  }

  pass(message) {
    this._logger.pass(message);
    return this;
  }

  info(message) {
    this._logger.info(message);
    return this;
  }

  debug(message) {
    this._logger.debug(message);
    return this;
  }
}

const logger = new Logger({ level: env.logLevel || "info", logDir: "logs" });

class LogReporter {
  onTestEnd(test, result) {
    if (result.status === "skipped") {
      logger.info(`Test skipped: ${test.title}`);
      return;
    }

    if (result.status === test.expectedStatus) {
      logger.pass(`Test passed: ${test.title}`);
      return;
    }

    logger.fail(`Test failed: ${test.title}`);
  }
}

export { Logger, logger };
export default LogReporter;
