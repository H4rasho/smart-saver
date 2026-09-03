create table users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    currency TEXT NOT NULL
);

create table categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

create table income_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

create table fixed_expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    category_id INTEGER,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

create table expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    category_id INTEGER,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
);

-- Tabla de tipos de movimiento
create table movement_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL -- Ej: 'income', 'fixed_expense', 'expense'
);

-- Tabla unificada de movimientos
create table movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    movement_type_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    is_recurring BOOLEAN NOT NULL DEFAULT 0,
    recurrence_period TEXT, -- 'monthly', 'weekly', etc.
    recurrence_start DATE,
    recurrence_end DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
    FOREIGN KEY (movement_type_id) REFERENCES movement_types (id) ON DELETE RESTRICT
);

-- Poblar tipos de movimiento iniciales
insert into movement_types (name) values ('income');
insert into movement_types (name) values ('fixed_expense');
insert into movement_types (name) values ('expense');