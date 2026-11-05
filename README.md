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


## AI 추천 연결

이 변경은 지도 화면 `feature/map-main`과 백엔드 `feature/find-nearby`의 API를 기반으로 한다. 백엔드의 Gemini 설정을 마친 후 두 서버를 실행한다. 프론트에는 Gemini 키를 넣지 않는다.

- 지역 추천은 `/api/find/ai-recommendations`를 호출하고 `courseId`에 해당하는 설명만 **AI 추천 이유**로 표시한다. 주민 한마디와 분리해 표시한다. 지연·실패하면 기본 코스와 재확인 버튼을 보여준다. 창 포커스 변경에 따른 자동 재호출은 하지 않는다.
- 지도 주변 추천은 기본적으로 실제 `/api/find/nearby`를 호출한다. `aiGenerated: false`면 **거리 기준 기본 추천**으로 표시한다. 지도 경로·장소 정보는 선택한 응답 코스에서 가져온다.
- 오프라인 화면 시연은 `.env`에 `VITE_USE_NEARBY_MOCK=true`를 명시한 경우에만 사용한다. 가상 장소·좌표를 사용하고, **가상 데이터 데모**를 표시하며 AI를 호출했다고 표시하지 않는다. 이 값을 바꾼 후 Vite를 재시작한다. `.env.example`의 기본값은 `false`다.
- 백엔드 local 프로필의 코스·주민 이야기와 좌표 역시 시드 예시다. 실제 인터뷰/좌표 검증과 별개이며 운영 시에는 검증된 콘텐츠로 교체해야 한다.

검증: `npm run build`, `npm run lint`. 수동으로 지역·태그·시간 변경, 다른 코스 보기, AI 설명 미제공 시 재확인, 지도 주변 결과 및 데모/기본/AI 표시를 확인한다.
