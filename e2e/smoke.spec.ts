import { expect, test } from "@playwright/test";

test.describe("Alivora V1.0 smoke", () => {
  test("onboarding creates a household and opens Home", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Get started" }).click();
    await page.getByLabel("Your name").fill("Emma Williams");
    await page.getByLabel("Email").fill("emma@example.com");
    await page.getByLabel("Password").fill("a-secure-password");
    await page.getByText("I agree to the terms").click();
    await page.getByRole("button", { name: "Create account" }).click();
    await page.getByRole("link", { name: "I've verified my email" }).click();

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Give your household a name")).toBeVisible();
    await page.getByLabel("Household name").fill("The Williams Family");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Nigerian" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByLabel("Email address").fill("james@example.com");
    await page.getByRole("button", { name: "Add invitation" }).click();
    await page.getByRole("button", { name: /Send invites/ }).click();

    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole("heading", { name: "Tomorrow Ready" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Good (morning|afternoon|evening), Emma/ })).toBeVisible();
  });

  test("Tomorrow Ready briefing lists tomorrow's plans", async ({ page }) => {
    await page.goto("/home");
    await page.getByRole("link", { name: "View tomorrow" }).first().click();
    await expect(page).toHaveURL(/\/tomorrow$/);
    await expect(page.getByText("School drop-off")).toBeVisible();
    await expect(page.getByText("Swimming lessons")).toBeVisible();
    await expect(page.getByText("Pack the swimming bag.")).toBeVisible();
  });

  test("create a task, then complete it", async ({ page }) => {
    await page.goto("/tasks/new");
    await page.getByRole("button", { name: "Save task" }).click();
    await expect(page.getByText("Add a title")).toBeVisible();
    await page.getByLabel("Title").fill("Book swimming lessons");
    await page.getByRole("button", { name: "Save task" }).click();
    await expect(page).toHaveURL(/\/tasks$/);
    const checkbox = page.getByRole("checkbox", { name: "Complete “Book swimming lessons”" });
    await checkbox.check({ force: true });
    await expect(page.getByText("Task completed")).toBeVisible();
    await expect(checkbox).toBeChecked();
  });

  test("event form blocks an end time before the start", async ({ page }) => {
    await page.goto("/planner/new");
    await page.getByLabel("Title").fill("Parents evening");
    await page.getByLabel("Starts").fill("18:00");
    await page.getByLabel("Ends").fill("17:00");
    await page.getByRole("button", { name: "Save event" }).click();
    await expect(page.getByText("End time must be after the start time")).toBeVisible();
    await expect(page).toHaveURL(/\/planner\/new/);
  });

  test("AI proposals are only saved after confirmation", async ({ page }) => {
    await page.goto("/ai");
    await page.getByLabel("Ask Alivora").fill("Remind me to buy school shoes tomorrow");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Proposed — not saved yet")).toBeVisible();
    await expect(page.getByText("Create this task?")).toBeVisible();

    await page.goto("/tasks");
    await expect(page.getByText("Buy school shoes", { exact: true })).toHaveCount(1); // seeded task only

    await page.goto("/ai");
    await page.getByLabel("Ask Alivora").fill("Remind me to call the plumber tomorrow");
    await page.getByRole("button", { name: "Send" }).click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByText("Task saved")).toBeVisible();
    await page.goto("/tasks");
    await expect(page.getByRole("link", { name: /^Call the plumber/ })).toBeVisible();
  });

  test("every primary tab loads", async ({ page }) => {
    await page.goto("/home");
    for (const [name, heading] of [
      ["Planner", "Planner"],
      ["Tasks", "Tasks"],
      ["AI", "Alivora"],
      ["Family", "Our Family"],
      ["Home", "Tomorrow Ready"],
    ] as const) {
      await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name }).click();
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    }
  });
});
