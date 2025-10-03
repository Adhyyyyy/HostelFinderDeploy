import Logger from '../utils/classes/Logger.js';

/**
 * Logging Middleware Class
 * Handles request/response logging and monitoring
 */
class LoggingMiddleware {
    constructor() {
        this.logger = Logger;
    }

    /**
     * Request logging middleware
     */
    requestLogger = (req, res, next) => {
        const startTime = Date.now();
        
        // Generate unique request ID
        req.requestId = this._generateRequestId();
        
        // Log incoming request
        this.logger.http('Incoming request', {
            requestId: req.requestId,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            contentType: req.get('Content-Type'),
            contentLength: req.get('Content-Length'),
            userId: req.user?.id,
            timestamp: new Date().toISOString()
        });

        // Override res.end to capture response
        const originalEnd = res.end;
        res.end = function(chunk, encoding) {
            const responseTime = Date.now() - startTime;
            
            // Log response
            Logger.http('Request completed', {
                requestId: req.requestId,
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                responseTime: `${responseTime}ms`,
                contentLength: res.get('Content-Length'),
                userId: req.user?.id
            });

            // Call original end method
            originalEnd.call(this, chunk, encoding);
        };

        next();
    };

    /**
     * Error logging middleware
     */
    errorLogger = (err, req, res, next) => {
        this.logger.logError(err, req);
        next(err);
    };

    /**
     * Performance monitoring middleware
     */
    performanceMonitor = (req, res, next) => {
        const startTime = process.hrtime.bigint();
        
        res.on('finish', () => {
            const endTime = process.hrtime.bigint();
            const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
            
            // Log slow requests
            if (duration > 1000) {
                this.logger.warn('Slow request detected', {
                    requestId: req.requestId,
                    method: req.method,
                    url: req.originalUrl,
                    duration: `${duration.toFixed(2)}ms`,
                    statusCode: res.statusCode,
                    userId: req.user?.id
                });
            }

            // Log performance metrics
            this.logger.logPerformance(`${req.method} ${req.originalUrl}`, duration, {
                requestId: req.requestId,
                statusCode: res.statusCode,
                userId: req.user?.id
            });
        });

        next();
    };

    /**
     * Database operation logging middleware
     */
    databaseLogger = (operation, collection) => {
        return (req, res, next) => {
            const startTime = Date.now();
            
            // Override res.json to capture result
            const originalJson = res.json;
            res.json = function(data) {
                const duration = Date.now() - startTime;
                
                Logger.logDatabaseOperation(operation, collection, req.query, data);
                
                if (duration > 500) {
                    Logger.warn('Slow database operation', {
                        operation,
                        collection,
                        duration: `${duration}ms`,
                        requestId: req.requestId
                    });
                }

                return originalJson.call(this, data);
            };

            next();
        };
    };

    /**
     * Authentication event logging
     */
    authLogger = (req, res, next) => {
        // Log authentication attempts
        if (req.path.includes('/login')) {
            this.logger.logAuthEvent('login_attempt', null, {
                email: req.body?.email,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                requestId: req.requestId
            });
        }

        if (req.path.includes('/register')) {
            this.logger.logAuthEvent('registration_attempt', null, {
                email: req.body?.email,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                requestId: req.requestId
            });
        }

        // Override res.json to log successful auth
        const originalJson = res.json;
        res.json = function(data) {
            if (res.statusCode === 200 && req.path.includes('/login')) {
                Logger.logAuthEvent('login_success', data.details?.id || data.data?.id, {
                    email: data.details?.email || data.data?.email,
                    ip: req.ip,
                    requestId: req.requestId
                });
            }

            if (res.statusCode === 201 && req.path.includes('/register')) {
                Logger.logAuthEvent('registration_success', data.user?.id || data.data?.id, {
                    email: data.user?.email || data.data?.email,
                    ip: req.ip,
                    requestId: req.requestId
                });
            }

            return originalJson.call(this, data);
        };

        next();
    };

    /**
     * Security event logging
     */
    securityLogger = (req, res, next) => {
        // Log suspicious activities
        const suspiciousPatterns = [
            /\.\.\//,  // Path traversal
            /<script/i, // XSS attempts
            /union.*select/i, // SQL injection
            /javascript:/i, // JavaScript protocol
            /eval\(/i, // Code execution
            /system\(/i, // System calls
        ];

        const requestData = JSON.stringify({
            url: req.originalUrl,
            body: req.body,
            query: req.query,
            headers: req.headers
        });

        for (const pattern of suspiciousPatterns) {
            if (pattern.test(requestData)) {
                this.logger.warn('Suspicious request detected', {
                    pattern: pattern.toString(),
                    method: req.method,
                    url: req.originalUrl,
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    body: req.body,
                    query: req.query,
                    requestId: req.requestId
                });
                break;
            }
        }

        next();
    };

    /**
     * API usage logging
     */
    apiUsageLogger = (req, res, next) => {
        const originalJson = res.json;
        
        res.json = function(data) {
            // Log API endpoint usage
            Logger.info('API endpoint accessed', {
                endpoint: `${req.method} ${req.route?.path || req.originalUrl}`,
                statusCode: res.statusCode,
                userId: req.user?.id,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                requestId: req.requestId,
                responseSize: JSON.stringify(data).length
            });

            return originalJson.call(this, data);
        };

        next();
    };

    /**
     * Rate limiting logging
     */
    rateLimitLogger = (req, res, next) => {
        // Log rate limit hits
        res.on('finish', () => {
            if (res.statusCode === 429) {
                this.logger.warn('Rate limit exceeded', {
                    ip: req.ip,
                    endpoint: req.originalUrl,
                    method: req.method,
                    userAgent: req.get('User-Agent'),
                    userId: req.user?.id,
                    requestId: req.requestId
                });
            }
        });

        next();
    };

    /**
     * File upload logging
     */
    fileUploadLogger = (req, res, next) => {
        if (req.file || req.files) {
            const files = req.files || [req.file];
            
            this.logger.info('File upload attempt', {
                fileCount: files.length,
                files: files.map(file => ({
                    originalName: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size
                })),
                userId: req.user?.id,
                ip: req.ip,
                requestId: req.requestId
            });
        }

        next();
    };

    /**
     * Generate unique request ID
     */
    _generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Create comprehensive logging middleware chain
     */
    createLoggingChain() {
        return [
            this.requestLogger,
            this.performanceMonitor,
            this.securityLogger,
            this.authLogger,
            this.apiUsageLogger,
            this.rateLimitLogger,
            this.fileUploadLogger
        ];
    }

    /**
     * Custom logger for specific routes
     */
    customLogger = (logData) => {
        return (req, res, next) => {
            this.logger.info('Custom log', {
                ...logData,
                requestId: req.requestId,
                userId: req.user?.id,
                timestamp: new Date().toISOString()
            });
            next();
        };
    };

    /**
     * Conditional logging based on environment
     */
    conditionalLogger = (condition, logLevel = 'info') => {
        return (req, res, next) => {
            if (condition(req, res)) {
                this.logger[logLevel]('Conditional log triggered', {
                    method: req.method,
                    url: req.originalUrl,
                    requestId: req.requestId,
                    userId: req.user?.id
                });
            }
            next();
        };
    };

    /**
     * Batch logging for multiple operations
     */
    batchLogger = (operations) => {
        return (req, res, next) => {
            const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            this.logger.info('Batch operation started', {
                batchId,
                operations: operations.length,
                requestId: req.requestId,
                userId: req.user?.id
            });

            // Store batch ID for later use
            req.batchId = batchId;
            
            next();
        };
    };

    /**
     * Log response data (be careful with sensitive data)
     */
    responseDataLogger = (includeBody = false) => {
        return (req, res, next) => {
            const originalJson = res.json;
            
            res.json = function(data) {
                const logData = {
                    statusCode: res.statusCode,
                    requestId: req.requestId,
                    userId: req.user?.id,
                    responseTime: res.get('X-Response-Time')
                };

                if (includeBody && data) {
                    // Be careful not to log sensitive information
                    logData.responseBody = typeof data === 'object' ? 
                        JSON.stringify(data).substring(0, 1000) : data;
                }

                Logger.debug('Response sent', logData);
                
                return originalJson.call(this, data);
            };

            next();
        };
    };
}

export default LoggingMiddleware;
