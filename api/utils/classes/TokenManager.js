import jwt from 'jsonwebtoken';
import ErrorHandler from './ErrorHandler.js';

/**
 * Token Manager Class
 * Handles JWT token operations
 */
class TokenManager {
    constructor() {
        this.secret = process.env.JWT_SECRET;
        this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
        this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
        
        if (!this.secret) {
            throw new Error('JWT_SECRET environment variable is required');
        }
    }

    /**
     * Generate access token
     */
    generateAccessToken(payload) {
        try {
            return jwt.sign(payload, this.secret, {
                expiresIn: this.expiresIn,
                issuer: 'hostel-finder-api',
                audience: 'hostel-finder-client'
            });
        } catch (error) {
            throw ErrorHandler.createInternalError('Failed to generate access token', error);
        }
    }

    /**
     * Generate refresh token
     */
    generateRefreshToken(payload) {
        try {
            return jwt.sign(payload, this.secret, {
                expiresIn: this.refreshExpiresIn,
                issuer: 'hostel-finder-api',
                audience: 'hostel-finder-client'
            });
        } catch (error) {
            throw ErrorHandler.createInternalError('Failed to generate refresh token', error);
        }
    }

    /**
     * Generate both access and refresh tokens
     */
    generateTokenPair(payload) {
        return {
            accessToken: this.generateAccessToken(payload),
            refreshToken: this.generateRefreshToken(payload),
            expiresIn: this.expiresIn,
            tokenType: 'Bearer'
        };
    }

    /**
     * Verify token
     */
    verifyToken(token) {
        try {
            return jwt.verify(token, this.secret, {
                issuer: 'hostel-finder-api',
                audience: 'hostel-finder-client'
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw ErrorHandler.createAuthError('Token has expired');
            } else if (error.name === 'JsonWebTokenError') {
                throw ErrorHandler.createAuthError('Invalid token');
            } else if (error.name === 'NotBeforeError') {
                throw ErrorHandler.createAuthError('Token not active yet');
            } else {
                throw ErrorHandler.createAuthError('Token verification failed');
            }
        }
    }

    /**
     * Decode token without verification (for debugging)
     */
    decodeToken(token) {
        try {
            return jwt.decode(token, { complete: true });
        } catch (error) {
            throw ErrorHandler.createValidationError('Invalid token format');
        }
    }

    /**
     * Check if token is expired
     */
    isTokenExpired(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.payload.exp) {
                return true;
            }
            
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.payload.exp < currentTime;
        } catch (error) {
            return true;
        }
    }

    /**
     * Get token expiration time
     */
    getTokenExpiration(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.payload.exp) {
                return null;
            }
            
            return new Date(decoded.payload.exp * 1000);
        } catch (error) {
            return null;
        }
    }

    /**
     * Get time until token expires (in seconds)
     */
    getTimeUntilExpiration(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.payload.exp) {
                return 0;
            }
            
            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilExpiration = decoded.payload.exp - currentTime;
            
            return Math.max(0, timeUntilExpiration);
        } catch (error) {
            return 0;
        }
    }

    /**
     * Extract token from Authorization header
     */
    extractTokenFromHeader(authHeader) {
        if (!authHeader) {
            throw ErrorHandler.createAuthError('Authorization header is required');
        }

        const parts = authHeader.split(' ');
        
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw ErrorHandler.createAuthError('Invalid authorization header format');
        }

        return parts[1];
    }

    /**
     * Extract token from cookie
     */
    extractTokenFromCookie(cookies, cookieName = 'access_token') {
        if (!cookies || !cookies[cookieName]) {
            throw ErrorHandler.createAuthError('Authentication token not found');
        }

        return cookies[cookieName];
    }

    /**
     * Create token payload for user
     */
    createUserPayload(user) {
        return {
            id: user._id || user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin || false,
            iat: Math.floor(Date.now() / 1000)
        };
    }

    /**
     * Validate token payload
     */
    validateTokenPayload(payload) {
        const requiredFields = ['id', 'email'];
        
        for (const field of requiredFields) {
            if (!payload[field]) {
                throw ErrorHandler.createValidationError(`Token payload missing required field: ${field}`);
            }
        }

        return true;
    }

    /**
     * Refresh access token using refresh token
     */
    refreshAccessToken(refreshToken) {
        try {
            const decoded = this.verifyToken(refreshToken);
            
            // Create new payload (remove timing fields)
            const { iat, exp, ...userPayload } = decoded;
            
            return this.generateAccessToken(userPayload);
        } catch (error) {
            throw ErrorHandler.createAuthError('Invalid refresh token');
        }
    }

    /**
     * Blacklist token (in production, you'd store this in Redis or database)
     */
    blacklistToken(token) {
        // In a real application, you would store blacklisted tokens
        // in a database or Redis with their expiration time
        console.log(`Token blacklisted: ${token.substring(0, 20)}...`);
        
        // For now, we'll just log it
        // In production: await redis.setex(`blacklist_${token}`, expirationTime, 'true');
    }

    /**
     * Check if token is blacklisted
     */
    isTokenBlacklisted(token) {
        // In a real application, you would check against your blacklist store
        // For now, return false
        return false;
        
        // In production: return await redis.exists(`blacklist_${token}`);
    }

    /**
     * Get token info
     */
    getTokenInfo(token) {
        try {
            const decoded = this.decodeToken(token);
            
            if (!decoded) {
                return null;
            }

            const payload = decoded.payload;
            const header = decoded.header;

            return {
                header,
                payload: {
                    ...payload,
                    // Convert timestamps to readable dates
                    issuedAt: payload.iat ? new Date(payload.iat * 1000) : null,
                    expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
                    notBefore: payload.nbf ? new Date(payload.nbf * 1000) : null
                },
                isExpired: this.isTokenExpired(token),
                timeUntilExpiration: this.getTimeUntilExpiration(token)
            };
        } catch (error) {
            return null;
        }
    }
}

export default TokenManager;
