import Contact from "../models/contact.js";

class ContactRepository {
  async get() {
    return await Contact.findOne();
  }

  async update(data) {
    return await Contact.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
      returnDocument: "after",
      runValidators: true,
    });
  }
}

export default new ContactRepository();
