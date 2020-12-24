ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_fk0";
ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_fk1";

DROP TABLE IF EXISTS "colors";

DROP TABLE IF EXISTS "types";

DROP TABLE IF EXISTS "products";



CREATE TABLE "public"."colors" (
    "id" serial PRIMARY KEY,
    "name" character varying(255) NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz,
    CONSTRAINT "colors_name_unk" UNIQUE ("name")
) WITH (oids = false);



CREATE TABLE "public"."types" (
    "id" serial PRIMARY KEY,
    "name" character varying(255) NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz,
    CONSTRAINT "types_name_unk" UNIQUE ("name")
) WITH (oids = false);



CREATE TABLE "public"."products" (
    "id" serial PRIMARY KEY,
    "type_id" integer NOT NULL,
    "color_id" integer NOT NULL,
    "price" numeric NOT NULL,
    "quantity" integer NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz,
    CONSTRAINT "products_product_unk" UNIQUE ("type_id", "color_id", "price"),
    CONSTRAINT "products_fk0" FOREIGN KEY ("type_id") REFERENCES "types"("id") NOT DEFERRABLE,
    CONSTRAINT "products_fk1" FOREIGN KEY ("color_id") REFERENCES "colors"("id") NOT DEFERRABLE
) WITH (oids = false);
