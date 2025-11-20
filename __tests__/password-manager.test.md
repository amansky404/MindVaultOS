# Password Manager Test Plan

This document describes the manual testing steps for the password manager functionality.

## Prerequisites
1. MindVault OS application is installed and running
2. Master password has been initialized
3. Database is unlocked

## Test Cases

### Test Case 1: Add New Password
**Steps:**
1. Navigate to Password Manager page
2. Click "Add Password" button
3. Fill in the form:
   - Name: "Test Login"
   - Username: "testuser@example.com"
   - Password: "TestPass123!"
   - URL: "https://example.com"
   - Category: "Personal"
   - Notes: "Test password for example.com"
   - Check "Enable AutoFill"
4. Click "Save" button

**Expected Result:**
- Form submits successfully
- Success message appears
- Modal closes
- New password appears in the password list
- Password is encrypted in the database

### Test Case 2: View Saved Password
**Steps:**
1. Locate the "Test Login" password in the list
2. Click the eye icon next to the password field

**Expected Result:**
- Password is revealed (shows "TestPass123!" instead of bullets)
- Click again to hide password

### Test Case 3: Copy Username
**Steps:**
1. Click the copy icon next to the username

**Expected Result:**
- "Copied to clipboard!" message appears
- Username is copied to clipboard
- Can paste the username elsewhere

### Test Case 4: Copy Password
**Steps:**
1. Click the copy icon next to the password

**Expected Result:**
- "Copied to clipboard!" message appears
- Password is copied to clipboard
- Can paste the password elsewhere

### Test Case 5: Search Password
**Steps:**
1. Type "test" in the search box

**Expected Result:**
- Only passwords matching "test" are shown
- Clear search to show all passwords

### Test Case 6: Filter by Category
**Steps:**
1. Select "Personal" from the category dropdown

**Expected Result:**
- Only passwords in the "Personal" category are shown
- Select "All Categories" to show all passwords

### Test Case 7: Delete Password
**Steps:**
1. Click the trash icon next to "Test Login"
2. Confirm deletion in the prompt

**Expected Result:**
- Confirmation dialog appears
- After confirming, password is deleted
- Password is removed from the list
- Success message appears

### Test Case 8: Form Validation
**Steps:**
1. Click "Add Password"
2. Click "Save" without filling any fields

**Expected Result:**
- Form validation error appears
- Form does not submit
- Required fields are indicated

### Test Case 9: Cancel Add Password
**Steps:**
1. Click "Add Password"
2. Start filling the form
3. Click "Cancel"

**Expected Result:**
- Modal closes
- No password is saved
- Form data is cleared

### Test Case 10: Multiple Passwords
**Steps:**
1. Add 3 different passwords
2. Verify all appear in the list
3. Test search and filter with multiple passwords

**Expected Result:**
- All passwords are saved and displayed
- Search works across all passwords
- Filter works correctly

## Integration Tests

### Test Case 11: Password Persistence
**Steps:**
1. Add a password
2. Lock the database
3. Unlock the database
4. Navigate back to Password Manager

**Expected Result:**
- Password is still present after locking/unlocking
- Data persists across sessions

### Test Case 12: Encrypted Storage
**Steps:**
1. Add a password with sensitive data
2. Use SQLite viewer to check database file
3. Verify password data is encrypted

**Expected Result:**
- Username and password fields are encrypted in database
- Cannot read plaintext credentials from database file
- Only accessible when database is unlocked

## Performance Tests

### Test Case 13: Load Time
**Steps:**
1. Add 50+ passwords
2. Navigate to Password Manager page
3. Measure load time

**Expected Result:**
- Page loads in under 2 seconds
- List renders smoothly
- No UI lag

### Test Case 14: Search Performance
**Steps:**
1. With 50+ passwords in database
2. Type in search box

**Expected Result:**
- Search results appear instantly
- No delay in filtering

## Error Handling Tests

### Test Case 15: Database Locked
**Steps:**
1. Lock the database
2. Try to view Password Manager page

**Expected Result:**
- Appropriate error message
- Redirected to unlock screen or error shown

### Test Case 16: Network Error
**Steps:**
1. Simulate IPC communication failure
2. Try to save a password

**Expected Result:**
- Error message displayed
- User can retry
- No data corruption

## Regression Tests

After any changes to password manager functionality, re-run:
- Test Cases 1-7 (Core functionality)
- Test Case 11 (Persistence)
- Test Case 12 (Security)

## Test Results

| Test Case | Date | Result | Notes |
|-----------|------|--------|-------|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |
| 6 | | | |
| 7 | | | |
| 8 | | | |
| 9 | | | |
| 10 | | | |
| 11 | | | |
| 12 | | | |
| 13 | | | |
| 14 | | | |
| 15 | | | |
| 16 | | | |

## Notes
- All tests should be run in both development and production builds
- Test on all supported platforms (Windows, Linux, macOS)
- Document any issues found during testing
