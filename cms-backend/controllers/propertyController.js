import propertyRepository from '../repositories/propertyRepository.js';

// get all properties
export const getAllProperties = async (req, res) => {
  try {
    const properties = await propertyRepository.findAll();
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};
// create new property
export const createProperty = async (req, res) => {
  try {
    const newProperty = await propertyRepository.create(req.body);
    res.status(201).json(newProperty);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create property' });
  }
};
// update property
export const updateProperty = async (req, res) => {
  try {
    const updatedProperty = await propertyRepository.updateById(req.params.id, req.body);
    if (!updatedProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(updatedProperty);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update property' });
  }
};
// delete property
export const deleteProperty = async (req, res) => {
  try {
    const deletedProperty = await propertyRepository.deleteById(req.params.id);
    if (!deletedProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete property' });
  }
};
// get property by id
export const getPropertyById = async (req, res) => {
  try {
    const property = await propertyRepository.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch property' });
  }
};  