# 동네 한 칸 Frontend

대구·경북에 새로 온 사람에게 주민의 일상을 코스로 잇는 서비스 "동네 한 칸"의 모바일 웹입니다.

## 기술 스택

React 19 · TypeScript · Vite · React Router · TanStack Query · axios

## 시작하기

```bash
cp .env.example .env
npm install
npm run dev     # http://localhost:5173
npm run build
npm run lint
```

개발 서버는 `/api` 요청을 `http://localhost:8080`의 백엔드로 넘깁니다.

## 폴더 구조

```text
src
├── app        라우터, 쿼리 클라이언트
├── pages      라우트별 화면
├── features
│   ├── find     찾기, 추천 결과
│   ├── course   코스 상세, 지도, 길찾기
│   ├── auth     로그인, 온보딩
│   └── my       나의 동네 한 칸
└── shared     공통 API 클라이언트(api), 공통 컴포넌트(ui), 유틸(lib)
```

각 feature 안은 `api`(요청 함수, 쿼리 훅)와 `components`로 나눕니다. 빈 폴더를 유지하는 `.gitkeep`은 파일을 추가할 때 지워도 됩니다.

## 라우트

| 경로 | 화면 |
| --- | --- |
| `/` | 오늘의 동네 찾기 |
| `/recommendations` | 추천 코스 목록 |
| `/courses/:courseId` | 코스 상세 |
| `/courses/:courseId/record` | 다녀옴·느낌 기록 |
| `/places/:placeId` | 장소·주민 이야기 |
| `/my` | 나의 동네 한 칸 |
| `/my/settings` | 내 정보, 로그아웃, 탈퇴 |
| `/my/records/:recordId/edit` | 기록 수정 |
| `/login` | 로그인 |
| `/signup` | 개인정보 수집·이용 동의 |
| `/oauth/kakao` | 카카오 로그인 리다이렉트 |

## API 규칙

요청은 `shared/api/client.ts`의 `apiClient`로 보내고, 응답 타입은 `shared/api/types.ts`를 씁니다.

- 성공 응답은 `{ data }`, 목록은 `data`가 `{ items, page, size, totalElements, hasNext }`입니다.
- 실패 응답은 `{ code, message, errors }`입니다.

## 남은 일

- 온보딩 화면, 관리 화면 (P1)

## 문서

기획 문서(PRD, 기능명세서, API명세서)는 팀 노션에 있습니다.
