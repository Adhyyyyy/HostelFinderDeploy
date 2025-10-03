import BaseService from '../core/BaseService.js';
import HostelRepository from '../repositories/HostelRepository.js';

/**
 * Hostel Service
 * Handles hostel business logic
 */
class HostelService extends BaseService {
    constructor() {
        const hostelRepository = new HostelRepository();
        super(hostelRepository);
        this.hostelRepository = hostelRepository;
    }

    /**
     * Create a new hostel
     */
    async create(hostelData) {
        try {
            await this._validateCreate(hostelData);
            return await super.create(hostelData);
        } catch (error) {
            throw this._handleError(error, 'create');
        }
    }

    /**
     * Get hostels by gender type
     */
    async getHostelsByGender(genderType) {
        try {
            const hostels = await this.hostelRepository.findByGenderType(genderType);
            return hostels.map(hostel => this._formatResponse(hostel));
        } catch (error) {
            throw this._handleError(error, 'getHostelsByGender');
        }
    }

    /**
     * Get hostels by category
     */
    async getHostelsByCategory(category) {
        try {
            const hostels = await this.hostelRepository.findByCategory(category);
            return hostels.map(hostel => this._formatResponse(hostel));
        } catch (error) {
            throw this._handleError(error, 'getHostelsByCategory');
        }
    }

    /**
     * Count hostels by gender
     */
    async countHostelsByGender(genders) {
        try {
            if (typeof genders === 'string') {
                genders = genders.split(',');
            }
            return await this.hostelRepository.countByGender(genders);
        } catch (error) {
            throw this._handleError(error, 'countHostelsByGender');
        }
    }

    /**
     * Count hostels by category
     */
    async countHostelsByCategory() {
        try {
            return await this.hostelRepository.countByCategory();
        } catch (error) {
            throw this._handleError(error, 'countHostelsByCategory');
        }
    }

    /**
     * Get available hostels
     */
    async getAvailableHostels(minVacancy = 1) {
        try {
            const hostels = await this.hostelRepository.findAvailableHostels(minVacancy);
            return hostels.map(hostel => this._formatResponse(hostel));
        } catch (error) {
            throw this._handleError(error, 'getAvailableHostels');
        }
    }

    /**
     * Search hostels with multiple criteria
     */
    async searchHostels(searchCriteria) {
        try {
            const hostels = await this.hostelRepository.searchHostels(searchCriteria);
            return hostels.map(hostel => this._formatResponse(hostel));
        } catch (error) {
            throw this._handleError(error, 'searchHostels');
        }
    }

    /**
     * Get hostels within distance range
     */
    async getHostelsWithinDistance(maxDistance) {
        try {
            const hostels = await this.hostelRepository.findByDistanceRange(maxDistance);
            return hostels.map(hostel => this._formatResponse(hostel));
        } catch (error) {
            throw this._handleError(error, 'getHostelsWithinDistance');
        }
    }

    /**
     * Update hostel vacancy
     */
    async updateVacancy(hostelId, vacancyChange) {
        try {
            const hostel = await this.hostelRepository.updateVacancy(hostelId, vacancyChange);
            if (!hostel) {
                throw new Error('Hostel not found');
            }
            return this._formatResponse(hostel);
        } catch (error) {
            throw this._handleError(error, 'updateVacancy');
        }
    }

    /**
     * Get hostels by location proximity
     */
    async getHostelsByLocation(lat, lng, maxDistance = 5000) {
        try {
            const hostels = await this.hostelRepository.findByLocationProximity(lat, lng, maxDistance);
            return hostels.map(hostel => this._formatResponse(hostel));
        } catch (error) {
            throw this._handleError(error, 'getHostelsByLocation');
        }
    }

    /**
     * Get hostel statistics
     */
    async getHostelStatistics() {
        try {
            const totalHostels = await this.repository.count();
            const pgCount = await this.repository.count({ category: 'PG' });
            const hostelCount = await this.repository.count({ category: 'Hostel' });
            const boysHostels = await this.repository.count({ genderType: 'Boys' });
            const girlsHostels = await this.repository.count({ genderType: 'Girls' });
            const availableHostels = await this.repository.count({ vacancy: { $gt: 0 } });

            return {
                totalHostels,
                pgCount,
                hostelCount,
                boysHostels,
                girlsHostels,
                availableHostels,
                occupancyRate: totalHostels > 0 ? ((totalHostels - availableHostels) / totalHostels) * 100 : 0
            };
        } catch (error) {
            throw this._handleError(error, 'getHostelStatistics');
        }
    }

    /**
     * Get hostel with detailed information
     */
    async getHostelDetails(hostelId) {
        try {
            const hostel = await this.getById(hostelId);
            
            // You could add additional details here like:
            // - Room count
            // - Average rating
            // - Recent reviews
            // - Occupancy statistics
            
            return hostel;
        } catch (error) {
            throw this._handleError(error, 'getHostelDetails');
        }
    }

    /**
     * Validate hostel creation data
     */
    async _validateCreate(data) {
        const requiredFields = [
            'name', 'category', 'genderType', 'distanceFromCollege',
            'address', 'vacancy', 'capacity', 'contact', 'ownerName', 'ownerContact'
        ];

        // Check required fields
        for (const field of requiredFields) {
            if (!data[field]) {
                throw new Error(`${field} is required`);
            }
        }

        // Validate specific fields
        if (data.vacancy < 0) {
            throw new Error('Vacancy cannot be negative');
        }

        if (data.capacity < 1) {
            throw new Error('Capacity must be at least 1');
        }

        if (data.vacancy > data.capacity) {
            throw new Error('Vacancy cannot be greater than capacity');
        }

        if (data.distanceFromCollege < 0) {
            throw new Error('Distance from college cannot be negative');
        }

        // Validate category
        const validCategories = ['PG', 'Hostel'];
        if (!validCategories.includes(data.category)) {
            throw new Error('Category must be either PG or Hostel');
        }

        // Validate gender type
        const validGenderTypes = ['Boys', 'Girls', 'Co-ed'];
        if (!validGenderTypes.includes(data.genderType)) {
            throw new Error('Gender type must be Boys, Girls, or Co-ed');
        }

        // Validate location if provided
        if (data.location) {
            if (!data.location.lat || !data.location.lng) {
                throw new Error('Location must include both latitude and longitude');
            }
            
            if (Math.abs(data.location.lat) > 90) {
                throw new Error('Invalid latitude value');
            }
            
            if (Math.abs(data.location.lng) > 180) {
                throw new Error('Invalid longitude value');
            }
        }

        // Validate contact numbers
        if (data.contact && !this._isValidPhone(data.contact)) {
            throw new Error('Invalid contact number');
        }

        if (data.ownerContact && !this._isValidPhone(data.ownerContact)) {
            throw new Error('Invalid owner contact number');
        }
    }

    /**
     * Validate hostel update data
     */
    async _validateUpdate(data) {
        if (data.vacancy !== undefined && data.vacancy < 0) {
            throw new Error('Vacancy cannot be negative');
        }

        if (data.capacity !== undefined && data.capacity < 1) {
            throw new Error('Capacity must be at least 1');
        }

        if (data.distanceFromCollege !== undefined && data.distanceFromCollege < 0) {
            throw new Error('Distance from college cannot be negative');
        }

        if (data.category) {
            const validCategories = ['PG', 'Hostel'];
            if (!validCategories.includes(data.category)) {
                throw new Error('Category must be either PG or Hostel');
            }
        }

        if (data.genderType) {
            const validGenderTypes = ['Boys', 'Girls', 'Co-ed'];
            if (!validGenderTypes.includes(data.genderType)) {
                throw new Error('Gender type must be Boys, Girls, or Co-ed');
            }
        }

        if (data.contact && !this._isValidPhone(data.contact)) {
            throw new Error('Invalid contact number');
        }

        if (data.ownerContact && !this._isValidPhone(data.ownerContact)) {
            throw new Error('Invalid owner contact number');
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

export default HostelService;
