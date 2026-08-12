@echo off
chcp 65001 >nul
echo ==========================================
echo   万科朗拾花语 · 6-5 地块 小程序启动器
echo ==========================================
echo.

REM 启动后端服务器
echo [1/2] 正在启动数据后端服务 (端口 3002)...
start "后端服务器" cmd /k "cd /d D:\KimiData\kimi\workspace\community-app\server && node index.cjs"

ping 127.0.0.1 -n 3 >nul

REM 启动前端开发服务器
echo [2/2] 正在启动前端预览服务 (端口 7100)...
start "前端服务器" cmd /k "cd /d D:\KimiData\kimi\workspace\community-app && npm run dev -- --port 7100"
echo.
echo ==========================================
echo  服务已启动！
echo.
echo  前端访问: http://localhost:7100
echo  后端 API: http://localhost:3002
echo.
echo  数据接口:
echo    POST /api/survey      - 提交问卷
echo    GET  /api/surveys     - 查看所有数据
echo    GET  /api/stats       - 统计概览
echo    GET  /api/export/csv  - 导出 CSV
echo.
echo  数据文件: server/data/surveys.json
echo ==========================================
pause