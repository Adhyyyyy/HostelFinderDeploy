import fs from 'fs';
import path from 'path';

/**
 * Logger Class
 * Handles application logging with different levels and outputs
 */
class Logger {
    constructor(options = {}) {
        this.logLevel = options.logLevel || process.env.LOG_LEVEL || 'info';
        this.logToFile = options.logToFile !== false; // Default to true
        this.logToConsole = options.logToConsole !== false; // Default to true
        this.logDirectory = options.logDirectory || 'logs';
        this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
        this.maxFiles = options.maxFiles || 5;

        // Log levels with priorities
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            http: 3,
            debug: 4
        };

        // Colors for console output
        this.colors = {
            error: '\x1b[31m', // Red
            warn: '\x1b[33m',  // Yellow
            info: '\x1b[36m',  // Cyan
            http: '\x1b[35m',  // Magenta
            debug: '\x1b[32m', // Green
            reset: '\x1b[0m'   // Reset
        };

        // Create logs directory if it doesn't exist
        if (this.logToFile) {
            this.ensureLogDirectory();
        }
    }

    /**
     * Ensure log directory exists
     */
    ensureLogDirectory() {
        if (!fs.existsSync(this.logDirectory)) {
            fs.mkdirSync(this.logDirectory, { recursive: true });
        }
    }

    /**
     * Check if message should be logged based on level
     */
    shouldLog(level) {
        return this.levels[level] <= this.levels[this.logLevel];
    }

    /**
     * Format log message
     */
    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...meta
        };

        return logEntry;
    }

    /**
     * Format message for console output
     */
    formatConsoleMessage(logEntry) {
        const color = this.colors[logEntry.level.toLowerCase()] || '';
        const reset = this.colors.reset;
        
        let output = `${color}[${logEntry.timestamp}] ${logEntry.level}:${reset} ${logEntry.message}`;
        
        // Add metadata if present
        const { timestamp, level, message, ...meta } = logEntry;
        if (Object.keys(meta).length > 0) {
            output += `\n${JSON.stringify(meta, null, 2)}`;
        }

        return output;
    }

    /**
     * Write to log file
     */
    writeToFile(level, logEntry) {
        if (!this.logToFile) return;

        const fileName = `${level}.log`;
        const filePath = path.join(this.logDirectory, fileName);
        const logLine = JSON.stringify(logEntry) + '\n';

        try {
            // Check file size and rotate if necessary
            if (fs.existsSync(filePath)) {
                const stats = fs.statSync(filePath);
                if (stats.size > this.maxFileSize) {
                    this.rotateLogFile(filePath);
                }
            }

            fs.appendFileSync(filePath, logLine);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    /**
     * Rotate log file when it gets too large
     */
    rotateLogFile(filePath) {
        try {
            const dir = path.dirname(filePath);
            const baseName = path.basename(filePath, '.log');
            
            // Remove oldest log file if we have too many
            const oldestFile = path.join(dir, `${baseName}.${this.maxFiles}.log`);
            if (fs.existsSync(oldestFile)) {
                fs.unlinkSync(oldestFile);
            }

            // Rotate existing files
            for (let i = this.maxFiles - 1; i >= 1; i--) {
                const currentFile = path.join(dir, `${baseName}.${i}.log`);
                const nextFile = path.join(dir, `${baseName}.${i + 1}.log`);
                
                if (fs.existsSync(currentFile)) {
                    fs.renameSync(currentFile, nextFile);
                }
            }

            // Move current file to .1
            const firstRotatedFile = path.join(dir, `${baseName}.1.log`);
            fs.renameSync(filePath, firstRotatedFile);
        } catch (error) {
            console.error('Failed to rotate log file:', error);
        }
    }

    /**
     * Core logging method
     */
    log(level, message, meta = {}) {
        if (!this.shouldLog(level)) {
            return;
        }

        const logEntry = this.formatMessage(level, message, meta);

        // Log to console
        if (this.logToConsole) {
            const consoleMessage = this.formatConsoleMessage(logEntry);
            console.log(consoleMessage);
        }

        // Log to file
        this.writeToFile(level, logEntry);
    }

    /**
     * Error logging
     */
    error(message, meta = {}) {
        this.log('error', message, meta);
    }

    /**
     * Warning logging
     */
    warn(message, meta = {}) {
        this.log('warn', message, meta);
    }

    /**
     * Info logging
     */
    info(message, meta = {}) {
        this.log('info', message, meta);
    }

    /**
     * HTTP request logging
     */
    http(message, meta = {}) {
        this.log('http', message, meta);
    }

    /**
     * Debug logging
     */
    debug(message, meta = {}) {
        this.log('debug', message, meta);
    }

    /**
     * Log HTTP request
     */
    logRequest(req, res, responseTime) {
        const logData = {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: `${responseTime}ms`,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
            userId: req.user?.id
        };

        const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`;
        this.http(message, logData);
    }

    /**
     * Log error with stack trace
     */
    logError(error, req = null) {
        const errorData = {
            name: error.name,
            message: error.message,
            stack: error.stack,
            status: error.status || error.statusCode
        };

        if (req) {
            errorData.request = {
                method: req.method,
                url: req.originalUrl,
                headers: req.headers,
                body: req.body,
                params: req.params,
                query: req.query,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                userId: req.user?.id
            };
        }

        this.error(error.message, errorData);
    }

    /**
     * Log database operation
     */
    logDatabaseOperation(operation, collection, query = {}, result = null) {
        const logData = {
            operation,
            collection,
            query,
            resultCount: result?.length || (result ? 1 : 0)
        };

        this.debug(`Database ${operation} on ${collection}`, logData);
    }

    /**
     * Log authentication event
     */
    logAuthEvent(event, userId, details = {}) {
        const logData = {
            event,
            userId,
            ...details
        };

        this.info(`Auth event: ${event}`, logData);
    }

    /**
     * Log performance metrics
     */
    logPerformance(operation, duration, details = {}) {
        const logData = {
            operation,
            duration: `${duration}ms`,
            ...details
        };

        if (duration > 1000) {
            this.warn(`Slow operation: ${operation}`, logData);
        } else {
            this.debug(`Performance: ${operation}`, logData);
        }
    }

    /**
     * Create child logger with additional context
     */
    child(context = {}) {
        const childLogger = new Logger({
            logLevel: this.logLevel,
            logToFile: this.logToFile,
            logToConsole: this.logToConsole,
            logDirectory: this.logDirectory
        });

        // Override log method to include context
        const originalLog = childLogger.log.bind(childLogger);
        childLogger.log = (level, message, meta = {}) => {
            originalLog(level, message, { ...context, ...meta });
        };

        return childLogger;
    }

    /**
     * Get log statistics
     */
    getLogStats() {
        const stats = {};
        
        if (!this.logToFile) {
            return { message: 'File logging is disabled' };
        }

        try {
            const files = fs.readdirSync(this.logDirectory);
            
            for (const file of files) {
                if (file.endsWith('.log')) {
                    const filePath = path.join(this.logDirectory, file);
                    const stat = fs.statSync(filePath);
                    
                    stats[file] = {
                        size: stat.size,
                        modified: stat.mtime,
                        lines: this.countLines(filePath)
                    };
                }
            }
        } catch (error) {
            this.error('Failed to get log stats', { error: error.message });
        }

        return stats;
    }

    /**
     * Count lines in log file
     */
    countLines(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return content.split('\n').length - 1;
        } catch (error) {
            return 0;
        }
    }
}

// Create default logger instance
const logger = new Logger();

export default logger;
export { Logger };
