CREATE TABLE restaurants (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  cuisine   TEXT NOT NULL,
  area      TEXT NOT NULL,
  dine_in   BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE reviews (
  id            SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO restaurants (name, cuisine, area, dine_in) VALUES
  ('Ludhiana Burrito', 'Indian', 'Sector 32', TRUE);

INSERT INTO reviews (restaurant_id, rating, comment, created_at) VALUES
  (1, 5, 'Paneer burrito is unreal', NOW() - INTERVAL '8 days'),
  (1, 4, 'Good, but slow service',   NOW() - INTERVAL '6 days'),
  (1, 4, 'Solid. Would repeat.',     NOW() - INTERVAL '2 days');