package com.example.app.service;

import com.example.app.generated.model.User;
import com.example.app.jooq.tables.Users;
import com.example.app.jooq.tables.records.UsersRecord;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * UserService
 *
 * JOOQのDSLを使ってDBアクセスを行う。
 * JOOQのクラス (Users, UsersRecord) は DDL から自動生成されたもの。
 *   生成コマンド: mvn flyway:migrate jooq-codegen:generate
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final DSLContext dsl;

    /**
     * ユーザー一覧を取得する
     */
    public List<User> findAll() {
        return dsl.selectFrom(Users.USERS)
                .orderBy(Users.USERS.ID.asc())
                .fetch()
                .map(this::toModel);
    }

    /**
     * IDでユーザーを取得する
     */
    public Optional<User> findById(Long id) {
        return dsl.selectFrom(Users.USERS)
                .where(Users.USERS.ID.eq(id))
                .fetchOptional()
                .map(this::toModel);
    }

    /**
     * JOOQ の Record → OpenAPI 生成モデルへの変換
     */
    private User toModel(UsersRecord record) {
        User user = new User();
        user.setId(record.getId());
        user.setName(record.getName());
        user.setEmail(record.getEmail());
        if (record.getCreatedAt() != null) {
            user.setCreatedAt(record.getCreatedAt().toOffsetDateTime());
        }
        return user;
    }
}
