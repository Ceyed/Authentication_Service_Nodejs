# Authentication Service
A basic authentication service using NodeJs

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
- [ ] 1.4: Email validation after registration
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
They shouldn't be the same
Check 'hashed old password' with 'saved password', then save 'hashed new password'
return true || false

<br/>

#### TODO
- [x] 3.1: 'Old password' and 'new password' should not be identical
- [ ] 3.2: Password Regex Validation: numb3r, special ch@r, UPPER, lower
