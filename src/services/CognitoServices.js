import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import {
  REACT_APP_USER_POOL_ID,
  REACT_APP_CLIENT_ID,
  IDENTITY_POOL_ID,
  AWS_REGION,
} from 'react-native-dotenv';

const poolData = {
  UserPoolId: REACT_APP_USER_POOL_ID,
  ClientId: REACT_APP_CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);

// Sign up function
export const signUp = (
  username,
  password,
  email,
  birthdate,
  phonenumber,
  name,
  callback,
) => {
  const attributeList = [];

  const dataEmail = {
    Name: 'email',
    Value: email,
  };
  const attributeEmail = new CognitoUserAttribute(dataEmail);
  attributeList.push(attributeEmail);

  const dataBirthdate = {
    Name: 'birthdate',
    Value: birthdate,
  };
  const attributeBirthdate = new CognitoUserAttribute(dataBirthdate);
  attributeList.push(attributeBirthdate);

  const dataPhonenumber = {
    Name: 'phone_number',
    Value: phonenumber,
  };
  const attributePhonenumber = new CognitoUserAttribute(dataPhonenumber);
  attributeList.push(attributePhonenumber);

  const dataName = {
    Name: 'name',
    Value: name,
  };
  const attributeName = new CognitoUserAttribute(dataName);
  attributeList.push(attributeName);

  userPool.signUp(username, password, attributeList, null, (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
};

// Sign in function
export const signIn = (username, password, callback) => {
  const authenticationData = {
    Username: username,
    Password: password,
  };
  const authenticationDetails = new AuthenticationDetails(authenticationData);
  const userData = {
    Username: username,
    Pool: userPool,
  };
  const cognitoUser = new CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: result => {
      callback(null, result);
    },
    onFailure: err => {
      callback(err, null);
    },
  });
};

// Sign out function
export const signOut = () => {
  const user = userPool.getCurrentUser();
  if (user) {
    user.signOut();
  }
};

// Confirm sign-up function
export const confirmSignUp = (username, code, callback) => {
  const userData = {
    Username: username,
    Pool: userPool,
  };
  const cognitoUser = new CognitoUser(userData);

  cognitoUser.confirmRegistration(code, true, (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
};

// Get current user session function
export const getCurrentUser = callback => {
  const cognitoUser = userPool.getCurrentUser();

  if (cognitoUser) {
    cognitoUser.getSession((err, session) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, session);
      }
    });
  } else {
    callback(new Error('No user is currently signed in.'), null);
  }
};

// Sign in with Google function
/*
  export const signInWithGoogle = (idToken, callback) => {
  const loginMap = {
    'accounts.google.com': idToken,
  };

  const authenticationData = {
    IdentityPoolId: IDENTITY_POOL_ID, // Add your identity pool ID
    Logins: loginMap,
  };

  const AWS = require('aws-sdk');
  AWS.config.region = AWS_REGION; // Your region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials(
    authenticationData,
  );

  AWS.config.credentials.get(err => {
    if (err) {
      callback(err, null);
    } else {
      const credentials = AWS.config.credentials;
      console.log('Successfully logged in with Google:', credentials);
      callback(null, credentials);
    }
  });
};
*/
