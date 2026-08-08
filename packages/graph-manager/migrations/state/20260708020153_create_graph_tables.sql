-- Create "graphs" table
CREATE TABLE IF NOT EXISTS "graphs" (
    "id" text NOT NULL DEFAULT (uuid_str (uuid7 ())),
    "name" text NOT NULL,
    "created_at" integer NOT NULL DEFAULT (time_to_milli (time_now ())),
    "updated_at" integer NULL,

    CONSTRAINT "graphs_pkey" PRIMARY KEY ("id")
);

-- Create trigger "graphs_set_updated_at" to table: "graphs"
CREATE TRIGGER IF NOT EXISTS "graphs_set_updated_at"
    AFTER UPDATE ON "graphs"
    FOR EACH ROW
    WHEN NEW."updated_at" IS NULL OR NEW."updated_at" IS OLD."updated_at"
    BEGIN
        UPDATE "graphs"
        SET "updated_at" = time_to_milli(time_now())
        WHERE "id" = OLD."id";
    END;

-- Create index "graphs_created_at_id_idx" to table: "graphs"
CREATE INDEX IF NOT EXISTS "graphs_created_at_id_idx" ON "graphs" ("created_at", "id");

-- Create index "graphs_updated_at_id_idx" to table: "graphs"
CREATE INDEX IF NOT EXISTS "graphs_updated_at_id_idx" ON "graphs" ("updated_at", "id") WHERE ("graphs"."updated_at" IS NOT NULL);

-- Create "nodes" table
CREATE TABLE IF NOT EXISTS "nodes" (
    "id" text NOT NULL DEFAULT (uuid_str (uuid7 ())),
    "label" text NOT NULL,
    "graph_id" text NOT NULL,
    "created_at" integer NOT NULL DEFAULT (time_to_milli (time_now ())),
    "updated_at" integer NULL,

    CONSTRAINT "nodes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "nodes_graph_id_fkey" FOREIGN KEY ("graph_id") REFERENCES "graphs" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Create trigger "nodes_set_updated_at" to table: "nodes"
CREATE TRIGGER IF NOT EXISTS "nodes_set_updated_at"
    AFTER UPDATE ON "nodes"
    FOR EACH ROW
    WHEN NEW."updated_at" IS NULL OR NEW."updated_at" IS OLD."updated_at"
    BEGIN
        UPDATE "nodes"
        SET "updated_at" = time_to_milli(time_now())
        WHERE "id" = OLD."id";
    END;

-- Create index "nodes_graph_id_id_idx" to table: "nodes"
CREATE INDEX IF NOT EXISTS "nodes_graph_id_id_idx" ON "nodes" ("graph_id", "id");

-- Create index "nodes_created_at_id_idx" to table: "nodes"
CREATE INDEX IF NOT EXISTS "nodes_created_at_id_idx" ON "nodes" ("created_at", "id");

-- Create index "nodes_updated_at_id_idx" to table: "nodes"
CREATE INDEX IF NOT EXISTS "nodes_updated_at_id_idx" ON "nodes" ("updated_at", "id") WHERE ("nodes"."updated_at" IS NOT NULL);
