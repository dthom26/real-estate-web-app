import Hero from "../models/hero.js";

class HeroRepository {
  async get() {
    return await Hero.findOne();
  }

  async update(data) {
    return await Hero.findOneAndUpdate({}, data, {
      new: true,
      upsert: true,
      returnDocument: "after",
      runValidators: true,
    });
  }
}

export default new HeroRepository();
