import BaseService from '../core/BaseService.js';
import RestaurantRepository from '../repositories/RestaurantRepository.js';

/**
 * Restaurant Service
 * Handles restaurant business logic
 */
class RestaurantService extends BaseService {
    constructor() {
        const restaurantRepository = new RestaurantRepository();
        super(restaurantRepository);
        this.restaurantRepository = restaurantRepository;
    }

    /**
     * Create a new restaurant
     */
    async create(restaurantData) {
        try {
            await this._validateCreate(restaurantData);
            return await super.create(restaurantData);
        } catch (error) {
            throw this._handleError(error, 'create');
        }
    }

    /**
     * Get restaurants by delivery availability
     */
    async getRestaurantsByDelivery(deliveryAvailable = true) {
        try {
            const restaurants = await this.restaurantRepository.findByDeliveryAvailability(deliveryAvailable);
            return restaurants.map(restaurant => this._formatResponse(restaurant));
        } catch (error) {
            throw this._handleError(error, 'getRestaurantsByDelivery');
        }
    }

    /**
     * Count restaurants by delivery availability
     */
    async countRestaurantsByDelivery() {
        try {
            return await this.restaurantRepository.countByDeliveryAvailability();
        } catch (error) {
            throw this._handleError(error, 'countRestaurantsByDelivery');
        }
    }

    /**
     * Get restaurants by location proximity
     */
    async getRestaurantsByLocation(lat, lng, maxDistance = 5000) {
        try {
            this._validateCoordinates(lat, lng);
            
            const restaurants = await this.restaurantRepository.findByLocationProximity(
                lat, lng, maxDistance
            );
            return restaurants.map(restaurant => this._formatResponse(restaurant));
        } catch (error) {
            throw this._handleError(error, 'getRestaurantsByLocation');
        }
    }

    /**
     * Search restaurants by name
     */
    async searchRestaurantsByName(searchTerm) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                throw new Error('Search term is required');
            }

            const restaurants = await this.restaurantRepository.searchByName(searchTerm);
            return restaurants.map(restaurant => this._formatResponse(restaurant));
        } catch (error) {
            throw this._handleError(error, 'searchRestaurantsByName');
        }
    }

    /**
     * Get restaurants within distance range
     */
    async getRestaurantsWithinDistance(maxDistance) {
        try {
            if (!maxDistance || maxDistance <= 0) {
                throw new Error('Valid maximum distance is required');
            }

            const restaurants = await this.restaurantRepository.findByDistanceRange(maxDistance);
            return restaurants.map(restaurant => this._formatResponse(restaurant));
        } catch (error) {
            throw this._handleError(error, 'getRestaurantsWithinDistance');
        }
    }

    /**
     * Search restaurants with filters
     */
    async searchRestaurants(filters) {
        try {
            const restaurants = await this.restaurantRepository.findWithFilters(filters);
            return restaurants.map(restaurant => this._formatResponse(restaurant));
        } catch (error) {
            throw this._handleError(error, 'searchRestaurants');
        }
    }

    /**
     * Update restaurant location
     */
    async updateRestaurantLocation(restaurantId, latitude, longitude) {
        try {
            this._validateId(restaurantId);
            this._validateCoordinates(latitude, longitude);

            const restaurant = await this.restaurantRepository.updateLocation(
                restaurantId, latitude, longitude
            );
            
            if (!restaurant) {
                throw new Error('Restaurant not found');
            }

            return this._formatResponse(restaurant);
        } catch (error) {
            throw this._handleError(error, 'updateRestaurantLocation');
        }
    }

    /**
     * Toggle delivery availability
     */
    async toggleDeliveryAvailability(restaurantId) {
        try {
            this._validateId(restaurantId);

            const restaurant = await this.restaurantRepository.toggleDeliveryAvailability(restaurantId);
            if (!restaurant) {
                throw new Error('Restaurant not found');
            }

            return this._formatResponse(restaurant);
        } catch (error) {
            throw this._handleError(error, 'toggleDeliveryAvailability');
        }
    }

    /**
     * Get restaurant statistics
     */
    async getRestaurantStatistics() {
        try {
            return await this.restaurantRepository.getRestaurantStatistics();
        } catch (error) {
            throw this._handleError(error, 'getRestaurantStatistics');
        }
    }

    /**
     * Get restaurants with enhanced data
     */
    async getRestaurantsWithDetails(limit = 10) {
        try {
            const restaurants = await this.getAll({}, { limit, sort: { name: 1 } });
            
            // You could enhance this with additional data like:
            // - Average ratings
            // - Recent reviews
            // - Popular dishes
            // - Operating hours
            
            return restaurants;
        } catch (error) {
            throw this._handleError(error, 'getRestaurantsWithDetails');
        }
    }

    /**
     * Get nearby restaurants with delivery
     */
    async getNearbyRestaurantsWithDelivery(lat, lng, maxDistance = 5000) {
        try {
            this._validateCoordinates(lat, lng);

            const restaurants = await this.restaurantRepository.findByLocationProximity(
                lat, lng, maxDistance
            );

            // Filter for delivery available
            const deliveryRestaurants = restaurants.filter(restaurant => restaurant.deliveryAvailable);
            
            return deliveryRestaurants.map(restaurant => this._formatResponse(restaurant));
        } catch (error) {
            throw this._handleError(error, 'getNearbyRestaurantsWithDelivery');
        }
    }

    /**
     * Validate restaurant creation data
     */
    async _validateCreate(data) {
        const { name, image, map, distance, contactNumber, location } = data;

        if (!name || name.trim().length === 0) {
            throw new Error('Restaurant name is required');
        }

        if (!image || image.trim().length === 0) {
            throw new Error('Restaurant image URL is required');
        }

        if (!map || map.trim().length === 0) {
            throw new Error('Map URL is required');
        }

        if (!distance || distance.trim().length === 0) {
            throw new Error('Distance information is required');
        }

        if (!contactNumber || contactNumber.trim().length === 0) {
            throw new Error('Contact number is required');
        }

        if (!this._isValidPhone(contactNumber)) {
            throw new Error('Invalid contact number format');
        }

        if (!location || !location.latitude || !location.longitude) {
            throw new Error('Location with latitude and longitude is required');
        }

        this._validateCoordinates(location.latitude, location.longitude);
    }

    /**
     * Validate restaurant update data
     */
    async _validateUpdate(data) {
        if (data.name && data.name.trim().length === 0) {
            throw new Error('Restaurant name cannot be empty');
        }

        if (data.image && data.image.trim().length === 0) {
            throw new Error('Image URL cannot be empty');
        }

        if (data.map && data.map.trim().length === 0) {
            throw new Error('Map URL cannot be empty');
        }

        if (data.distance && data.distance.trim().length === 0) {
            throw new Error('Distance cannot be empty');
        }

        if (data.contactNumber) {
            if (data.contactNumber.trim().length === 0) {
                throw new Error('Contact number cannot be empty');
            }
            if (!this._isValidPhone(data.contactNumber)) {
                throw new Error('Invalid contact number format');
            }
        }

        if (data.location) {
            if (!data.location.latitude || !data.location.longitude) {
                throw new Error('Location must include both latitude and longitude');
            }
            this._validateCoordinates(data.location.latitude, data.location.longitude);
        }
    }

    /**
     * Validate coordinates
     */
    _validateCoordinates(lat, lng) {
        if (typeof lat !== 'number' || typeof lng !== 'number') {
            throw new Error('Latitude and longitude must be numbers');
        }

        if (Math.abs(lat) > 90) {
            throw new Error('Invalid latitude value. Must be between -90 and 90');
        }

        if (Math.abs(lng) > 180) {
            throw new Error('Invalid longitude value. Must be between -180 and 180');
        }
    }

    /**
     * Validate phone number
     */
    _isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
}

export default RestaurantService;
