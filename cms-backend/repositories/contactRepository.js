import Contact from "../models/contact.js";

class ContactRepository {
  async get() {
    try {
      return await Contact.findOne();
    } catch (error) {
      throw new Error(`Error fetching contact: ${error.message}`);
    }
  }

  async update(data) {
    try {
      return await Contact.findOneAndUpdate({}, data, {
        new: true,
        upsert: true,
        returnDocument: "after",
        runValidators: true,
      });
    } catch (error) {
      throw new Error(`Error updating contact: ${error.message}`);
    }
  }
}

export default new ContactRepository();
