### Taskist

Frappe based Task Management SPA that extends ease of use of Frappe's inbuilt Project & Task functions.

### Installation

```bash
bench get-app https://github.com/Cecypo-Tech/Taskist --branch main
bench install-app taskist
```

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/taskist
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade

### License

AGPL 3.0