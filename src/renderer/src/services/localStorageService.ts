export function createStorage<T>(key: string) {
  localStorage.clear()
  return {
    get(): Partial<T> {
      return JSON.parse(localStorage.getItem(key) ?? '{}')
    },

    set(value: Partial<T>) {
      localStorage.setItem(key, JSON.stringify(value))
    },

    update(value: Partial<T>) {
      const current = this.get()
      this.set({ ...current, ...value })
    },

    remove() {
      localStorage.removeItem(key)
    },

    clear() {
      localStorage.clear()
    }
  }
}
