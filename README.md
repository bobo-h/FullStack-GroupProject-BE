# Meow Memo
## 개요
이 프로젝트는 사용자 관리, 제품 관리, 주문 관리, 판매 데이터 분석, 다이어리 및 댓글 관리, OpenAI 기반 챗봇 통합 등 다양한 기능을 제공하는 Node.js 기반 백엔드 서버입니다. 
MongoDB를 데이터베이스로 사용하며 RESTful API를 통해 클라이언트와 통신합니다.

---

## 주요 기능
### 사용자 관리
- **회원 가입 및 로그인**: 이메일, 비밀번호를 통한 인증 및 Google OAuth 지원
- **회원 정보 조회 및 수정**: 이름, 생년월일, 프로필 이미지 관리
- **회원 탈퇴 및 복구**: 삭제된 계정의 재등록 정책 포함

### 제품 관리
- **제품 생성 및 관리**: 관리자 전용 제품 추가, 수정, 삭제
- **제품 조회**: 카테고리별 또는 기본 제품 필터링 지원

### 주문 관리
- **주문 생성**: 사용자 정보와 제품 정보를 통해 주문 생성
- **주문 조회**: 개인별 또는 관리자 관점에서 주문 내역 조회

### 다이어리 및 댓글 관리
- **다이어리**: 사용자별 다이어리 작성, 조회, 수정, 삭제
- **댓글**: 다이어리에 대한 댓글 작성, AI 챗봇 댓글 자동 생성
- **필터링 및 복구**: 다이어리와 댓글의 날짜별 조회 및 삭제 항목 복구

### AI 챗봇 통합
- **사용자 정의 챗봇 생성**: 제품 정보와 연계하여 챗봇 생성
- **챗봇 위치 및 속성 업데이트**: 시각화 및 이름 변경 등 설정 가능
- **OpenAI 기반 응답**: 챗봇의 성격에 따른 자동화된 짧은 응답 생성

### 판매 및 통계
- **제품별 판매 통계**: 총 판매 수량과 매출 계산
- **일일 매출 분석**: 최근 일주일 동안의 판매 데이터를 날짜별로 제공

---

## 설치 및 실행

### 요구사항
- **Node.js** (v14 이상)
- **MongoDB**

### 설치
1. 프로젝트를 클론합니다.
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```
2. 필요한 패키지를 설치합니다.
    ```bash
    npm install
    ```

3. `.env` 파일 설정:
    ```
    PORT=8080
    MONGODB_URI_PROD=<MongoDB 연결 URI>
    JWT_SECRET_KEY=<JWT 비밀키>
    GOOGLE_CLIENT_ID=<Google OAuth 클라이언트 ID>
    OPENAI_API_KEY=<OpenAI API 키>
    ```

### 실행
```bash
npm start
```

---

## API 문서

### 사용자 API
- **POST** `/api/user` - 사용자 생성
- **GET** `/api/user/me` - 현재 사용자 정보 조회
- **PUT** `/api/user/:id` - 사용자 정보 수정
- **DELETE** `/api/user/:id` - 사용자 삭제

### 인증 API
- **POST** `/api/auth/login` - 이메일/비밀번호를 통한 로그인
- **POST** `/api/auth/google` - Google OAuth 로그인

### 제품 API
- **POST** `/api/product` - 제품 생성
- **GET** `/api/product` - 제품 목록 조회
- **PUT** `/api/product/:id` - 제품 수정
- **DELETE** `/api/product/:id` - 제품 삭제

### 주문 API
- **POST** `/api/order` - 주문 생성
- **GET** `/api/order/me` - 현재 사용자 주문 조회
- **GET** `/api/order` - 주문 목록 조회

### 다이어리 API
- **POST** `/api/diary` - 다이어리 작성
- **GET** `/api/diary` - 다이어리 목록 조회
- **GET** `/api/diary/:id` - 다이어리 상세 조회
- **PUT** `/api/diary/:id` - 다이어리 수정
- **DELETE** `/api/diary/:id` - 다이어리 삭제
- **PATCH** `/api/diary/restore/:id` - 삭제된 다이어리 복구
- **GET** `/api/diary/filters` - 다이어리 필터 옵션 조회
- **GET** `/api/diary/deleted` - 삭제된 다이어리 목록 조회

### 댓글 API
- **POST** `/api/comment/create` - 댓글 작성
- **GET** `/api/comment/:diaryId` - 특정 다이어리의 댓글 조회

### 챗봇 API
- **POST** `/api/chatbot` - 챗봇 생성
- **GET** `/api/chatbot/me` - 사용자별 챗봇 목록 조회
- **PUT** `/api/chatbot/:id` - 챗봇 속성 수정
- **DELETE** `/api/chatbot/:id` - 챗봇 삭제
- **POST** `/api/chatbot/printLine` - OpenAI 챗봇 응답 생성

### 판매 통계 API
- **GET** `/api/sales/product` - 제품별 판매 통계
- **GET** `/api/sales/daily` - 일일 판매 통계

---

## 프로젝트 구조
- **`controllers/`**: API 요청을 처리하고 비즈니스 로직을 구현합니다.
- **`models/`**: Mongoose를 사용한 데이터베이스 스키마 정의가 포함됩니다.
- **`routes/`**: 각 API 엔드포인트와 해당 컨트롤러를 연결합니다.
- **`app.js`**: Express 서버를 초기화하고 미들웨어, 라우터, 데이터베이스를 설정합니다.
