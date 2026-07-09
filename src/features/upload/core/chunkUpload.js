const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export async function retry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await wait(2 ** i * 1000);
    }
  }
}