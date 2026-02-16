import contactRepository from "../repositories/contactRepository.js";

// GET - get the single contact document
export const getContact = async (req, res) => {
  try {
    const contactData = await contactRepository.get();
    if (!contactData) {
      return res.status(404).json({ error: "Contact info not found" });
    }
    res.json(contactData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch contact info" });
  }
};

// PUT - update the contact doc
export const updateContact = async (req, res) => {
  try {
    const updatedData = await contactRepository.update(req.body);
    res.json(updatedData);
  } catch (error) {
    res.status(500).json({ error: "Failed to update contact info" });
  }
};
