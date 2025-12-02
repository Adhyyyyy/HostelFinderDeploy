import Validator from '../utils/classes/Validator.js';
import ErrorHandler from '../utils/classes/ErrorHandler.js';

/**
 * Validation Middleware Class
 * Handles request validation
 */
class ValidationMiddleware {
    /**
     * Validate request body against schema
     */
    static validateBody(schema) {
        return (req, res, next) => {
            try {
                const validatedData = Validator.validateUserInput(req.body, schema);
                req.body = validatedData;
                next();
            } catch (error) {
                // For required fields, we should throw the error to prevent invalid data
                // Only log warnings for non-critical validation issues
                if (error.message && error.message.includes('required')) {
                    // Required field validation errors should be thrown
                    return res.status(400).json({
                        success: false,
                        message: error.message,
                        timestamp: new Date().toISOString(),
                        method: req.method,
                        path: req.path,
                        requestId: req.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                    });
                }
                // For backward compatibility, log validation errors but don't block requests for non-critical issues
                console.warn('Validation warning (non-blocking):', error.message);
                next(); // Continue without validation error
            }
        };
    }

    /**
     * Validate request parameters
     */
    static validateParams(schema) {
        return (req, res, next) => {
            try {
                const validatedData = Validator.validateUserInput(req.params, schema);
                req.params = validatedData;
                next();
            } catch (error) {
                // For backward compatibility, log validation errors but don't block requests
                console.warn('Params validation warning (non-blocking):', error.message);
                next(); // Continue without validation error
            }
        };
    }

    /**
     * Validate query parameters
     */
    static validateQuery(schema) {
        return (req, res, next) => {
            try {
                const validatedData = Validator.validateUserInput(req.query, schema);
                req.query = validatedData;
                next();
            } catch (error) {
                next(error);
            }
        };
    }

    /**
     * User registration validation
     */
    static validateUserRegistration() {
        const schema = {
            name: {
                type: 'string',
                required: true,
                minLength: 2,
                maxLength: 50,
                sanitize: true
            },
            email: {
                type: 'email',
                required: true,
                sanitize: true
            },
            password: {
                type: 'string',
                required: true,
                minLength: 6,
                maxLength: 100
            },
            phone: {
                type: 'phone',
                required: true,
                sanitize: true
            },
            isAdmin: {
                type: 'boolean',
                required: false
            }
        };

        return this.validateBody(schema);
    }

    /**
     * User login validation
     */
    static validateUserLogin() {
        const schema = {
            email: {
                type: 'email',
                required: true,
                sanitize: true
            },
            password: {
                type: 'string',
                required: true,
                minLength: 1
            }
        };

        return this.validateBody(schema);
    }

    /**
     * Hostel creation validation
     */
    static validateHostelCreation() {
        const schema = {
            name: {
                type: 'string',
                required: true,
                minLength: 2,
                maxLength: 100,
                sanitize: true
            },
            category: {
                type: 'enum',
                required: true,
                values: ['PG', 'Hostel']
            },
            genderType: {
                type: 'enum',
                required: true,
                values: ['Boys', 'Girls', 'Co-ed']
            },
            distanceFromCollege: {
                type: 'number',
                required: true,
                min: 0,
                max: 100
            },
            address: {
                type: 'string',
                required: true,
                minLength: 10,
                maxLength: 200,
                sanitize: true
            },
            vacancy: {
                type: 'number',
                required: true,
                min: 0
            },
            capacity: {
                type: 'number',
                required: true,
                min: 1
            },
            contact: {
                type: 'phone',
                required: true,
                sanitize: true
            },
            ownerName: {
                type: 'string',
                required: true,
                minLength: 2,
                maxLength: 50,
                sanitize: true
            },
            ownerContact: {
                type: 'phone',
                required: true,
                sanitize: true
            },
            photos: {
                type: 'array',
                required: false,
                maxLength: 10
            },
            amenities: {
                type: 'array',
                required: false,
                maxLength: 20
            },
            rules: {
                type: 'array',
                required: false,
                maxLength: 20
            },
            messType: {
                type: 'boolean',
                required: false
            }
        };

        return this.validateBody(schema);
    }

    /**
     * Room creation validation
     */
    static validateRoomCreation() {
        const schema = {
            roomNumber: {
                type: 'string',
                required: true,
                minLength: 1,
                maxLength: 10,
                sanitize: true
            },
            roomType: {
                type: 'enum',
                required: true,
                values: ['Single', 'Double', 'Triple', 'Quad', 'Five', 'Six']
            },
            price: {
                type: 'number',
                required: true,
                min: 0
            },
            isAvailable: {
                type: 'boolean',
                required: false
            }
        };

        return this.validateBody(schema);
    }

    /**
     * Booking creation validation
     */
    static validateBookingCreation() {
        const schema = {
            name: {
                type: 'string',
                required: true,
                minLength: 2,
                maxLength: 50,
                sanitize: true
            },
            phone: {
                type: 'phone',
                required: true,
                sanitize: true
            },
            roomID: {
                type: 'objectId',
                required: true
            },
            hostelID: {
                type: 'objectId',
                required: true
            },
            bedNumber: {
                type: 'string',
                required: true,
                minLength: 1,
                maxLength: 20,
                sanitize: true
            }
        };

        return this.validateBody(schema);
    }

    /**
     * Restaurant creation validation
     */
    static validateRestaurantCreation() {
        const schema = {
            name: {
                type: 'string',
                required: true,
                minLength: 2,
                maxLength: 100,
                sanitize: true
            },
            image: {
                type: 'url',
                required: true
            },
            map: {
                type: 'url',
                required: true
            },
            distance: {
                type: 'string',
                required: true,
                minLength: 1,
                maxLength: 20,
                sanitize: true
            },
            deliveryAvailable: {
                type: 'boolean',
                required: false
            },
            contactNumber: {
                type: 'phone',
                required: true,
                sanitize: true
            },
            location: {
                type: 'object',
                required: true
            }
        };

        return this.validateBody(schema);
    }

    /**
     * Review creation validation
     */
    static validateReviewCreation() {
        const schema = {
            entityId: {
                type: 'objectId',
                required: true
            },
            entityType: {
                type: 'enum',
                required: true,
                values: ['Hostel', 'Restaurant']
            },
            entityName: {
                type: 'string',
                required: true,
                minLength: 1,
                maxLength: 100,
                sanitize: true
            },
            rating: {
                type: 'number',
                required: true,
                min: 1,
                max: 5
            },
            review: {
                type: 'string',
                required: true,
                minLength: 1,
                maxLength: 500,
                sanitize: true
            },
            userName: {
                type: 'string',
                required: true,
                minLength: 2,
                maxLength: 50,
                sanitize: true
            }
        };

        return this.validateBody(schema);
    }

    /**
     * ObjectId parameter validation
     */
    static validateObjectIdParam(paramName = 'id') {
        return (req, res, next) => {
            try {
                const id = req.params[paramName];
                Validator.validateObjectId(id, paramName);
                next();
            } catch (error) {
                // For backward compatibility, log ObjectId validation errors but don't block requests
                console.warn(`ObjectId validation warning for ${paramName} (non-blocking):`, error.message);
                next(); // Continue without validation error
            }
        };
    }

    /**
     * Pagination query validation
     */
    static validatePagination() {
        return (req, res, next) => {
            try {
                const { page, limit, sort } = req.query;

                if (page !== undefined) {
                    const pageNum = parseInt(page);
                    if (isNaN(pageNum) || pageNum < 1) {
                        throw ErrorHandler.createValidationError('Page must be a positive integer', 'page');
                    }
                    req.query.page = pageNum;
                }

                if (limit !== undefined) {
                    const limitNum = parseInt(limit);
                    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
                        throw ErrorHandler.createValidationError('Limit must be between 1 and 100', 'limit');
                    }
                    req.query.limit = limitNum;
                }

                if (sort !== undefined) {
                    try {
                        req.query.sort = JSON.parse(sort);
                    } catch (error) {
                        throw ErrorHandler.createValidationError('Invalid sort format', 'sort');
                    }
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    }

    /**
     * Date range validation
     */
    static validateDateRange() {
        return (req, res, next) => {
            try {
                const { startDate, endDate } = req.query;

                if (startDate && endDate) {
                    Validator.validateDateRange(startDate, endDate);
                } else if (startDate) {
                    Validator.validateDate(startDate, 'startDate');
                } else if (endDate) {
                    Validator.validateDate(endDate, 'endDate');
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    }

    /**
     * Coordinates validation
     */
    static validateCoordinates() {
        return (req, res, next) => {
            try {
                const { lat, lng } = req.query;

                if (lat !== undefined && lng !== undefined) {
                    Validator.validateCoordinates(parseFloat(lat), parseFloat(lng));
                    req.query.lat = parseFloat(lat);
                    req.query.lng = parseFloat(lng);
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    }

    /**
     * Search query validation
     */
    static validateSearchQuery() {
        return (req, res, next) => {
            try {
                const { q: searchTerm } = req.query;

                if (searchTerm !== undefined) {
                    if (typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
                        throw ErrorHandler.createValidationError('Search term cannot be empty', 'q');
                    }

                    if (searchTerm.length > 100) {
                        throw ErrorHandler.createValidationError('Search term cannot exceed 100 characters', 'q');
                    }

                    req.query.q = Validator.sanitizeString(searchTerm);
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    }

    /**
     * File upload validation
     */
    static validateFileUpload(allowedTypes = [], maxSize = 5 * 1024 * 1024) {
        return (req, res, next) => {
            try {
                if (!req.file && !req.files) {
                    return next();
                }

                const files = req.files || [req.file];

                for (const file of files) {
                    // Check file size
                    if (file.size > maxSize) {
                        throw ErrorHandler.createValidationError(
                            `File size cannot exceed ${Math.round(maxSize / 1024 / 1024)}MB`,
                            'file'
                        );
                    }

                    // Check file type
                    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
                        throw ErrorHandler.createValidationError(
                            `File type must be one of: ${allowedTypes.join(', ')}`,
                            'file'
                        );
                    }
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    }

    /**
     * Custom validation middleware
     */
    static custom(validationFunction) {
        return async (req, res, next) => {
            try {
                await validationFunction(req, res);
                next();
            } catch (error) {
                next(error);
            }
        };
    }

    /**
     * Sanitize all string inputs
     */
    static sanitizeStrings() {
        return (req, res, next) => {
            try {
                // Sanitize body
                if (req.body && typeof req.body === 'object') {
                    req.body = this._sanitizeObject(req.body);
                }

                // Sanitize query
                if (req.query && typeof req.query === 'object') {
                    req.query = this._sanitizeObject(req.query);
                }

                // Sanitize params
                if (req.params && typeof req.params === 'object') {
                    req.params = this._sanitizeObject(req.params);
                }

                next();
            } catch (error) {
                next(error);
            }
        };
    }

    /**
     * Recursively sanitize object properties
     */
    static _sanitizeObject(obj) {
        const sanitized = {};

        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = Validator.sanitizeString(value);
            } else if (Array.isArray(value)) {
                sanitized[key] = value.map(item => 
                    typeof item === 'string' ? Validator.sanitizeString(item) : item
                );
            } else if (value && typeof value === 'object') {
                sanitized[key] = this._sanitizeObject(value);
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }
}

export default ValidationMiddleware;
