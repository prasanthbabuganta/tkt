import api from './axios.instance';

export const vehicleService = {
  getAll: async () => {
    const response = await api.get('/vehicles');
    return response.data;
  },

  search: async (query) => {
    const response = await api.get(`/vehicles/search?query=${query}`);
    return response.data;
  },

  getByNumber: async (vehicleNumber) => {
    const response = await api.get(`/vehicles/by-number/${vehicleNumber}`);
    return response.data;
  },

  register: async (vehicleData) => {
    // Create FormData for multipart/form-data request
    const formData = new FormData();

    // Add text fields
    formData.append('ownerName', vehicleData.ownerName);
    formData.append('ownerMobile', vehicleData.ownerMobile);
    formData.append('vehicleNumber', vehicleData.vehicleNumber);
    formData.append('vehicleType', vehicleData.vehicleType);

    // Add images if they exist
    if (vehicleData.carImage) {
      const carImageFile = {
        uri: vehicleData.carImage.uri,
        type: vehicleData.carImage.mimeType || 'image/jpeg',
        name: vehicleData.carImage.fileName || 'car_image.jpg',
      };
      formData.append('carImage', carImageFile);
    }

    if (vehicleData.keyImage) {
      const keyImageFile = {
        uri: vehicleData.keyImage.uri,
        type: vehicleData.keyImage.mimeType || 'image/jpeg',
        name: vehicleData.keyImage.fileName || 'key_image.jpg',
      };
      formData.append('keyImage', keyImageFile);
    }

    // Use multipart/form-data content type
    const response = await api.post('/vehicles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (vehicleId, vehicleData) => {
    // Create FormData for multipart/form-data request
    const formData = new FormData();

    // Add text fields
    formData.append('ownerName', vehicleData.ownerName);
    formData.append('ownerMobile', vehicleData.ownerMobile);
    formData.append('vehicleNumber', vehicleData.vehicleNumber);
    formData.append('vehicleType', vehicleData.vehicleType);

    // Add images if they exist
    if (vehicleData.carImage) {
      const carImageFile = {
        uri: vehicleData.carImage.uri,
        type: vehicleData.carImage.mimeType || 'image/jpeg',
        name: vehicleData.carImage.fileName || 'car_image.jpg',
      };
      formData.append('carImage', carImageFile);
    }

    if (vehicleData.keyImage) {
      const keyImageFile = {
        uri: vehicleData.keyImage.uri,
        type: vehicleData.keyImage.mimeType || 'image/jpeg',
        name: vehicleData.keyImage.fileName || 'key_image.jpg',
      };
      formData.append('keyImage', keyImageFile);
    }

    // Use multipart/form-data content type
    const response = await api.put(`/vehicles/${vehicleId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
