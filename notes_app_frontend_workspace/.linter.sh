#!/bin/bash
cd /home/kavia/workspace/code-generation/noteease-33114-f13ec41e/notes_app_frontend_workspace/notes_app_frontend
npx eslint
ESLINT_EXIT_CODE=$?
npm run build
BUILD_EXIT_CODE=$?
if [ $ESLINT_EXIT_CODE -ne 0 ] || [ $BUILD_EXIT_CODE -ne 0 ]; then
   exit 1
fi

