@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
if not exist ".venv\Scripts\pythonw.exe" (
  echo Virtual environment not found. Run: uv sync
  pause
  exit /b 1
)
start "First" ".venv\Scripts\pythonw.exe" gui.py
