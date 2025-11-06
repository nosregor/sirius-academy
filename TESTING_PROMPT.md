# Playwright MCP Server Prompt - SIRIUS ACADEMY

## Navigation Scenario

### Scenario 1: Basic Navigation to teachers

- Start the Playwright MCP server.
- Use the MCP client to send a navigation command to list teachers `http://localhost:4200/teachers`.
- Verify that the page loads successfully (status 200).

### Scenario 2: Basic Navigation to students

- Start the Playwright MCP server.
- Use the MCP client to send a navigation command to list students `http://localhost:4200/students`.
- Verify that the page loads successfully (status 200).

### Scenario 3: Creating a Student Flow

- Click on the
- Fill out the student-form with required information.
- Submit the form and verify successful student creation.

## Test Data Suggestions

### Student Data

- First Name: `Test`
- Last Name: `User`
- Password: `Q1W*1#$qw1qe2rg1`
- Instrument: `Piano`

---

## Playwright Sample Test Framework Creation

- Apply the POM pattern for other flows for scalable and maintainable tests.
