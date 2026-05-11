import { test, expect, type Page } from "@playwright/test";

const USERS_FIXTURE = [
  { id: 1, name: "Haz_1_Idos", profile_type: "elderly", is_prosumer: false, solar_kwp: 0 },
  { id: 2, name: "Haz_2_Csalad", profile_type: "family", is_prosumer: false, solar_kwp: 0 },
  { id: 3, name: "Haz_3_Egyedul", profile_type: "single", is_prosumer: false, solar_kwp: 0 },
  { id: 4, name: "Haz_4_Solar_Idos", profile_type: "elderly", is_prosumer: true, solar_kwp: 3.5 },
  { id: 5, name: "Haz_5_Solar_Csalad", profile_type: "family", is_prosumer: true, solar_kwp: 6 },
  { id: 6, name: "Haz_6_Solar_Egyedul", profile_type: "single", is_prosumer: true, solar_kwp: 4 },
];

const MOCK_SETTLEMENT = {
  start: "2026-06-01T00:00:00",
  end: "2026-06-30T23:59:59",
  total_baseline_ft: 128000,
  total_community_ft: 105000,
  total_savings_ft: 23000,
  self_sufficiency_pct: 19.7,
  users: [
    {
      user_id: 1,
      name: "Haz_1_Idos",
      is_prosumer: false,
      consumption_kwh: 100,
      generation_kwh: 0,
      import_kwh: 100,
      export_kwh: 0,
      community_purchased_kwh: 25,
      community_sold_kwh: 0,
      grid_purchased_kwh: 75,
      grid_sold_kwh: 0,
      baseline_cost_ft: 4000,
      community_cost_ft: 3562,
      savings_ft: 438,
      prosumer_profit_increment_ft: 0,
    },
    {
      user_id: 5,
      name: "Haz_5_Solar_Csalad",
      is_prosumer: true,
      consumption_kwh: 200,
      generation_kwh: 400,
      import_kwh: 10,
      export_kwh: 210,
      community_purchased_kwh: 5,
      community_sold_kwh: 180,
      grid_purchased_kwh: 5,
      grid_sold_kwh: 30,
      baseline_cost_ft: -650,
      community_cost_ft: -3837,
      savings_ft: 3187,
      prosumer_profit_increment_ft: 3150,
    },
  ],
  hourly: [
    {
      hour: "2026-06-15T12:00:00",
      community_supply_kwh: 4.2,
      community_demand_kwh: 3.1,
      self_sufficiency_pct: 100,
      baseline_total_ft: 80,
      community_total_ft: 50,
      savings_ft: 30,
    },
  ],
};

async function mockApi(page: Page) {
  await page.route("**/api/users", (route) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify(USERS_FIXTURE) }),
  );
  await page.route("**/api/settlement*", (route) =>
    route.fulfill({ contentType: "application/json", body: JSON.stringify(MOCK_SETTLEMENT) }),
  );
  await page.route("**/api/data-range", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        first: "2026-01-01T00:00:00",
        last: "2026-12-31T23:45:00",
        record_count: 210240,
      }),
    }),
  );
}

async function signIn(page: Page, userId = 5) {
  await page.addInitScript((id: number) => {
    localStorage.setItem("ec:activeUserId", String(id));
  }, userId);
}

test.describe("Landing page", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("first startup shows the 6 household cards and no sidebar", async ({ page }) => {
    await mockApi(page);
    await page.goto("/");

    await expect(page).toHaveURL(/\/welcome/);
    await expect(page.getByTestId("page-welcome")).toBeVisible();
    await expect(page.getByTestId("welcome-user-grid")).toBeVisible();
    for (const u of USERS_FIXTURE) {
      await expect(page.getByTestId(`welcome-pick-${u.name}`)).toBeVisible();
    }
    await expect(page.getByTestId("sidebar")).toHaveCount(0);
    await expect(page.getByTestId("user-badge")).toHaveCount(0);
  });

  test("picking a household signs in and reveals the app shell", async ({ page }) => {
    await mockApi(page);
    await page.goto("/welcome");
    await page.getByTestId("welcome-pick-Haz_5_Solar_Csalad").click();

    await expect(page).toHaveURL("http://localhost:5173/");
    await expect(page.getByTestId("sidebar")).toBeVisible();
    await expect(page.getByTestId("user-badge")).toBeVisible();
    await expect(page.getByTestId("active-user-name")).toHaveText("Haz_5_Solar_Csalad");
  });

  test("signed-in users are bounced off /welcome", async ({ page }) => {
    await mockApi(page);
    await signIn(page, 1);
    await page.goto("/welcome");
    await expect(page).toHaveURL("http://localhost:5173/");
  });
});

test.describe("Shell (signed in)", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await signIn(page, 1);
  });

  test("renders title, language selector, date window, and sidebar nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("app-title")).toBeVisible();

    const selector = page.getByTestId("lang-selector");
    await expect(selector).toBeVisible();
    await expect(selector.getByTestId("lang-en")).toBeVisible();
    await expect(selector.getByTestId("lang-hu")).toBeVisible();

    await expect(page.getByTestId("filter-bar")).toBeVisible();
    await expect(page.getByTestId("filter-start")).toBeVisible();
    await expect(page.getByTestId("filter-end")).toBeVisible();

    await expect(page.getByTestId("sidebar")).toBeVisible();
    await expect(page.getByTestId("nav-home")).toBeVisible();
    await expect(page.getByTestId("nav-my-savings")).toBeVisible();
    await expect(page.getByTestId("nav-community")).toBeVisible();
    await expect(page.getByTestId("nav-prosumer-profit")).toBeVisible();
    await expect(page.getByTestId("nav-settings")).toBeVisible();
  });

  test("switches language to Hungarian across pages", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("lang-hu").click();
    await expect(page.getByTestId("app-title")).toHaveText("Kezdőlap");
    await page.getByTestId("nav-community").click();
    await expect(page.getByTestId("app-title")).toHaveText("Közösség");
  });

  test("header shows a locked badge, not a switcher", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("user-badge")).toBeVisible();
    await expect(page.getByTestId("active-user-name")).toHaveText("Haz_1_Idos");
    // No dropdown menu should exist anywhere on the page.
    await expect(page.getByTestId("user-switcher")).toHaveCount(0);
    await expect(page.getByTestId("user-switcher-menu")).toHaveCount(0);
  });
});

test.describe("Community page", () => {
  test("displays mocked savings and table", async ({ page }) => {
    await mockApi(page);
    await signIn(page, 5);
    await page.goto("/community");

    await expect(page.getByTestId("page-community")).toBeVisible();
    await expect(page.getByTestId("community-table")).toBeVisible();
    await expect(page.getByTestId("row-Haz_5_Solar_Csalad")).toContainText("3187");
  });
});

test.describe("My Savings page", () => {
  test("shows personal A/B panel for the active user", async ({ page }) => {
    await mockApi(page);
    await signIn(page, 5);
    await page.goto("/my-savings");

    await expect(page.getByTestId("page-my-savings")).toBeVisible();
    await expect(page.getByTestId("ab-panel")).toBeVisible();
    await expect(page.getByTestId("ab-baseline")).toContainText("650");
    await expect(page.getByTestId("ab-community")).toContainText("3837");
    await expect(page.getByTestId("ab-savings")).toContainText("3187");
    await expect(page.getByTestId("my-profit-increment")).toContainText("3150");
  });

  test("home page shows community-wide A/B KPIs", async ({ page }) => {
    await mockApi(page);
    await signIn(page, 5);
    await page.goto("/");
    await expect(page.getByTestId("page-home")).toBeVisible();
    await expect(page.getByTestId("kpi-community-savings")).toContainText("23");
  });
});

test.describe("Settings page", () => {
  test("exposes Drop Data and Sign out", async ({ page }) => {
    await mockApi(page);
    await signIn(page, 1);
    await page.goto("/settings");

    await expect(page.getByTestId("page-settings")).toBeVisible();
    await expect(page.getByTestId("drop-data")).toBeVisible();
    await expect(page.getByTestId("filter-reset")).toBeVisible();
    await expect(page.getByTestId("sign-out")).toBeVisible();
  });

  test("sign out returns to /welcome and forgets the user", async ({ page }) => {
    await mockApi(page);
    await signIn(page, 1);
    await page.goto("/settings");
    await page.getByTestId("sign-out").click();
    await expect(page).toHaveURL(/\/welcome/);
    await expect(page.getByTestId("page-welcome")).toBeVisible();
  });
});
