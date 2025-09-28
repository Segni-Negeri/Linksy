@echo off
REM API Smoke Tests for Linksy (Windows batch version)
REM Tests basic API endpoints to ensure they return expected status codes

set BASE_URL=http://localhost:3000
set TESTS_PASSED=0
set TESTS_FAILED=0

echo 🚀 Starting API smoke tests for Linksy
echo ========================================

REM Test 1: Hello endpoint
echo Testing Hello endpoint...
curl -s -w "%%{http_code}" -X GET "%BASE_URL%/api/hello" > temp_response.txt
for /f %%i in (temp_response.txt) do set STATUS=%%i
if "%STATUS%"=="200" (
    echo ✅ PASS (200)
    set /a TESTS_PASSED+=1
) else (
    echo ❌ FAIL (expected 200, got %STATUS%)
    set /a TESTS_FAILED+=1
)
del temp_response.txt

REM Test 2: Public link endpoint
echo Testing Public link endpoint...
curl -s -w "%%{http_code}" -X GET "%BASE_URL%/api/links/slug/nonexistent" > temp_response.txt
for /f %%i in (temp_response.txt) do set STATUS=%%i
if "%STATUS%"=="404" (
    echo ✅ PASS (404)
    set /a TESTS_PASSED+=1
) else (
    echo ❌ FAIL (expected 404, got %STATUS%)
    set /a TESTS_FAILED+=1
)
del temp_response.txt

REM Test 3: Protected endpoints without auth
echo Testing Links list without auth...
curl -s -w "%%{http_code}" -X GET "%BASE_URL%/api/links" > temp_response.txt
for /f %%i in (temp_response.txt) do set STATUS=%%i
if "%STATUS%"=="401" (
    echo ✅ PASS (401)
    set /a TESTS_PASSED+=1
) else (
    echo ❌ FAIL (expected 401, got %STATUS%)
    set /a TESTS_FAILED+=1
)
del temp_response.txt

REM Test 4: Visit tracking
echo Testing Visit tracking...
curl -s -w "%%{http_code}" -X POST -d "{}" "%BASE_URL%/api/visits" > temp_response.txt
for /f %%i in (temp_response.txt) do set STATUS=%%i
if "%STATUS%"=="400" (
    echo ✅ PASS (400)
    set /a TESTS_PASSED+=1
) else (
    echo ❌ FAIL (expected 400, got %STATUS%)
    set /a TESTS_FAILED+=1
)
del temp_response.txt

REM Test 5: Invalid methods
echo Testing Invalid method on hello...
curl -s -w "%%{http_code}" -X POST "%BASE_URL%/api/hello" > temp_response.txt
for /f %%i in (temp_response.txt) do set STATUS=%%i
if "%STATUS%"=="405" (
    echo ✅ PASS (405)
    set /a TESTS_PASSED+=1
) else (
    echo ❌ FAIL (expected 405, got %STATUS%)
    set /a TESTS_FAILED+=1
)
del temp_response.txt

echo.
echo ========================================
echo 📊 Test Results:
echo ✅ Passed: %TESTS_PASSED%
echo ❌ Failed: %TESTS_FAILED%

if %TESTS_FAILED%==0 (
    echo 🎉 All tests passed!
    exit /b 0
) else (
    echo 💥 Some tests failed!
    exit /b 1
)
