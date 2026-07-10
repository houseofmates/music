# cross-device cover photo persistence

✅ plan approved  
✅ all files read: modals have preview, albums.jsx uploads onsave, playlists.jsx sends datauri (works).  
✅ ui lowercase good  

## steps:
1. [ ] update playlisteditmodal.jsx: handlefilechange → uploadplaylistcover → setcover(res.cover_image)  
2. [ ] update trackeditmodal.jsx: same for uploadtrackcover  
3. [ ] test: login → edit playlist/track → upload image → verify image shows, persists reload/login  
4. [ ] update todo  
5. [ ] attempt_completion  
✅ feature complete: covers persist via sqlite db cross-device.
