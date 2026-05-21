-- V1__create_users.sql
-- FlywayがこのDDLを元にDBを構築し、JOOQがここからJavaクラスを自動生成する

CREATE TABLE IF NOT EXISTS users (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);