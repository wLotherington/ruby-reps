CREATE TABLE users (
  id serial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'user'
);

-- CREATE TABLE cards (
--   id serial PRIMARY KEY,
--   prompt text,
--   starter_code text NOT NULL,
--   solution_code text NOT NULL,
--   solution_return_value text NOT NULL
-- );

-- CREATE TABLE reps (
--   user_id integer NOT NULL REFERENCES users (id),
--   card_id integer NOT NULL REFERENCES cards (id),
--   interval integer NOT NULL,
--   easiness_factor float NOT NULL,
--   next_repetition_date date NOT NULL
-- );