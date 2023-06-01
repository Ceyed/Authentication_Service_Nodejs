# Authentication_Service
A basic authentication service using NodeJs

<br/>
<br/>

## General TODO:
- [ ] 0.1: A special status for 'expired token, needs to login again'
- [x] 0.2: All responses should have status code
- [x] 0.3: Add api version to requests
- [x] 0.4: Handle dots in emails in register request

<br/>

## 1. Register
Gets 'username' && 'email' && 'password' <br/>
if user registered, return user + token <br/>
if not, return false <br/>

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
Gets ('username' || 'email') && 'password' <br/>
return token if user founded <br/>
otherwise return false <br/>

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
Gets 'old password' && 'new password' <br/>
return true || false <br/>

Requests           |    Method      |     Input                             |   Returns
-------------------|----------------|---------------------------------------|------------------
change_password    |    post        |    token, old_password, new_password  |  token or false


<br/>

#### TODO
- [x] 3.1: 'Old password' and 'new password' should not be identical
- [x] 3.2: Password Regex Validation: numb3r, special ch@r, UPPER, lower
- [x] 3.3: 'Saved password' and 'hashed old password' should be identical
- [x] 3.4: Save 'hashed new password'
- [x] 3.5: 'confirm password' and it's validation are needed

<br/>
<br/>

## 4. Forgot Password
Send user an email containing a link and a code <br/>
in either way, after receiving the code, get a new password from user <br/>
save 'new hashed password' to database <br/>

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

## 5. Validate email - CAN NOT BE USED
Send user an email containing a link and a code <br/>
in either way, after receiving the code, email validates <br/>

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
<br/>

## 6. Google Auth
Send user will be able to register and login using Google Auth <br/>

Requests           |    Method      |     Input           |   Returns
-------------------|----------------|---------------------|------------------
google_token       |    post        |     accessToken     |  user or false

<br/>

#### TODO
- [x] 6.1: Get user's info using accessToken
- [x] 6.2: Register or login user

<br/>
<br/>

## 7. Authentication using wallet id
Send user will be able to register and login using Google Auth <br/>

Requests           |    Method      |     Input                     |   Returns
-------------------|----------------|-------------------------------|----------------------------
wallet_login       |    post        |     wallet_id                 |  message + nonce or false
wallet_verify      |    post        |     wallet_id & signature     |  user or false

<br/>

#### TODO
- [x] 7.1: Find or create user
- [x] 7.2: Create and save nonce
- [x] 7.3: Create the message and send it to user
- [ ] 7.4: After receiving signature, break it and get wallet id
- [ ] 7.5: If wallet ids are identical, login user

<br/>
<hr/>
<br/>

## In Future:
- Make a blacklist of temp-email services
