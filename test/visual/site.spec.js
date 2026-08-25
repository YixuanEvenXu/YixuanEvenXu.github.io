const { expect, test } = require("@playwright/test");

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("theme", "light"));
});

async function expectNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
}

test("homepage layout and navigation", async ({ page }, testInfo) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("h1.post-title")).toContainText("Yixuan Even Xu");
  await expect(page.locator('nav a:has-text("CV")')).toHaveAttribute("href", "/assets/pdf/CV.pdf");
  await expect(page.locator("footer")).toContainText("Powered by Jekyll with al-folio");
  await expectNoHorizontalOverflow(page);

  await page.screenshot({ path: `/tmp/al-folio-home-${testInfo.project.name}.png`, fullPage: true });
});

test("publication badges and dark mode", async ({ page }, testInfo) => {
  await page.goto("/publications/", { waitUntil: "domcontentloaded" });

  const badges = page.locator("ol.bibliography .abbr abbr");
  await expect(badges.first()).toBeVisible();
  expect(await badges.count()).toBeGreaterThan(10);

  const lightBadges = await badges.evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return {
        background: getComputedStyle(element).backgroundColor,
        height: box.height,
        width: box.width,
      };
    })
  );
  expect(new Set(lightBadges.map(({ width }) => Math.round(width))).size).toBe(1);
  expect(lightBadges[0].width).toBeGreaterThanOrEqual(120);
  expect(lightBadges.every(({ height }) => height >= 21)).toBe(true);

  const themeToggle = page.locator("#light-toggle");
  if (!(await themeToggle.isVisible())) {
    await page.locator(".navbar-toggler").click();
    await expect(themeToggle).toBeVisible();
  }
  await themeToggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const darkBackgrounds = await badges.evaluateAll((elements) => elements.map((element) => getComputedStyle(element).backgroundColor));
  expect(darkBackgrounds).toEqual(lightBadges.map(({ background }) => background));
  await expectNoHorizontalOverflow(page);

  await page.screenshot({ path: `/tmp/al-folio-publications-${testInfo.project.name}.png`, fullPage: true });
});
