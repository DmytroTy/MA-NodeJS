DROP TABLE IF EXISTS "products";
DROP SEQUENCE IF EXISTS products_id_seq;


CREATE TABLE "public"."types" (
    "id" serial PRIMARY KEY,
    "name" character varying(255) NOT NULL UNIQUE,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz
) WITH (oids = false);


CREATE TABLE "public"."colors" (
    "id" serial PRIMARY KEY,
    "name" character varying(255) NOT NULL UNIQUE,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz
) WITH (oids = false);


CREATE TABLE "public"."products" (
    "id" serial PRIMARY KEY,
    "id_type" integer NOT NULL CONSTRAINT "products_fk0" REFERENCES "types"("id"),
    "id_color" integer NOT NULL CONSTRAINT "products_fk1" REFERENCES "colors"("id"),
    "price" numeric NOT NULL,
    "quantity" integer NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz,
    CONSTRAINT "products_product_unk" UNIQUE ("id_type", "id_color", "price")
) WITH (oids = false);
