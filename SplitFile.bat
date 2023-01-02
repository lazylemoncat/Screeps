@echo off
title %0
color 02
setlocal EnableDelayedExpansion

md Role Structure
for /f "delims=" %%i in ('dir /b/a-d/oN *.*') do (
	set str=%%~nxi
	set str=!str:~0,4!
	if !str!==Role (
		copy %%i .\role
	)
	set str=%%~nxi
	set str=!str:~0,9!
	if !str!==Structure (
		copy %%i .\Structure
	)
)
pause