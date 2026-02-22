### Taskist

Frappe based Task Management SPA that extends ease of use of Frappe/ERPNext's inbuilt Project & Task functions.
Built on ERPNext v16.
v15 - Not yet tested.

### Usage / Features

#### Shortcuts
| Function 	| Shortcut 	|
|---	|---	|
| New Task 	| N 	|
| Close 	| Esc 	|
| Kanban View 	| 1 	|
| List View 	| 2 	|
| Calendar View 	| 3 	|
| Summary 	| 4 	|
| Shortcuts 	| ? 	|

#### Goal
 - Use ERPNext's existing Projects/Tasks functions but make it more user friendly - specifically for our own business.
 - Kanban/List view
 - Quickly add new tasks (shortcut keys) - with/without a project.
 - Calendar view for team planning and visibility.

#### Screenshots
![Kanban View](https://i.imgur.com/3UFyVKP.png)

![List View](https://i.imgur.com/U5T0mg3.png)

![Calendar](https://i.imgur.com/VZcaMrc.png)

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

### License

AGPL 3.0