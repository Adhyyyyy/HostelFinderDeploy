import ErrorHandler from './ErrorHandler.js';

/**
 * Validator Class
 * Handles input validation and sanitization
 */
class Validator {
    /**
     * Validate required fields
     */
    static validateRequired(data, requiredFields) {
        const missing = [];
        
        for (const field of requiredFields) {
            if (data[field] === undefined || data[field] === null || data[field] === '') {
                missing.push(field);
            }
        }

        if (missing.length > 0) {
            throw ErrorHandler.createValidationError(
                `Missing required fields: ${missing.join(', ')}`,
                missing[0]
            );
        }

        return true;
    }

    /**
     * Validate email format
     */
    static validateEmail(email) {
        if (!email) {
            throw ErrorHandler.createValidationError('Email is required', 'email');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            throw ErrorHandler.createValidationError('Invalid email format', 'email');
        }

        return true;
    }

    /**
     * Validate password strength
     */
    static validatePassword(password, minLength = 6) {
        if (!password) {
            throw ErrorHandler.createValidationError('Password is required', 'password');
        }

        if (password.length < minLength) {
            throw ErrorHandler.createValidationError(
                `Password must be at least ${minLength} characters long`,
                'password'
            );
        }

        // Optional: Add more password strength requirements
        // const hasUpperCase = /[A-Z]/.test(password);
        // const hasLowerCase = /[a-z]/.test(password);
        // const hasNumbers = /\d/.test(password);
        // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return true;
    }

    /**
     * Validate phone number
     */
    static validatePhone(phone) {
        if (!phone) {
            throw ErrorHandler.createValidationError('Phone number is required', 'phone');
        }

        // Remove spaces and special characters for validation
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;

        if (!phoneRegex.test(cleanPhone)) {
            throw ErrorHandler.createValidationError('Invalid phone number format', 'phone');
        }

        return true;
    }

    /**
     * Validate MongoDB ObjectId
     */
    static validateObjectId(id, fieldName = 'id') {
        if (!id) {
            throw ErrorHandler.createValidationError(`${fieldName} is required`, fieldName);
        }

        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        
        if (!objectIdRegex.test(id)) {
            throw ErrorHandler.createValidationError(`Invalid ${fieldName} format`, fieldName);
        }

        return true;
    }

    /**
     * Validate string length
     */
    static validateStringLength(value, fieldName, minLength = 0, maxLength = Infinity) {
        if (!value && minLength > 0) {
            throw ErrorHandler.createValidationError(`${fieldName} is required`, fieldName);
        }

        if (value && typeof value !== 'string') {
            throw ErrorHandler.createValidationError(`${fieldName} must be a string`, fieldName);
        }

        if (value && value.length < minLength) {
            throw ErrorHandler.createValidationError(
                `${fieldName} must be at least ${minLength} characters long`,
                fieldName
            );
        }

        if (value && value.length > maxLength) {
            throw ErrorHandler.createValidationError(
                `${fieldName} cannot exceed ${maxLength} characters`,
                fieldName
            );
        }

        return true;
    }

    /**
     * Validate number range
     */
    static validateNumberRange(value, fieldName, min = -Infinity, max = Infinity) {
        if (value === undefined || value === null) {
            throw ErrorHandler.createValidationError(`${fieldName} is required`, fieldName);
        }

        if (typeof value !== 'number' || isNaN(value)) {
            throw ErrorHandler.createValidationError(`${fieldName} must be a valid number`, fieldName);
        }

        if (value < min) {
            throw ErrorHandler.createValidationError(
                `${fieldName} must be at least ${min}`,
                fieldName
            );
        }

        if (value > max) {
            throw ErrorHandler.createValidationError(
                `${fieldName} cannot exceed ${max}`,
                fieldName
            );
        }

        return true;
    }

    /**
     * Validate boolean value
     */
    static validateBoolean(value, fieldName) {
        if (value === undefined || value === null) {
            throw ErrorHandler.createValidationError(`${fieldName} is required`, fieldName);
        }

        if (typeof value !== 'boolean') {
            throw ErrorHandler.createValidationError(`${fieldName} must be a boolean value`, fieldName);
        }

        return true;
    }

    /**
     * Validate array
     */
    static validateArray(value, fieldName, minLength = 0, maxLength = Infinity) {
        if (!value && minLength > 0) {
            throw ErrorHandler.createValidationError(`${fieldName} is required`, fieldName);
        }

        if (value && !Array.isArray(value)) {
            throw ErrorHandler.createValidationError(`${fieldName} must be an array`, fieldName);
        }

        if (value && value.length < minLength) {
            throw ErrorHandler.createValidationError(
                `${fieldName} must contain at least ${minLength} items`,
                fieldName
            );
        }

        if (value && value.length > maxLength) {
            throw ErrorHandler.createValidationError(
                `${fieldName} cannot contain more than ${maxLength} items`,
                fieldName
            );
        }

        return true;
    }

    /**
     * Validate enum values
     */
    static validateEnum(value, fieldName, allowedValues) {
        if (!value) {
            throw ErrorHandler.createValidationError(`${fieldName} is required`, fieldName);
        }

        if (!allowedValues.includes(value)) {
            throw ErrorHandler.createValidationError(
                `${fieldName} must be one of: ${allowedValues.join(', ')}`,
                fieldName
            );
        }

        return true;
    }

    /**
     * Validate URL format
     */
    static validateURL(url, fieldName = 'url') {
        if (!url) {
            throw ErrorHandler.createValidationError(`${fieldName} is required`, fieldName);
        }

        try {
            new URL(url);
            return true;
        } catch (error) {
            throw ErrorHandler.createValidationError(`Invalid ${fieldName} format`, fieldName);
        }
    }

    /**
     * Validate coordinates (latitude, longitude)
     */
    static validateCoordinates(lat, lng) {
        if (lat === undefined || lat === null) {
            throw ErrorHandler.createValidationError('Latitude is required', 'latitude');
        }

        if (lng === undefined || lng === null) {
            throw ErrorHandler.createValidationError('Longitude is required', 'longitude');
        }

        if (typeof lat !== 'number' || typeof lng !== 'number') {
            throw ErrorHandler.createValidationError('Coordinates must be numbers');
        }

        if (Math.abs(lat) > 90) {
            throw ErrorHandler.createValidationError(
                'Latitude must be between -90 and 90 degrees',
                'latitude'
            );
        }

        if (Math.abs(lng) > 180) {
            throw ErrorHandler.createValidationError(
                'Longitude must be between -180 and 180 degrees',
                'longitude'
            );
        }

        return true;
    }

    /**
     * Validate date
     */
    static validateDate(date, fieldName = 'date') {
        if (!date) {
            throw ErrorHandler.createValidationError(`${fieldName} is required`, fieldName);
        }

        const dateObj = new Date(date);
        
        if (isNaN(dateObj.getTime())) {
            throw ErrorHandler.createValidationError(`Invalid ${fieldName} format`, fieldName);
        }

        return true;
    }

    /**
     * Validate date range
     */
    static validateDateRange(startDate, endDate) {
        this.validateDate(startDate, 'startDate');
        this.validateDate(endDate, 'endDate');

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            throw ErrorHandler.createValidationError('Start date must be before end date');
        }

        return true;
    }

    /**
     * Sanitize string input
     */
    static sanitizeString(value) {
        if (typeof value !== 'string') {
            return value;
        }

        return value
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, ''); // Remove event handlers
    }

    /**
     * Sanitize email
     */
    static sanitizeEmail(email) {
        if (typeof email !== 'string') {
            return email;
        }

        return email.toLowerCase().trim();
    }

    /**
     * Sanitize phone number
     */
    static sanitizePhone(phone) {
        if (typeof phone !== 'string') {
            return phone;
        }

        // Keep only digits, plus sign, and common separators
        return phone.replace(/[^\d\+\-\(\)\s]/g, '').trim();
    }

    /**
     * Validate and sanitize user input
     */
    static validateUserInput(data, rules) {
        const sanitized = {};
        const errors = [];

        for (const [field, rule] of Object.entries(rules)) {
            try {
                let value = data[field];

                // Apply sanitization if specified
                if (rule.sanitize) {
                    if (rule.type === 'email') {
                        value = this.sanitizeEmail(value);
                    } else if (rule.type === 'phone') {
                        value = this.sanitizePhone(value);
                    } else if (rule.type === 'string') {
                        value = this.sanitizeString(value);
                    }
                }

                // Apply validation rules
                if (rule.required) {
                    if (rule.type === 'boolean') {
                        // For boolean fields, only check if they are undefined or null
                        if (value === undefined || value === null) {
                            errors.push(`${field} is required`);
                            continue;
                        }
                    } else {
                        // For other types, also check for empty strings
                        if (value === undefined || value === null || value === '') {
                            errors.push(`${field} is required`);
                            continue;
                        }
                    }
                }

                if (value !== undefined && value !== null && value !== '') {
                    if (rule.type === 'email') {
                        this.validateEmail(value);
                    } else if (rule.type === 'phone') {
                        this.validatePhone(value);
                    } else if (rule.type === 'objectId') {
                        this.validateObjectId(value, field);
                    } else if (rule.type === 'string') {
                        this.validateStringLength(value, field, rule.minLength, rule.maxLength);
                    } else if (rule.type === 'number') {
                        this.validateNumberRange(value, field, rule.min, rule.max);
                    } else if (rule.type === 'boolean') {
                        this.validateBoolean(value, field);
                    } else if (rule.type === 'array') {
                        this.validateArray(value, field, rule.minLength, rule.maxLength);
                    } else if (rule.type === 'enum') {
                        this.validateEnum(value, field, rule.values);
                    } else if (rule.type === 'url') {
                        this.validateURL(value, field);
                    } else if (rule.type === 'date') {
                        this.validateDate(value, field);
                    }
                }

                sanitized[field] = value;
            } catch (error) {
                errors.push(error.message);
            }
        }

        if (errors.length > 0) {
            throw ErrorHandler.createValidationError(errors.join(', '));
        }

        return sanitized;
    }
}

export default Validator;
