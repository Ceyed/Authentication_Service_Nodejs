# Authentication_Service
A basic authentication service using NodeJs

<br/>
<br/>

## General TODO:
- [ ] 0.1: A special status for 'expired token, needs to login again'
- [ ] 0.2: All responses should have status code

<br/>
<br/>

## 1. Register
Gets 'username' && 'email' && 'password'
if user registered, return user + token
if not, return false

<br/>

#### TODO
- [x] 1.1: Check if user already registered (email should be unique)
- [x] 1.2: Regex validation for inputs
- [x] 1.3: If user didn't registered, create a new one in database with hashed password and token, then return it
- [x] 1.4: Email validation after registration
- [ ] 1.5: Password Regex Validation: numb3r, special ch@r, UPPER, lower

<br/>
<br/>

## 2. Login
Gets ('username' || 'email') && 'password'
return token if user founded
otherwise return false

<br/>

#### TODO
- [x] 2.1: Check 'saved hashed password' with 'input hashed password', return 'user' with 'token' if they are the same
- [ ] 2.2: Password Regex Validation: numb3r, special ch@r, UPPER, lower

<br/>
<br/>

## 3. Change Password
Gets 'old password' && 'new password'
return true || false

<br/>

#### TODO
- [x] 3.1: 'Old password' and 'new password' should not be identical
- [ ] 3.2: Password Regex Validation: numb3r, special ch@r, UPPER, lower
- [x] 3.3: 'Saved password' and 'hashed old password' should be identical
- [x] 3.4: Save 'hashed new password'

<br/>
<br/>

## 4. Forgot Password
Send user an email containing a link and a code
in either way, after receiving the code, get a new password from user
save 'new hashed password' to database

<br/>

#### TODO
- [x] 4.1: Create temp code and save it in database
- [x] 4.2: Create a validation-link and email it to user along with the code itself
- [ ] 4.3: After receiving the code (in either way) get a new password from user
- [ ] 4.4: Save 'new hashed password' in database
