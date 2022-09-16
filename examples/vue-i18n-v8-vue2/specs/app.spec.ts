import { test, expect } from 'vitest'
import { setup, url, createPage } from 'vite-test-utils'

await setup({
  browser: true
})

test('pages', async () => {
  const page = await createPage()
  await page.goto(url('/'))

  page.on('console', (...args) => console.log(...args))

  const header = await page.locator('h1.green')
  expect(await header.textContent()).toBe('You did it!')
})
