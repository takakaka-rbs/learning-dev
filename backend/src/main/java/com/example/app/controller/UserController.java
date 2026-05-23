package com.example.app.controller;

import com.example.app.generated.api.UsersApi;
import com.example.app.generated.model.User;
import com.example.app.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * UserController
 *
 * OpenAPI Generator が openapi.yml から自動生成した UsersApi インターフェースを implements する。
 * インターフェースに定義されたエンドポイントを実装するだけでよく、
 * URLマッピングやバリデーションは生成コードが担う。
 *
 * 生成コマンド: mvn generate-sources
 */
@RestController
@RequiredArgsConstructor
public class UserController implements UsersApi {

  private final UserService userService;

  /**
   * GET /users - ユーザー一覧取得
   * openapi.yml の operationId: getUsers に対応
   */
  @Override
  public ResponseEntity<List<User>> getUsers() {
    List<User> users = userService.findAll();
    return ResponseEntity.ok(users);
  }

  /**
   * GET /users/{id} - ユーザー取得
   * openapi.yml の operationId: getUserById に対応
   */
  @Override
  public ResponseEntity<User> getUserById(Long id) {
    return userService.findById(id)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }
}
