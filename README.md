# PeachPitch
### SSAFY 12기 공통 프로젝트 - D201 Team 노 피카 킵고잉

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/landingpage.gif?ref_type=heads" />

> 스몰톡을 연습하고 싶지만, 사람과의 직접적인 대화는 아직 부담스러운 사용자들을 위한 스피킹 연습 서비스를 제공합니다.


<br />

## 목차

1. [**서비스 소개**](#1)
1. [**데모 영상**](#2)
1. [**주요 기능**](#3)
1. [**개발 환경**](#4)
1. [**프로젝트 산출물**](#5)
1. [**프로젝트 진행**](#6)
1. [**모니터링 통계**](#7)
1. [**개발 일정**](#8)
1. [**기타 산출물**](#9)
1. [**팀원 소개**](#10)


<br />

<div id="1"></div>

## 💁 서비스 소개



> 스몰토크가 어려운 사람들을 위한 스피킹 연습 서비스 PeachPitch

<br />


현대 사회에서 원활한 커뮤니케이션 능력은 개인의 사회적, 직업적 성공에 중요한 요소로 작용하고 있습니다. 특히 처음 만나는 사람과의 대화, 즉 스몰토크(small talk)는 인간관계 형성의 시작점이지만, 많은 사람들이 이를 어려워합니다. 스몰토크에 대한 부담감은 사회적 불안으로 이어질 수 있으며, 원활한 대화를 하지 못하는 경우 새로운 관계 형성이 어렵거나 기회를 놓칠 가능성이 큽니다. 이에 따라, 스몰토크를 보다 쉽게 접근할 수 있도록 돕는 서비스의 필요성이 증가하고 있습니다.

<br />

#### 스몰토크의 사회적 필요성
스몰토크는 단순한 대화 이상의 의미를 지니며, 타인과의 친밀감을 형성하는 중요한 수단입니다. 특히, 비대면 커뮤니케이션이 증가하는 현대 사회에서는 오프라인에서의 자연스러운 대화 능력이 더욱 중요해지고 있으며, 이를 효과적으로 연습할 수 있는 환경이 필요합니다.

#### 심리적 부담 완화
AI와의 대화를 통해 사용자가 부담 없이 연습할 수 있는 환경을 제공함으로써 심리적 장벽을 낮추는 데 도움을 줍니다. 또한, 1:1 매칭 대화를 통해 실제 사용자와 대화하며 실전 경험을 쌓을 수 있어 자연스러운 대화 능력을 키울 수 있습니다.

#### 접근성 향상
WebRTC 기술을 활용하여 안정적인 화상 채팅을 제공하며, NLP 기반 RAG 기법을 적용해 최신 대화 주제를 반영하여 자연스러운 챗봇 경험을 제공합니다.

<br />

### 서비스 설명 (주요 기능)

1. AI 대화 서비스 : AI와의 스몰토크를 통해 낯선 사람과의 대화 거부감을 줄이고, 자연스러운 스몰토크 연습 가능
2. 1:1 매칭 대화 서비스 : 실제 다른 사용자와 매칭되어 다양한 키워드를 선택하고, 실제 상황처럼 연습 가능
3. 대화 분석 리포트 서비스 : AI의 피드백으로 스몰토크 실력 향상 및 사용자 편의성 제공

<br />

### 프로젝트 차별점/독창성

1. WebRTC를 활용하여 실시간으로 안정적인 스몰토크 화상채팅 기능을 제공하며, 데이터 손실 없이 원활한 통신이 가능하도록 구현
2. RAG 기법을 적용하여 최신 대화 주제 반영, 대화 흐름 최적화를 위한 NLP 기법을 적용해 자연스러운 챗봇 구현
3. 브라우저 핑거프린트를 사용하여 사용자 고유 식별자를 생성하고, Redis를 통해 이 정보를 효율적으로 관리하여 빠른 데이터 접근 및 효율성을 증대
4. 블루그린 무중단 배포를 통한 안정적인 서비스 운영 (+ 모니터링 + 테스트)

<br />


<br />


<div id="2"></div>

## 🎥 데모 영상


[영상 포트폴리오 보러가기](https://youtu.be/SPx0m9INxpE)

<br /><br />


<div id="3"></div>

## 💡 주요 기능


gif 넣고 기술 설명

### AI 스몰토크
<img src="https://github.com/sweethyom/peachpitch/blob/release/img/func_video_1.gif?ref_type=heads" />

<br /><br />

### 1대1 스몰토크
<img src="https://github.com/sweethyom/peachpitch/blob/release/img/func_video_2.gif?ref_type=heads" />

<br /><br />

### 분석 리포트 (전체)
<img src="https://github.com/sweethyom/peachpitch/blob/release/img/func_video_3.gif?ref_type=heads" />

<br /><br />

### 분석 리포트 (AI 대화)
<img src="https://github.com/sweethyom/peachpitch/blob/release/img/func_video_4.gif?ref_type=heads" />

<br /><br />

### 분석 리포트 (1대1 대화)
<img src="https://github.com/sweethyom/peachpitch/blob/release/img/func_video_5.gif?ref_type=heads" />

<br /><br />

### 비회원 핑거프린트
<img src="https://github.com/sweethyom/peachpitch/blob/release/img/func_video_6.gif?ref_type=heads" />

<br /><br />

### 채팅관리
<img src="https://github.com/sweethyom/peachpitch/blob/release/img/func_video_7.gif?ref_type=heads" />

<br /><br />

### 로그인(일반)
<img src="https://github.com/sweethyom/peachpitch/blob/release/img/func_video_8.gif?ref_type=heads" />

<br /><br />

### 로그인(카카오)
<img src="https://github.com/sweethyom/peachpitch/blob/release/img/func_video_9.gif?ref_type=heads" />

<br /><br />

### 결제 (카카오 api)
<img src="https://github.com/sweethyom/peachpitch/blob/release/img/func_video_10.gif?ref_type=heads" />

<br /><br />

### 24시간 이후 무료 쿠폰 받기
<img src="https://github.com/sweethyom/peachpitch/blob/release/img/func_video_11.gif?ref_type=heads" />

<br /><br />

### 블루그린 배포

<br /><br />

### 키워드 랭킹
<img src="https://github.com/sweethyom/peachpitch/blob/release/img/%ED%82%A4%EC%9B%8C%EB%93%9C%20%EB%9E%AD%ED%82%B9.png?ref_type=heads" width="700" />

<br />
<br />

### 랜덤 스크립트

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/%EB%9E%9C%EB%8D%A4%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8.png?ref_type=heads" width="500" />


<br /><br />
<br />


<div id="4"></div>

## 🛠 개발 환경


### 백엔드
![Spring Boot Badge](https://img.shields.io/badge/Spring%20Boot-6DB33F?logo=springboot&logoColor=fff&style=flat-square)
![Django Badge](https://img.shields.io/badge/django-092E20?style=flat-square&logo=django&logoColor=fff)
![MySQL Badge](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=fff&style=flat-square)
![Redis Badge](https://img.shields.io/badge/redis-FF4438?style=flat-square&logo=redis&logoColor=fff)

### 프론트엔드
![React Badge](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000&style=flat-square)
![TypeScript Badge](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff&style=flat-square)

### 인프라
![AWS EC2 Badge](https://img.shields.io/badge/amazonec2-FF9900?logo=amazonec2&logoColor=fff&style=flat-square)
![Ubuntu Badge](https://img.shields.io/badge/Ubuntu-E95420?logo=ubuntu&logoColor=fff&style=flat-square)
![Docker Badge](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff&style=flat-square)
![Nginx Badge](https://img.shields.io/badge/nginx-009639?style=flat-square&logo=nginx&logoColor=fff)
![Jenkins Badge](https://img.shields.io/badge/jenkins-D24939?style=flat-square&logo=jenkins&logoColor=fff)

### 디자인
![Figma Badge](https://img.shields.io/badge/Figma-F24E1E?logo=figma&logoColor=fff&style=flat-square)

### 상태 관리
![Gitlab Badge](https://img.shields.io/badge/gitlab-FC6D26?style=flat-square&logo=gitlab&logoColor=fff)
![Jira Badge](https://img.shields.io/badge/Jira-0052CC?logo=jira&logoColor=fff&style=flat-square)
![Mattermost Badge](https://img.shields.io/badge/Mattermost-0058CC?logo=mattermost&logoColor=fff&style=flat-square)


### 모니터링
![Grafana Badge](https://img.shields.io/badge/grafana-F46800?style=flat-square&logo=grafana&logoColor=fff)
![Prometheus Badge](https://img.shields.io/badge/prometheus-E6522C?style=flat-square&logo=prometheus&logoColor=fff)




<br />


<div id="5"></div>

## 🎈 프로젝트 산출물


### 요구사항 정의서

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/%EC%9A%94%EA%B5%AC%EC%82%AC%ED%95%AD%EB%AA%85%EC%84%B8%EC%84%9C1.png?ref_type=heads" width="700" />

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/%EC%9A%94%EA%B5%AC%EC%82%AC%ED%95%AD%EB%AA%85%EC%84%B8%EC%84%9C2.png?ref_type=heads" width="700" />

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/%EC%9A%94%EA%B5%AC%EC%82%AC%ED%95%AD%EB%AA%85%EC%84%B8%EC%84%9C3.png?ref_type=heads" width="700" />

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/%EC%9A%94%EA%B5%AC%EC%82%AC%ED%95%AD%EB%AA%85%EC%84%B8%EC%84%9C4.png?ref_type=heads" width="700" />

<br /><br />

### 와이어프레임

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/wireframe.png?ref_type=heads" width="700" />

<br /><br />

### ERD 다이어그램

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/erd.png?ref_type=heads" width="700" />


<br /><br />

### 시스템 아키텍처

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/%EC%8B%9C%EC%8A%A4%ED%85%9C%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98.png?ref_type=heads" width="700" />

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/%EC%8B%9C%EC%8A%A4%ED%85%9C2D%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98.png?ref_type=heads" width="700" />


<br /><br />

### API 명세서

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/api%EB%AA%85%EC%84%B8%EC%84%9C1.png?ref_type=heads" width="700" />

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/api%EB%AA%85%EC%84%B8%EC%84%9C2.png?ref_type=heads" width="700" />

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/api%EB%AA%85%EC%84%B8%EC%84%9C3.png?ref_type=heads" width="700" />

<br />
<br /><br />

<div id="6"></div>

## ✏ 프로젝트 진행


### Notion

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/notion1.png?ref_type=heads" width="700" />

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/notion2.png?ref_type=heads" width="700" />

<br />
<br />

### Jira
### Git
<img src="https://github.com/sweethyom/peachpitch/blob/release/img/jira.gif" width="700" />

<br />
<br />

### Git
<img src="https://github.com/sweethyom/peachpitch/blob/release/img/sourceTree.gif" width="700" />

<br />
<br />
<br />

<div id="7"></div>

## 📊 모니터링 통계


prometheus, grafana, locust 사용

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/grafana.png?ref_type=heads" width="700" />

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/locust1.png?ref_type=heads" width="700" />

<img src="https://github.com/sweethyom/peachpitch/blob/release/img/locust2.png?ref_type=heads" width="700" />

<br />

<details>
<summary>부하테스트 분석 결과</summary>
<div markdown="1">

### **웹사이트 동시 수용 가능 사용자 수 분석**

테스트 데이터를 기반으로 웹사이트가 **몇 명의 동시 사용자를 수용할 수 있는지** 계산해볼게.

* * *

### **1\. 테스트 결과 요약**

*   **평균 응답 시간**: 16.84ms (0.01684초)
*   **최대 응답 시간**: 1,100ms (1.1초)
*   **초당 처리 요청 수 (RPS, Requests Per Second)**: **약 494건**
*   **502 오류율**: **10.7% (부하 증가 시 서버 과부하 발생 가능)**

* * *

### **2\. 동시 접속 가능 인원 계산**

동시 접속 가능 인원(Concurrent Users)은 다음 공식을 사용해서 계산할 수 있어.

동시 사용자 수\=RPS×평균 응답 시간(초)\\text{동시 사용자 수} = \\text{RPS} \\times \\text{평균 응답 시간(초)}

즉, 한 사용자가 요청을 보내고 응답을 받을 때까지 걸리는 시간 동안 몇 명의 사용자가 동시에 요청을 보낼 수 있는지를 계산하는 방식이야.

#### **1) 평균 응답 시간을 기준으로 계산**

494×0.01684\=8.32≈8명494 \\times 0.01684 = \\mathbf{8.32} \\approx 8명

✅ **8명 정도가 동시에 요청을 보내는 경우 안정적으로 서비스 가능**

#### **2) 최대 응답 시간을 기준으로 계산 (서버 부하 상황)**

494×1.1\=543.4≈543명494 \\times 1.1 = \\mathbf{543.4} \\approx 543명

⚠️ **최대 543명까지 동시 접속 가능하지만, 이 경우 일부 요청이 1초 이상 지연될 가능성이 있음.**

* * *

### **3\. 502 오류를 감안한 실제 수용 인원**

502 오류율(10.7%)을 고려하면 실제로 안정적으로 서비스할 수 있는 인원은 줄어들어.

안정적인 동시 사용자 수\=이론적 동시 사용자 수×(1−오류율)\\text{안정적인 동시 사용자 수} = \\text{이론적 동시 사용자 수} \\times (1 - \\text{오류율})

*   **평균 응답 시간 기준**:  
    8×(1−0.107)\=8×0.893\=7.148 \\times (1 - 0.107) = 8 \\times 0.893 = \\mathbf{7.14} → **약 7명**
*   **최대 응답 시간 기준**:  
    543×0.893\=485명543 \\times 0.893 = \\mathbf{485명} → **최대 485명까지 가능하지만 성능 저하 가능성 있음**

* * *

### **4\. 결론**

✅ **안정적인 동시 접속 가능 인원:** **약 7명**  
✅ **최대 동시 접속 가능 인원 (최적화 필요):** **약 485명**  
⚠️ **현재 설정으로는 500명 이상 동시 접속 시 502 오류 발생 가능**

* * *

### **5\. 개선 방안 (더 많은 사용자 수용을 원할 경우)**

*   **로드 밸런서 추가**: 여러 서버에 트래픽을 분산하여 처리량 증가
*   **DB 캐싱 적용**: Redis, Memcached 사용해 로그인 요청 처리 속도 개선
*   **서버 증설 (Auto Scaling 적용)**: 트래픽이 많아질 때 자동으로 서버 수 늘리기
*   **비동기 처리 적용**: 로그인 요청을 비동기 처리하여 성능 개선

이렇게 하면 **최대 1,000~2,000명까지도 동시 접속 가능하도록 확장 가능**해.  
추가로 서버 자원(CPU, RAM) 모니터링하면서 부하 분산 전략을 적용하는 게 중요해! 🚀

</div>
</details>


<br />


<div id="8"></div>

## 📅 개발 일정


개발 기간: 2025.01.13 ~ 2025.02.21

모니터링 기간: 2025.02.21 ~ 2025.02.25

<br />



<div id="9"></div>

## 👷 기타 산출물


[포팅 메뉴얼 보러가기](exec/PortingManual.md)

[덤프 파일 최신본 보러가기](exec/덤프파일최신본.sql)

[시연 시나리오 보러가기](exec/시연시나리오.pptx)

<br />
<br />


<div id="10"></div>

## 👪 팀원 소개



| 이름   |  출신 | 별자리 | MBTI(호소) | 역할         | 특징 |
| :--: |  :--: |:--: |:--: | :-- | :--: |
| 김미경 |  제주 | 👭 | INFP | 팀장, 프론트엔드, 디자인 |   사장님   |
| 김민주 |  대구 | 🍶 | ISTP | 팀원, 백엔드 |   히트맨   |
| 이한나 |  서울 | 🐂 | ENFJ | 팀원, AI, 백엔드 |   여주   |
| 이효미 |  대구 | 👩 | INFJ | 팀원, 백엔드 |   래퍼   |
| 정유선 |  상주 | 👭 | ENTJ | 팀원, DevOps, 영상편집 |   휴먼리소스   |
| 최지원 |  창원 | 🐂 | ENTJ | 팀원, 백엔드 |   칼단발   |

<br />

<table>
  <tr>
    <td align="center" width="150px">
      <a href="https://github.com/" target="_blank">
        <img src="https://github.com/sweethyom/peachpitch/blob/release/img/migyeng.png?ref_type=heads" alt="김미경 프로필" />
      </a>
    </td>
    <td align="center" width="150px">
      <a href="https://github.com/" target="_blank">
        <img src="https://github.com/sweethyom/peachpitch/blob/release/img/minju.png?ref_type=heads" alt="김민주 프로필" />
      </a>
    </td>
    <td align="center" width="150px">
      <a href="https://github.com/" target="_blank">
        <img src="https://github.com/sweethyom/peachpitch/blob/release/img/hanna.png?ref_type=heads" alt="이한나 프로필" />
      </a>
    </td>
    <td align="center" width="150px">
      <a href="https://github.com/" target="_blank">
        <img src="https://github.com/sweethyom/peachpitch/blob/release/img/hyomy.png?ref_type=heads" alt="이효미 프로필" />
      </a>
    </td>
    <td align="center" width="150px">
      <a href="https://github.com/" target="_blank">
        <img src="https://github.com/sweethyom/peachpitch/blob/release/img/yuseon.png?ref_type=heads" alt="정유선 프로필" />
      </a>
    </td>
    <td align="center" width="150px">
      <a href="https://github.com/" target="_blank">
        <img src="https://github.com/sweethyom/peachpitch/blob/release/img/jiwon.png?ref_type=heads" alt="최지원 프로필" />
      </a>
    </td>
  </tr>
  <tr>
    <td align="center">
      <a href="https://github.com/" target="_blank">
        김미경<br />(Frontend & 팀장)
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/" target="_blank">
        김민주<br />(Backend)
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/" target="_blank">
        이한나<br />(AI)
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/" target="_blank">
        이효미<br />(Backend)
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/" target="_blank">
        정유선<br />(Infra)
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/">
        최지원<br />(Backend)
      </a>
    </td>
  </tr>
</table>

<br />

<br />

|  이름  |        역할        | <div align="center">개발 내용</div>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| :----: | :----------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 김미경 | Frontend<br />팀장 | - 리액트 기반 프론트엔드 구현<br />&nbsp;&nbsp;&nbsp;&nbsp;- Recoil과 React Router를 활용하여 페이지 간 상태 관리 및 라우팅 처리<br />&nbsp;&nbsp;&nbsp;&nbsp;- SCSS를 사용한 스타일링 및 반응형 UI 구성<br />- 음성 인식 & AI 음성 출력<br />&nbsp;&nbsp;&nbsp;&nbsp;-react-speech-recognition → 음성 인식(STT, Speech-to-Text) 처리<br />&nbsp;&nbsp;&nbsp;&nbsp;- Google API Text-to-Speech → AI 음성 출력을 통한 자연스러운 대화 구현<br />- 데이터 시각화 (대화 분석 및 통계)<br />&nbsp;&nbsp;&nbsp;&nbsp;- chart.js → 누적 가로 막대 그래프 구현<br />&nbsp;&nbsp;&nbsp;&nbsp;- react-chartjs-2 → 도넛 그래프 생성<br />&nbsp;&nbsp;&nbsp;&nbsp;- d3 → 데이터 시각화 (추가적인 분석용 그래프 생성)<br/>&nbsp;&nbsp;&nbsp;&nbsp;- ECharts → 워드 클라우드 분석을 통한 키워드 시각화<br />- 비디오 및 얼굴 인식<br />&nbsp;&nbsp;&nbsp;&nbsp;- MediaPipe AI 기반 Vision 모델을 활용하여 얼굴 인식 기능 구현<br />- 기타 기능 구현<br/>&nbsp;&nbsp;&nbsp;&nbsp;- axios → 비동기 API 통신 처리<br />&nbsp;&nbsp;&nbsp;&nbsp;- Recoil을 활용한 전역 상태 관리 및 데이터 캐싱<br />&nbsp;&nbsp;&nbsp;&nbsp;- SCSS를 활용한 모듈화된 스타일링                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 김민주 |      Backend      | -DB 설계<br />-API 명세 작성<br />-키워드, 힌트 csv 데이터 DB에 저장<br />-Spring Boot와 WebSocket, WebRTC를 이용한 1:1 화상 대화 기능 구현<br />&nbsp;&nbsp;&nbsp;&nbsp;-STOMP로 실시간 매칭 기능 구현<br />&nbsp;&nbsp;&nbsp;&nbsp;-STOMP로 실시간 키워드 선택 기능 구현<br />&nbsp;&nbsp;&nbsp;&nbsp;-Openvidu(WebRTC) 세션 생성 및 토큰 전달<br />&nbsp;&nbsp;&nbsp;&nbsp;-Spring Event Listener로 자동 종료 및 상대방 접속 종료 시 강제 종료 기능 구현<br />&nbsp;&nbsp;&nbsp;&nbsp;-Spring Event Listener로 실시간 대화 내용 화면에 반영하는 기능 구현<br />-TypeScript, React와 STOMP를 이용한 1:1 화상 대화 기능 구현<br />&nbsp;&nbsp;&nbsp;&nbsp;-실시간 키워드 선택 및 매칭 기능 구현<br />&nbsp;&nbsp;&nbsp;&nbsp;-키워드에 따른 힌트 제공 기능 구현<br />&nbsp;&nbsp;&nbsp;&nbsp;-STOMP 웹소켓 연결<br />&nbsp;&nbsp;&nbsp;&nbsp;-react-speech-recognition으로 1:1 대화 중 stt로 대화 내용 서버 전송 기능 구현<br />&nbsp;&nbsp;&nbsp;&nbsp;-피드백 전송 기능 구현<br />&nbsp;&nbsp;&nbsp;&nbsp;-채팅 저장 및 리포트 생성 요청 기능 구현<br />-Spring Boot로 RESTful API 작성<br />&nbsp;&nbsp;&nbsp;&nbsp;-대화 내역 업데이트 서비스 도메인 개발<br />&nbsp;&nbsp;&nbsp;&nbsp;-AI 채팅 요청 서비스 도메인 개발<br />&nbsp;&nbsp;&nbsp;&nbsp;-랜덤 키워드 제공 서비스 도메인 개발<br />&nbsp;&nbsp;&nbsp;&nbsp;-많이 선택된 키워드 랭킹 서비스 도메인 개발<br />&nbsp;&nbsp;&nbsp;&nbsp;-키워드 선택 서비스 도메인 개발<br />&nbsp;&nbsp;&nbsp;&nbsp;-1:1 채팅 후 피드백 기능 서비스 도메인 개발<br />-Openvidu 배포 및 연결 자체 테스팅 진행<br />                                                                                                                                                                                                                                                                                                                                                                        |
| 이한나 |      AI      | - DB 설계<br />- API 명세서 설계<br />- 대화 데이터 수집 및 전처리<br />&nbsp;&nbsp;&nbsp;&nbsp;- 학습 데이터 생성<br />&nbsp;&nbsp;&nbsp;&nbsp;- 학습 데이터 수집<br />&nbsp;&nbsp;&nbsp;&nbsp;- 데이터 전처리<br />- 1:1 대화 기능 AI 모델 개발 (chatAI)<br />&nbsp;&nbsp;&nbsp;&nbsp;- GPT 기반 Transformer 모델을 활용하여 자연스러운 한국어 대화 생성<br />&nbsp;&nbsp;&nbsp;&nbsp;- Redis 기반 대화 세션 관리 및 Google API를 활용한 검색 기반 답변 강화<br />- 문장 복원 AI 모델 개발 (refineAI)<br />&nbsp;&nbsp;&nbsp;&nbsp;- STT로 받아온 문장을 복원하고, 질문과 답변을 자동 분류<br />&nbsp;&nbsp;&nbsp;&nbsp;- reportAI 및 wordAI와 연계하여 대화 분석 및 언어 습관 분석 지원<br />- 대화 분석 AI 모델 (reportAI)<br />&nbsp;&nbsp;&nbsp;&nbsp;- 사용자 대화를 분석하여 강점, 개선점, 종합 피드백 제공<br />&nbsp;&nbsp;&nbsp;&nbsp;- GPT 기반 분석을 활용한 자동 피드백 생성 및 Redis Polling 기반 비동기 처리<br />- 언어 습관 분석 AI 모델 (wordAI)<br />&nbsp;&nbsp;&nbsp;&nbsp;- 대화 데이터를 분석하여 자주 사용하는 단어 및 언어 습관을 파악<br />&nbsp;&nbsp;&nbsp;&nbsp;- 불필요한 단어 필터링 및 Django ORM을 활용한 데이터베이스 업데이트<br />                                         |
| 이효미 |     Backend      | - DB 설계<br />-결제 시스템 및 쿠폰 관리<br />&nbsp;&nbsp;&nbsp;&nbsp;- 카카오페이 API 연동을 통한 온라인 결제 서비스 구현<br />&nbsp;&nbsp;&nbsp;&nbsp;- Redis를 활용한 쿠폰 시스템 구현<br />&nbsp;&nbsp;&nbsp;&nbsp;- 무료/유료 쿠폰 분리 관리<br />&nbsp;&nbsp;&nbsp;&nbsp;- 만료 기간 및 사용 조건 자동화<br />&nbsp;&nbsp;&nbsp;&nbsp;- AI 대화 서비스 연계 쿠폰 우선 적용<br />- 비회원 서비스 관리<br />&nbsp;&nbsp;&nbsp;&nbsp;- FingerprintJS를 활용한 브라우저 핑거프린팅 구현<br />&nbsp;&nbsp;&nbsp;&nbsp;- Redis 기반 비회원 접근 제어 시스템 구축<br />-실시간 채팅 시스템<br />&nbsp;&nbsp;&nbsp;&nbsp;- Redis와 MySQL을 연계한 하이브리드 채팅 데이터 관리<br />&nbsp;&nbsp;&nbsp;&nbsp;- Django-Spring 연동 채팅 데이터 동기화<br />&nbsp;&nbsp;&nbsp;&nbsp;- AI 채팅: Django → Redis → Spring → MySQL<br />&nbsp;&nbsp;&nbsp;&nbsp;- 사용자 채팅: Spring → Redis → MySQL<br />- 대화 분석 및 리포트<br />&nbsp;&nbsp;&nbsp;&nbsp;- 전체/개별 대화 리포트 조회 기능 구현<br />&nbsp;&nbsp;&nbsp;&nbsp;- 랜덤 스크립트 기능을 통한 채팅 내용 재활용<br />    |
| 정유선 |     DevOps      | - DB 설계<br />- 시스템 아키텍처 설계<br />- AI 데이터 생성<br />&nbsp;&nbsp;&nbsp;&nbsp;- 학습 데이터 생성<br />&nbsp;&nbsp;&nbsp;&nbsp;- 힌트 더미데이터 생성<br />&nbsp;&nbsp;&nbsp;&nbsp;- 이미지 데이터 생성<br />- 블루그린 무중단 배포 (CI/CD)<br />&nbsp;&nbsp;&nbsp;&nbsp;- nginx<br />&nbsp;&nbsp;&nbsp;&nbsp;- jenkins<br />&nbsp;&nbsp;&nbsp;&nbsp;- springboot (blue/green), django (blue/green)<br />&nbsp;&nbsp;&nbsp;&nbsp;- mysql, redis<br />&nbsp;&nbsp;&nbsp;&nbsp;- openvidu<br />&nbsp;&nbsp;&nbsp;&nbsp;- deploy.sh 자동화<br />&nbsp;&nbsp;&nbsp;&nbsp;- 모니터링(prometheus, grafana, google analytics)<br />- 배포 환경에서의 에러 및 기타 백/프론트 에러 픽스<br />- 산출물 제작<br />&nbsp;&nbsp;&nbsp;&nbsp;- 영상 시나리오 작성,촬영, 제작 <br />&nbsp;&nbsp;&nbsp;&nbsp;- README 작성<br />&nbsp;&nbsp;&nbsp;&nbsp;- 포팅 메뉴얼 작성<br />&nbsp;&nbsp;&nbsp;&nbsp;- 튜토리얼 작성                                                                                                                                                                                                       |
| 최지원 |     Backend      | - DB 설계<br />- Swagger UI를 활용한 API 문서 자동화<br />- Spring Security 기반 인증/인가 시스템 구축<br />- JWT 기반 토큰 인증 시스템 설계 및 구현<br />- Redis 활용 토큰 관리<br />- JWT Blacklist를 통한 중복 로그인 방지<br />- OAuth2.0 사용 카카오 소셜 로그인 연동<br />- 회원 CRUD 기능 구현<br />- 비밀번호 암호화 적용<br />                                                                                                                                                                                                                                                                                                    |

<br />
