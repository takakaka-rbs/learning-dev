package com.example.app.api;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.app.generated.model.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * UsersApiIT
 *
 * openapi.yml（/users, /users/{id}）を根拠にした API テスト。
 * レスポンスは OpenAPI Generator の生成モデル（{@link User}）へ
 * デシリアライズして型・必須項目レベルの適合を検証する
 * （仕様変更時は生成モデルが変わり、コンパイルエラー・テスト失敗として乖離が検出される）。
 *
 * 実行: mvn verify（PostgreSQL が起動していること。データは Flyway のマイグレーションで投入される）
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UsersApiIT {

  @Autowired
  private TestRestTemplate restTemplate;

  @Test
  @DisplayName("GET /users - 200: ユーザー一覧が User スキーマ（必須: id, name, email）で返る")
  void getUsersReturnsUserList() {
    ResponseEntity<User[]> response = restTemplate.getForEntity("/users", User[].class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    // サンプルデータ（V1_1__insert_sample_user_data.sql）が最低3件投入されている
    assertThat(response.getBody().length).isGreaterThanOrEqualTo(3);
    // openapi.yml の required（id / name / email）が全要素で満たされていること
    for (User user : response.getBody()) {
      assertThat(user.getId()).isNotNull();
      assertThat(user.getName()).isNotBlank();
      assertThat(user.getEmail()).isNotBlank();
    }
  }

  @Test
  @DisplayName("GET /users/{id} - 200: 指定IDのユーザーが User スキーマで返る")
  void getUserByIdReturnsUser() {
    ResponseEntity<User> response = restTemplate.getForEntity("/users/1", User.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    assertThat(response.getBody()).isNotNull();
    assertThat(response.getBody().getId()).isEqualTo(1L);
    assertThat(response.getBody().getName()).isNotBlank();
    assertThat(response.getBody().getEmail()).isNotBlank();
  }

  @Test
  @DisplayName("GET /users/{id} - 404: 存在しないIDは Not Found が返る")
  void getUserByIdReturnsNotFoundForUnknownId() {
    ResponseEntity<String> response =
        restTemplate.getForEntity("/users/999999", String.class);

    assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    // NOTE: openapi.yml では 404 のボディに ErrorResponse を定義しているが、
    // 現状の実装は空ボディを返す（仕様と実装の乖離）。ボディの検証は実装修正後に追加する。
  }
}
