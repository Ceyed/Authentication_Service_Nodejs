# Authentication_Service
A basic authentication service using NodeJs

<br/>
<br/>

## General TODO:
- [ ] 0.1: A special status for 'expired token, needs to login again'
- [x] 0.2: All responses should have status code
- [x] 0.3: Make app.js clean, all functions should call one function only
- [x] 0.4: More structure in folders (after TODO #0.3)
- [x] 0.5: Remove 'username' from 'users' table, no need to have 'username'

<br/>

## 1. Register
Gets 'username' && 'email' && 'password'
if user registered, return user + token
if not, return false

Requests           |    Method      |     Input                         |   Returns
-------------------|----------------|-----------------------------------|------------------
register           |    post        |    email, password                |  token or false

<br/>

#### TODO
- [x] 1.1: Check if user already registered (email should be unique)
- [x] 1.2: Regex validation for inputs
- [x] 1.3: If user didn't registered, create a new one in database with hashed password and token, then return it
- [x] 1.4: Email validation after registration
- [x] 1.5: Password Regex Validation: numb3r, special ch@r, UPPER, lower

<br/>
<br/>

## 2. Login
Gets ('username' || 'email') && 'password'
return token if user founded
otherwise return false

Requests           |    Method      |     Input                 |   Returns
-------------------|----------------|---------------------------|------------------
login              |    post        |    email, password        |  token or false

<br/>

#### TODO
- [x] 2.1: Check 'saved hashed password' with 'input hashed password', return 'user' with 'token' if they are the same
- [x] 2.2: Password Regex Validation: numb3r, special ch@r, UPPER, lower

<br/>
<br/>

## 3. Change Password
Gets 'old password' && 'new password'
return true || false

Requests           |    Method      |     Input                             |   Returns
-------------------|----------------|---------------------------------------|------------------
change_password    |    post        |    token, old_password, new_password  |  token or false


<br/>

#### TODO
- [x] 3.1: 'Old password' and 'new password' should not be identical
- [x] 3.2: Password Regex Validation: numb3r, special ch@r, UPPER, lower
- [x] 3.3: 'Saved password' and 'hashed old password' should be identical
- [x] 3.4: Save 'hashed new password'

<br/>
<br/>

## 4. Forgot Password
Send user an email containing a link and a code
in either way, after receiving the code, get a new password from user
save 'new hashed password' to database

Requests           |    Method      |     Input                                                 |   Returns
-------------------|----------------|-----------------------------------------------------------|------------------
forgot_password    |    post        |    email                                                  |  true or false
new_password       |    post        |    resetToken, new password, confirm new password         |  true or false

<br/>

#### TODO
- [x] 4.1: Create temp cypher and save it in database
- [x] 4.2: Create a validation-link and email it to user
- [x] 4.3: After receiving the code, get a new password from user
- [x] 4.4: Save 'new hashed password' in database (if both passwords are identical and strong)
- [x] 4.5: Remove the row in database after password resets
- [x] 4.6: Password Regex Validation: numb3r, special ch@r, UPPER, lower

<br/>
<br/>

## 5. Validate email
Send user an email containing a link and a code
in either way, after receiving the code, email validates

Requests           |    Method      |     Input                     |   Returns
-------------------|----------------|-------------------------------|------------------
send_evc           |    post        |    validation_code, token     |  true or false
validate_email     |    get         |    validation_code, token     |  true or false
validate_email     |    post        |    validation_code, token     |  true or false

<br/>

#### TODO
- [x] 5.1: Create temp code and save it in database
- [x] 5.2: Create a validation-link and email it to user along with the code itself
- [x] 5.3: After receiving the code (in either way) email gets validate
- [x] 5.4: Remove the row in database after email validated

<br/>
<hr/>
<br/>

## In Future:
- Make a blacklist of temp-email services
