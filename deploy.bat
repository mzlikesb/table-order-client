@echo off
chcp 65001 >nul

echo 🚀 Table Order Client 배포 시작...

REM 1. 빌드
echo 📦 프로덕션 빌드 생성 중...
call npm run build

REM 2. Docker 이미지 빌드
echo 🐳 Docker 이미지 빌드 중...
docker build -t table-order-client .

REM 3. 기존 컨테이너 중지 및 제거
echo 🛑 기존 컨테이너 정리 중...
docker-compose down

REM 4. 새 컨테이너 실행
echo ▶️ 새 컨테이너 실행 중...
docker-compose up -d

REM 5. 상태 확인
echo ✅ 배포 완료!
echo 📊 컨테이너 상태:
docker-compose ps

echo 🌐 접속 URL: http://localhost:8080
echo 📝 로그 확인: docker-compose logs -f

pause 