CREATE SEQUENCE products_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1;

CREATE TABLE "public"."products" (
    "id" integer DEFAULT nextval('products_id_seq') NOT NULL,
    "type" character varying(255) NOT NULL,
    "color" character varying(255) NOT NULL,
    "price" numeric NOT NULL,
    "quantity" integer NOT NULL,
    "created_at" timestamptz NOT NULL,
    "updated_at" timestamptz NOT NULL,
    "deleted_at" timestamptz,
    CONSTRAINT "products_product_unk" UNIQUE ("type", "color", "price")
) WITH (oids = false);
