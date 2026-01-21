# Music Room Project - Review Checklist

Based on the official evaluation criteria from music-room-correction.pdf

## ⚠️ Critical Rules
- [ ] All credentials, API keys, environment variables are in `.env` file only
- [ ] No credentials or API keys in git repository (outside `.env`)
- [ ] Git repository matches the student/group and project
- [ ] No malicious aliases used
- [ ] All necessary elements present (server source code, DB initialization, mobile project)

---

## 1. Solution Setup

### Prerequisites
- [ ] Server source code present
- [ ] Database initialization file present
- [ ] Mobile project(s) present
- [ ] All credentials in `.env` file (created during evaluation)
- [ ] Solution can be set up on evaluation machine
- [ ] Solution starts without code errors

**⚠️ If any element is missing or solution doesn't start, evaluation stops with grade 0**

---

## 2. Technical Choices

### Storage
- [ ] Technical choices for data storage are consistent
- [ ] Storage solution is used correctly
- [ ] Solution has proven effectiveness
- [ ] Solution can scale/increase in capacity

### Server
- [ ] Technical choices for server are consistent
- [ ] Server solution is used correctly
- [ ] Solution has proven effectiveness
- [ ] Solution can scale/increase in capacity

### Backend Security
- [ ] Storage system only accessible from server (and admin tool)
- [ ] API is the only exposed access point
- [ ] Information control mechanisms implemented
- [ ] Input validation on API requests

### Backend Ramp-up (Load Testing)
- [ ] Ramp-up capacity has been measured
- [ ] Measurement based on allocated physical resources
- [ ] Load testing tool used to simulate concurrent users
- [ ] Documentation of load testing results

---

## 3. API Evaluation

### Technical Choices
- [ ] API follows proven principles (REST or similar)
- [ ] Data exchange format is proven (JSON or similar)
- [ ] Technical choices are consistent
- [ ] Technical choices are used accurately

### Consistency
- [ ] All API functionalities follow common naming logic
- [ ] All API functionalities follow common structure
- [ ] API designed as a cohesive whole
- [ ] Special care for consistency, simplicity, and clarity

### Documentation
- [ ] All API functionalities are documented
- [ ] Documentation covers all endpoints used by mobile app
- [ ] Documentation available from a defined URL
- [ ] Documentation is accessible and complete

---

## 4. Mobile Application Evaluation

### Technical Choices
- [ ] Uses existing framework
- [ ] Relies on proven patterns (MVC or similar)
- [ ] Coded in native language (Swift, Java, C# with Xamarin)
- [ ] **NOT** hybrid programming (Cordova, PhoneGap, Ionic)
- [ ] Technical choices are consistent
- [ ] Technical choices are used accurately

### Social External SDK Integration
- [ ] Integrated at least one social SDK (Facebook or Google)
- [ ] Users can log in with social account
- [ ] Users can link social information

### External Music API/SDK Integration
- [ ] Integrated music API or SDK (YouTube, Deezer, Spotify)
- [ ] Enhanced musical experience provided
- [ ] Integration works correctly

### User Account Management
- [ ] User can access all their information
- [ ] User can update their information
- [ ] Personal information management
- [ ] Preferences and settings management
- [ ] Friends management
- [ ] Playlists management
- [ ] Devices management
- [ ] Permissions management

### User Experience Quality
- [ ] Interface decisions tested from user perspective
- [ ] Product tested with other users
- [ ] Feedback and critiques collected
- [ ] UX improvements implemented based on feedback

---

## 5. Evaluation of Proposed Services

**Evaluate 2 out of 3 functionalities:**

### Option A: Music Track Vote

#### Basics
- [ ] Service is accessible
- [ ] Service works correctly
- [ ] Multiple users can vote for tracks in event context
- [ ] Tracks with most votes play first (ordered by vote count)
- [ ] Concurrency management supported

#### Visibility Management
- [ ] Event creator can set event visibility
- [ ] Public visibility option (visible by everyone)
- [ ] Private visibility option (visible only by guests)

#### User Rights Management
- [ ] Event creator can control voting rights
- [ ] Option: everyone can vote
- [ ] Option: guests only can vote
- [ ] Option: location + time-based voting (e.g., between 4-6 PM)

### Option B: Music Playlist Editor

#### Basics
- [ ] Service is accessible
- [ ] Service works correctly
- [ ] Multiple users can simultaneously edit playlist
- [ ] Playlist can be played while being modified
- [ ] Concurrency management supported

#### Visibility Management
- [ ] Playlist creator can set playlist visibility
- [ ] Public visibility option (visible by everyone)
- [ ] Private visibility option (visible only by guests)

#### User Rights Management
- [ ] Playlist creator can control edition rights
- [ ] Edition rights properly implemented

### Option C: Music Control Delegation

#### Basics
- [ ] Service is accessible
- [ ] Service works correctly
- [ ] User can link multiple devices to account
- [ ] User can delegate playlist play controls to friend's device
- [ ] Delegation works correctly

---

## 6. Team Work Evaluation

### Role Dispatching and Accountability
- [ ] Project methodology used that allows questioning decisions
- [ ] Project methodology allows questioning priorities
- [ ] Methodology documented (when and how)
- [ ] Coordinator role assigned (supervises project consistency)
- [ ] Backend referent assigned
- [ ] API referent assigned
- [ ] Mobile/UX referent assigned
- [ ] Security referent assigned

### Testing
- [ ] Consistent tests created from the start
- [ ] Tests limit regressions
- [ ] Server layer has specific tests
- [ ] API layer has specific tests
- [ ] Application layer has specific tests
- [ ] Specific services have tests

---

## 7. Bonus Features

Check if any of these are implemented:
- [ ] Offline mode
- [ ] Premium solution
- [ ] IoT integration
- [ ] Multi-platform solution
- [ ] All 3 required functionalities correctly implemented
- [ ] Other relevant solutions (Stats, additional OAuth, etc.)

**Rate from 0 (failed) to 5 (excellent)**

---

## Notes Section

### Issues Found:
- 

### Positive Points:
- 

### Recommendations:
- 

---

## Final Checklist

- [ ] All mandatory requirements met
- [ ] No console errors from student's code (external SDK errors are acceptable)
- [ ] Solution functional and working
- [ ] Evaluation flags checked if needed (empty project, norm flaw, cheating)
- [ ] Defense flag checked
- [ ] Conclusion comment written (max 2048 chars)

---

**Remember:**
- Remain polite, kind, respectful, and constructive
- Highlight problems and discuss them
- Accept different interpretations and listen with open mind
- Grade fairly
- If mandatory part fails even once → grade 0, evaluation stops
- External SDK errors (Google, Deezer, Facebook) are NOT eliminatory
