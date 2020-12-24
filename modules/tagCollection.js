
class TagCollection {
  constructor() {
    this.collection = {};
  }

  static toMap(tagsArray = []) {
    const map = {};

    tagsArray.forEach(({ name = '', history = [] }) => {
      map[name] = history.reduce((acc, { accounts = 0 }) => acc + parseInt(accounts, 0), 0)
    })

    return map;
  }

  get() {
    return this.collection;
  }

  add(tagsArray) {
    const formattedTagsArray = this.constructor.toMap(tagsArray);

    Object.entries(formattedTagsArray).forEach(([name, value]) => {
      const existingValue = this.collection[name] || 0;
      this.collection[name] = existingValue + value;
    });

    return this;
  }
}

module.exports = TagCollection;
