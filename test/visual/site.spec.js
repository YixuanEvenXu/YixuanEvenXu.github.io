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
  await expect(page.locator("article h2").first()).toHaveText("News");
  await expect(page.locator("article h2").nth(1)).toHaveText("Selected Publications (Full List)");
  await expect(page.locator(".selected-publications-title")).toHaveCSS("margin-top", "12.8px");
  await expect(page.locator("article > .social")).toHaveCount(0);
  await expect(page.locator("#search-toggle")).toHaveCount(0);
  await expect(page.locator("ninja-keys")).toHaveCount(0);

  const socialLinks = page.locator(".navbar-brand.social > a");
  await expect(socialLinks).toHaveCount(7);
  expect(await socialLinks.evaluateAll((links) => links.map((link) => link.title))).toEqual([
    "Email",
    "WeChat QR code",
    "Scholar userid",
    "Dblp url",
    "Linkedin username",
    "X username",
    "Github username",
  ]);
  expect(await socialLinks.evaluateAll((links) => links.map((link) => getComputedStyle(link).marginRight))).toEqual([
    "4.8px",
    "6.4px",
    "8px",
    "6.4px",
    "1.6px",
    "1.6px",
    "0px",
  ]);
  const newsWindow = page.locator("article .news-scroll-window");
  const newsRows = newsWindow.locator("tbody > tr");
  expect(await newsRows.count()).toBeGreaterThan(4);
  const newsLayout = await newsWindow.evaluate((container) => {
    const rows = container.querySelectorAll("tbody > tr");
    const containerBox = container.getBoundingClientRect();
    return {
      fourthRowBottom: rows[3].getBoundingClientRect().bottom,
      windowBottom: containerBox.bottom,
      clientHeight: container.clientHeight,
      scrollHeight: container.scrollHeight,
    };
  });
  expect(newsLayout.fourthRowBottom).toBeCloseTo(newsLayout.windowBottom, 0);
  expect(newsLayout.scrollHeight).toBeGreaterThan(newsLayout.clientHeight);
  await newsWindow.evaluate((container) => {
    container.scrollTop = container.scrollHeight;
  });
  expect(await newsWindow.evaluate((container) => container.scrollTop)).toBeGreaterThan(0);
  await newsWindow.evaluate((container) => {
    container.scrollTop = 0;
  });

  const homepageLayout = await page.evaluate(() => {
    const bodyText = document.querySelector(".clearfix > p");
    const pageTitle = document.querySelector("h1.post-title");
    const profileInfo = document.querySelector(".profile .more-info");
    return {
      bodyFont: getComputedStyle(bodyText).fontFamily,
      headingFont: getComputedStyle(pageTitle).fontFamily,
      headingWeight: getComputedStyle(pageTitle).fontWeight,
      profileFont: getComputedStyle(profileInfo).fontFamily,
    };
  });
  expect(homepageLayout.bodyFont).toContain("Georgia");
  expect(homepageLayout.headingFont).toContain("Book Antiqua");
  expect(homepageLayout.headingWeight).toBe("700");
  expect(homepageLayout.profileFont).toContain("Georgia");
  await expect(page.locator('nav a:has-text("CV")')).toHaveAttribute("href", "/assets/pdf/CV.pdf");
  await expect(page.locator("footer")).toContainText("Powered by Jekyll with al-folio");
  await expectNoHorizontalOverflow(page);

  await page.screenshot({ path: `/tmp/al-folio-home-${testInfo.project.name}.png`, fullPage: true });
});

test("publication badges and dark mode", async ({ page }, testInfo) => {
  await page.goto("/publications/", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".navbar-brand.social > a")).toHaveCount(7);
  await expect(page.locator(".navbar-brand.title")).toHaveCount(0);

  const badges = page.locator("ol.bibliography .abbr abbr");
  await expect(badges.first()).toBeVisible();
  expect(await badges.count()).toBeGreaterThan(10);
  await expect(page.locator("abbr", { hasText: "Workshop" }).first()).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(page.locator("h2.bibliography").first()).toHaveCSS("margin-bottom", "16px");
  await expect(page.getByText("Talk invited at OpenAI, Google and Simons Institute", { exact: true })).toHaveCSS("color", "rgb(0, 0, 0)");

  if (testInfo.project.name === "desktop") {
    const publicationLayout = await page
      .locator("ol.bibliography li")
      .first()
      .evaluate((item) => {
        const row = item.querySelector(":scope > .row");
        const content = row.querySelector(":scope > .col-sm-8");
        return {
          contentWidth: content.getBoundingClientRect().width,
          paddingLeft: Number.parseFloat(getComputedStyle(content).paddingLeft),
          rowWidth: row.getBoundingClientRect().width,
        };
      });
    expect(publicationLayout.contentWidth / publicationLayout.rowWidth).toBeCloseTo(5 / 6, 2);
    expect(publicationLayout.paddingLeft).toBeCloseTo(23, 1);
  }

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
  expect(lightBadges[0].width).toBeCloseTo(120, 0);
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
